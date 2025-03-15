import { useToast, useDisclosure, IconButton } from "@chakra-ui/react";
import { usePlaces } from "modules/places/infra";
import { useProducts } from "modules/products/infrastructure";
import { IProduct } from "modules/products/types";
import { ISupplier, useSuppliers } from "modules/suppliers";
import { useTransporters } from "modules/transporters/infrastructure";
import { ITransporter } from "modules/transporters/types";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ValidationError } from "shared/Error";
import { useTranslate } from "utils";
import { DispatchFixture } from "utils/fixtures";
import { IDispatch, IDispatchRow } from "../types";
import { useDispatches } from "./useDispatches";
import { Logger } from "utils/logger";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { FlexBox } from "shared/Layout";
import { DeleteIcon } from "@chakra-ui/icons";
import { IProductEntry } from "modules/entries/types";
import { ILot, useLots } from "modules/lots/infraestructure";
import { IStock } from "modules/stock/types";

export const CreateDispatchController = ({
  dispatchToEdit,
}: {
  dispatchToEdit?: IDispatch;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchingSupplier, setIsSearchingSupplier] = useState(false);
  const [isSearchingTransporter, setIsSearchingTransporter] = useState(false);
  const [isSearchingProduct, setIsSearchingProduct] = useState(false);
  const [isSearchingLot, setIsSearchingLot] = useState(false);
  const [searchResults, setSearchedResults] = useState<
    null | (IProduct | ITransporter | ISupplier | IStock)[]
  >(null);
  const [willSpecifyPlace, setWillSpecifyPlace] = useState(true);
  const [addedToDispatch, setAddedToDispatch] = useState<IProductEntry[]>([]);
  const [productId, setProductId] = useState("");

  const toast = useToast();
  const { t } = useTranslate();
  const { getSuppliersData, isLoadingGetSuppliers } = useSuppliers({
    limit: 5,
  });
  const { getTransporters, isLoadingGetTransporters } = useTransporters(5);
  const { products: getProductsData, isFetching } = useProducts(5);
  const { getPlacesData, isLoadingGetPlaces } = usePlaces();

  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
  const [transporters, setTransporters] = useState<ITransporter[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [lots, setLots] = useState<IStock[]>([]);

  const {
    addDispatchMutation,
    updateDispatchMutation,
    isLoadingAddDispatch,
    isLoadingUpdateDispatch,
  } = useDispatches();

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    trigger,
    watch,
    getValues,
    clearErrors,
  } = useForm<IDispatch>();

  const {
    getLotsData,
    isLoadingGetLots,
    getProductLotsData,
    isLoadingGetProductLots,
  } = useLots({
    productId,
    pageSize: 10,
    page: 1,
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpenCreateTransporter,
    onOpen: onOpenCreateTransporter,
    onClose: onCloseCreateTransporter,
  } = useDisclosure();

  const {
    isOpen: isOpenCreateProduct,
    onOpen: onOpenCreateProduct,
    onClose: onCloseCreateProduct,
  } = useDisclosure();

  const handleNewSupplier = useCallback(
    (newSupplier: ISupplier) => {
      setSuppliers((prev) => [...prev, newSupplier]);
      Logger.info("new supplier", [newSupplier]);
      setValue("supplierId", newSupplier.id || "");
      onClose();
    },
    [setValue, onClose]
  );

  const handleNewTransporter = useCallback(
    (newTransporter: ITransporter) => {
      setTransporters((prev) => [...prev, newTransporter]);
      setValue("transporterId", newTransporter.id || "");
      onCloseCreateTransporter();
    },
    [setValue, onCloseCreateTransporter]
  );

  const handleNewProduct = useCallback(
    (newProduct: IProduct) => {
      setProducts((prev) => [...prev, newProduct]);
      setValue("productId", newProduct.id || "");
      onCloseCreateProduct();
    },
    [setValue, onCloseCreateProduct]
  );

  const handleAddProductToDispatch = () => {
    const newDataToDispatch = getValues(); // making the new product entry to add
    const {
      totalUnitsNumber,
      lotId,
      placeId,
      palletNumber,
      heightCMs,
      widthCMs,
    } = newDataToDispatch;
    Logger.info("newDataToDispatch", [newDataToDispatch]);
    if (
      totalUnitsNumber === 0 ||
      totalUnitsNumber === undefined ||
      lotId === "" ||
      placeId === "" ||
      palletNumber === "" ||
      heightCMs === 0 ||
      widthCMs === 0
    ) {
      toast({
        title: "Error",
        description: t("Check the fields, some are missing"),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    } else {
      const newProductToAdd: IProductEntry = {
        id: getValues("productId"),
        unitsNumber: getValues("unitsNumber"),
        looseUnitsNumber: getValues("looseUnitsNumber"),
        totalUnitsNumber: getValues("totalUnitsNumber"),
        lotId: getValues("lotId"),
        placeId: getValues("placeId"),
        palletNumber: getValues("palletNumber"),
        heightCMs: getValues("heightCMs"),
        widthCMs: getValues("widthCMs"),
      };
      const uniqueId = `${newProductToAdd.id}-${newProductToAdd.lotId}-${newProductToAdd.palletNumber}`;
      if (
        !addedToDispatch.find(
          (entry) =>
            `${entry.id}-${entry.lotId}-${entry.palletNumber}` === uniqueId
        )
      ) {
        setAddedToDispatch((prev) => [...prev, newProductToAdd]);
      }
      setValue("lotId", "");
      setValue("placeId", "");
      setValue("palletNumber", "");
      setValue("heightCMs", 0);
      setValue("widthCMs", 0);
      setValue("unitsNumber", 0);
      setValue("looseUnitsNumber", 0);
      setValue("totalUnitsNumber", 0);
      trigger();
    }
  };

  const onSubmit = async (data: IDispatch) => {
    const validation = await trigger();

    if (!validation) {
      toast({
        title: "Error",
        description: `${t(
          "Please fill all the fields"
        )} fields to fill: ${Object.keys(errors).join(", ")}`,
        status: "error",
      });
      return;
    }

    try {
      if (dispatchToEdit) {
        if (!dispatchToEdit.id) {
          throw new ValidationError("Entry to edit has no id");
        }
        await updateDispatchMutation({
          dispatchId: dispatchToEdit.id,
          values: data,
        });
      } else {
        await addDispatchMutation(data);
      }
    } catch (error) {
      let errorMessage = "An unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
      });
    }
  };

  const columns: GridColDef[] = [
    {
      field: "actions",
      headerName: t("Actions"),
      width: 100,
      renderCell: (params: GridRenderCellParams<IDispatch>) => (
        <FlexBox
          gap={2}
          justifyContent={"center"}
          alignContent={"center"}
          h={"100%"}
        >
          {/* <IconButton
            aria-label="View Details"
            icon={<SearchIcon />}
            onClick={notImplemented}
          />
          <IconButton
            aria-label="Edit Entry"
            icon={<EditIcon />}
            onClick={notImplemented}
          /> */}
          {
            <IconButton
              aria-label="Remove Entry"
              icon={<DeleteIcon />}
              onClick={
                () => {}
                // setAddedToEntry((prev) => {
                //   return prev.filter((p) => {
                //     const uniqueId = getProductCompositeId(p);
                //     return uniqueId !== params.id;
                //   });
                // })
              }
            />
          }
        </FlexBox>
      ),
    },
    { field: "extCode", headerName: t("External Code"), width: 150 },
    { field: "intCode", headerName: t("Internal Code"), width: 150 },
    { field: "productName", headerName: t("Product Name"), width: 150 },

    { field: "unitsNumber", headerName: "Units Number", width: 150 },
    {
      field: "looseUnitsNumber",
      headerName: "Loose Units Number",
      width: 150,
    },
    {
      field: "totalUnitsNumber",
      headerName: "Total Units Number",
      width: 150,
    },
  ];

  let rows: IDispatchRow[] = addedToDispatch.reduce((acc, p) => {
    const uniqueId = `${p.id}-${p.lotId}-${p.palletNumber}`;
    if (!acc.find((row) => row.id === uniqueId)) {
      const productInfo = products.find((pr) => pr.id === p.id);
      acc.push({
        id: uniqueId,
        extCode: productInfo?.extCode!,
        intCode: productInfo?.internalCode!,
        productName: productInfo?.name || "",
        unitsNumber: p.unitsNumber,
        looseUnitsNumber: p.looseUnitsNumber,
        totalUnitsNumber: p.totalUnitsNumber,
        lotId: p.lotId,
        palletNumber: p.palletNumber,
      });
    }
    return acc;
  }, [] as IDispatchRow[]);

  useEffect(() => {
    if (dispatchToEdit) {
      Object.keys(dispatchToEdit).forEach((key) => {
        setValue(
          key as keyof IDispatch,
          dispatchToEdit[key as keyof IDispatch]
        );
      });
      trigger();
    } else if (import.meta.env.MODE === "development") {
      const entry = DispatchFixture.toStructure();
      Object.keys(entry).forEach((key) => {
        setValue(key as keyof IDispatch, entry[key as keyof IDispatch]);
      });
      trigger();
    }
  }, [setValue, dispatchToEdit, trigger]);

  useEffect(() => {
    const uniqueSuppliers = [
      ...((searchResults as ISupplier[]) || []),
      ...(getSuppliersData?.suppliers || []),
    ].filter(
      (supplier, index, self) =>
        index === self.findIndex((s) => s.id === supplier.id)
    );
    setSuppliers(uniqueSuppliers);
    setValue("supplierId", uniqueSuppliers[0]?.id || "");
    trigger();
  }, [searchResults, getSuppliersData?.suppliers, isOpen]);

  useEffect(() => {
    const uniqueTransporters = [
      ...((searchResults as ITransporter[]) || []),
      ...(getTransporters || []),
    ].filter(
      (transporter, index, self) =>
        index === self.findIndex((s) => s.id === transporter.id)
    );
    setTransporters(uniqueTransporters);
    setValue("transporterId", uniqueTransporters[0]?.id || "");
    trigger();
  }, [
    searchResults,
    getTransporters,
    isOpenCreateProduct,
    isOpenCreateTransporter,
  ]);

  useEffect(() => {
    const uniqueProducts = [
      ...((searchResults as IProduct[]) || []),
      ...(getProductsData || []),
    ].filter(
      (product, index, self) =>
        index === self.findIndex((s) => s.id === product.id)
    );
    setProducts(uniqueProducts);
    setProductId(uniqueProducts[0]?.id || "");
    setValue("productId", uniqueProducts[0]?.id || "");
    trigger();
  }, [searchResults, getProductsData, isOpenCreateProduct]);

  useEffect(() => {
    const uniqueLots = [...((searchResults as IStock[]) || [])].filter(
      (lot, index, self) => index === self.findIndex((s) => s.id === lot.id)
    );
    setLots(uniqueLots);
    setValue("lotId", uniqueLots[0]?.id || "");
    trigger();
  }, [searchResults, getProductsData, isOpenCreateProduct]);

  useEffect(() => {
    setValue("placeId", getPlacesData?.places[0]?.id || "");
    trigger();
  }, [getPlacesData]);

  useEffect(() => {
    setValue("lotId", getProductLotsData?.lots[0]?.id || "");
    trigger();
  }, [getProductLotsData]);

  useEffect(() => {
    clearErrors();
  }, [
    getSuppliersData,
    getTransporters,
    getProductsData,
    getPlacesData,
    getLotsData,
    getProductLotsData,
  ]);

  Logger.info("logs", {
    suppliers,
    transporters,
    products,
    productId,
    getProductLotsData,
  });

  return {
    isLoading,
    isSearchingSupplier,
    isSearchingTransporter,
    isSearchingProduct,
    searchResults,
    willSpecifyPlace,
    suppliers,
    transporters,
    products,
    handleSubmit,
    control,
    errors,
    trigger,
    watch,
    onSubmit,
    handleNewSupplier,
    handleNewTransporter,
    handleNewProduct,
    onOpen,
    onClose,
    isOpen,
    isOpenCreateTransporter,
    onOpenCreateTransporter,
    onCloseCreateTransporter,
    isOpenCreateProduct,
    onOpenCreateProduct,
    onCloseCreateProduct,
    isLoadingGetSuppliers,
    isLoadingGetTransporters,
    isFetching,
    isLoadingGetPlaces,
    isLoadingAddDispatch,
    isLoadingUpdateDispatch,
    toast,
    t,
    addDispatchMutation,
    updateDispatchMutation,
    setIsSearchingProduct,
    setIsSearchingSupplier,
    setIsSearchingTransporter,
    setSuppliers,
    setIsLoading,
    setTransporters,
    setProducts,
    getPlacesData,
    columns,
    rows,
    handleAddProductToDispatch,
    lots,
    setLots,
    isSearchingLot,
    setIsSearchingLot,
    getProductLotsData,
    isLoadingGetLots,
    isLoadingGetProductLots,
    setProductId,
    setValue,
  };
};
