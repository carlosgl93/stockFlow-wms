import { useMemo, useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import {
  useToast,
  useDisclosure,
  IconButton,
  Box,
  Tooltip,
} from "@chakra-ui/react";
import { useTranslate } from "utils";
import { Logger } from "utils/logger";
import { IDispatch, IDispatchForm, IDispatchRow } from "../types";
import { useDispatches } from "./useDispatches";
import { ISupplier, useSuppliers } from "modules/suppliers";
import { useTransporters } from "modules/transporters/infrastructure";
import { useProducts } from "modules/products/infrastructure";
import { usePlaces } from "modules/places/infra";
import { useLots } from "modules/lots/infraestructure";
import { useLotProductStock } from "modules/lotProduct/infraestructure";

import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { FlexBox } from "shared/Layout";
import { DeleteIcon } from "@chakra-ui/icons";
import { ValidationError, getHumanReadableError } from "shared/Error";
import { DispatchFixture } from "utils/fixtures";
import { IStock } from "modules/stock/types";
import { ITransporter } from "modules/transporters/types";
import { IProduct } from "modules/products/types";
import { IProductEntry } from "modules/entries/types";
import { getProductCompositeId } from "modules/entries/infraestructure";
import { useNavigate } from "shared/Router";
import { useQueryClient } from "@tanstack/react-query";
import { removeDispatch } from "./dispatchesApi";
import { commonTooltipStyles } from "../../products/presentation/ProductsList";

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
  >([]);
  const [showBoxTooltip, setShowBoxTooltip] = useState(false);
  const [showUnitsTooltip, setShowUnitsTooltip] = useState(false);
  const [showTotalTooltip, setShowTotalTooltip] = useState(false);
  const [willSpecifyPlace, setWillSpecifyPlace] = useState(true);
  const [addedToDispatch, setAddedToDispatch] = useState<IProductEntry[]>([]);
  const [productId, setProductId] = useState("");
  const [lotId, setLotId] = useState("");
  const toast = useToast();
  const { t } = useTranslate();
  const { getSuppliersData, isLoadingGetSuppliers } = useSuppliers({});
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const { getTransporters, isLoadingGetTransporters } = useTransporters();
  const { products: getProductsData, isFetching } = useProducts();
  const { getPlacesData, isLoadingGetPlaces } = usePlaces();
  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
  const [transporters, setTransporters] = useState<ITransporter[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [lots, setLots] = useState<IStock[]>([]);
  const [rows, setRows] = useState<IDispatchRow[]>([]);
  // in stock value is used to have a reactive variable that will
  // be used to show the user how the stock is changing
  const [inStockValue, setInStockValue] = useState(0);
  const [removedProductsFromDispatch, setRemovedProductsFromDispatch] =
    useState<IProductEntry[]>([]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors, isValid, dirtyFields },
    trigger,
    watch,
    getValues,
    clearErrors,
    register,
  } = useForm<IDispatchForm>();

  const {
    getLotsData,
    isLoadingGetLots,
    getProductLotsData,
    isLoadingGetProductLots,
  } = useLots({
    productId,
  });

  const {
    totalStockByLotAndProduct,
    isLoadingTotalStockByLotAndProduct,
    isErrorTotalStockByLotAndProduct,
  } = useLotProductStock({
    productId: watch("productId"),
    lotId: watch("lotId"),
  });

  const {
    addDispatchMutation,
    updateDispatchMutation,
    isLoadingAddDispatch,
    isLoadingUpdateDispatch,
  } = useDispatches();

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

  const handleRemoveProductFromDispatch = async (
    params: GridRenderCellParams<IDispatch>
  ) => {
    Logger.info("Removing product from dispatch", {
      params,
    });
    setAddedToDispatch((prev) => {
      return prev.filter((p) => {
        const uniqueId = getProductCompositeId(p);
        return params.id !== uniqueId;
      });
    });
    setRemovedProductsFromDispatch((prev) => {
      const product = addedToDispatch.find(
        (p) => getProductCompositeId(p) === params.id
      );
      if (product) {
        return [...prev, product];
      }
      return prev;
    });
    setInStockValue((prev) => {
      const product = addedToDispatch.find(
        (p) => getProductCompositeId(p) === params.row.id
      );
      if (product) {
        return Number(prev) + Number(product.unitsNumber);
      }
      return Number(prev);
    });
  };

  const validateProductToDispatch = (product: IDispatchForm) => {
    const { totalUnitsNumber, lotId, productId } = product;
    if (!productId) {
      toast({
        title: "Error",
        description: t("Product is required"),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return false;
    }
    if (totalUnitsNumber === 0 || totalUnitsNumber === undefined) {
      toast({
        title: "Error",
        description: t("Total units number is required"),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return false;
    }
    if (lotId === "") {
      toast({
        title: "Error",
        description: t("Lot is required"),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return false;
    }

    return true;
  };

  const handleAddProductToDispatch = async () => {
    await trigger();
    const newDataToDispatch = getValues();

    if (!validateProductToDispatch(newDataToDispatch)) {
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
        unitOfMeasure: selectedProduct?.boxDetails?.unitOfMeasure || "",
        qPerUnit: selectedProduct?.boxDetails?.quantity || 1,
        unitsPerBox: selectedProduct?.boxDetails?.units || 1,
      };
      setInStockValue((prev) => {
        return prev - newProductToAdd.unitsNumber;
      });
      const newCompositeId = getProductCompositeId(newProductToAdd);
      if (
        !addedToDispatch.find((product) => {
          const compositeId = getProductCompositeId(product);
          return compositeId === newCompositeId;
        })
      ) {
        setAddedToDispatch((prev) => [...prev, newProductToAdd]);
      }
      setValue("unitsNumber", 0);
      setValue("looseUnitsNumber", 0);
      setValue("totalUnitsNumber", 0);
      trigger();
    }
  };

  const onSubmit = async (data: IDispatchForm) => {
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

    const dataToSubmit = {
      docType: data.docType,
      supplierId: data.supplierId,
      transporterId: data.transporterId,
      dispatchDate: data.dispatchDate,
      deliveryDate: data.deliveryDate,
      docNumber: data.docNumber,
      dispatchedStatus: data.dispatchedStatus, // Include the new field
      products: addedToDispatch,
      // adding products name to the description
      // the idea is to have a description with the product names
      // and customer and transporter
      description: `${[
        ...new Set(
          addedToDispatch.map(
            (p) => uniqueProducts.find((up) => up.id === p.id)?.name
          )
        ),
      ]}`,
    };

    try {
      if (dispatchToEdit) {
        if (!dispatchToEdit.id) {
          throw new ValidationError("Invalid entry! No id found");
        }
        if (addedToDispatch.length === 0) {
          if (
            window.confirm(
              t(
                "You have removed all products from this dispatch. Do you want to delete the dispatch instead?"
              )
            )
          ) {
            try {
              setIsLoading(true);
              await removeDispatch(dispatchToEdit.id);
              toast({
                title: t("Dispatch deleted"),
                description: t("The dispatch has been deleted successfully."),
                status: "success",
              });
              await queryClient.invalidateQueries({
                queryKey: ["dispatches"],
                exact: false,
              });
              navigate("/dispatches");
            } catch (removeError) {
              toast({
                title: t("Error"),
                description:
                  removeError instanceof Error
                    ? removeError.message
                    : t("Failed to delete dispatch"),
                status: "error",
              });
            } finally {
              setIsLoading(false);
            }
          }
          return;
        }
        await updateDispatchMutation(
          {
            dispatchId: dispatchToEdit.id,
            values: dataToSubmit,
            queryClient,
          },
          {
            onSuccess: async () => {
              await queryClient.invalidateQueries({
                queryKey: ["dispatches"],
              });
            },
          }
        );
      } else {
        await addDispatchMutation(dataToSubmit);
      }
      navigate("/dispatches");
    } catch (error) {
      const errorMessage = getHumanReadableError(error, t);
      toast({
        title: t("Error"),
        description: errorMessage,
        status: "error",
        duration: 8000,
        isClosable: true,
      });
    } finally {
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
          {
            <Tooltip
              label={t("Eliminar producto del despacho")}
              placement="left"
              hasArrow
              sx={{
                bgColor: "red.500",
                ...commonTooltipStyles,
              }}
            >
              <IconButton
                aria-label="Remove Entry"
                icon={<DeleteIcon />}
                sx={{
                  fontSize: "1.5rem",
                }}
                onClick={() => handleRemoveProductFromDispatch(params)}
              />
            </Tooltip>
          }
        </FlexBox>
      ),
    },
    { field: "extCode", headerName: t("Ext Code"), width: 150 },
    { field: "productName", headerName: t("Product Name"), width: 250 },
    { field: "lotId", headerName: t("Lot"), width: 100 },
    { field: "palletNumber", headerName: t("Pallet"), width: 150 },
    { field: "unitsNumber", headerName: t("Units Number"), width: 150 },
    {
      field: "totalUnitsNumber",
      headerName: t("Total Units Number"),
      width: 150,
      renderHeader() {
        return (
          <Box display="flex" justifyContent="center" width="100%">
            {t("Total Liters / Kilos")}
          </Box>
        );
      },
    },
    {
      field: "boxes",
      headerName: t("Total Boxes"),
      width: 150,
    },
  ];

  useEffect(() => {
    const generateRows = () => {
      return addedToDispatch.reduce((acc, p) => {
        const uniqueId = getProductCompositeId(p);
        const unitOfMeasure = p.unitOfMeasure;
        let totalUnitsnumber;
        if (
          unitOfMeasure === "ML" ||
          unitOfMeasure === "Gram" ||
          unitOfMeasure === "C.C"
        ) {
          totalUnitsnumber = (p.unitsNumber * p.qPerUnit) / 1000;
        } else {
          totalUnitsnumber = p.unitsNumber;
        }

        if (!acc.find((row) => row.id === uniqueId)) {
          const productInfo = products.find((pr) => pr.id === p.id);
          console.log("Adding row for product", p);
          acc.push({
            extCode: productInfo?.extCode!,
            intCode: productInfo?.internalCode!,
            id: uniqueId,
            productName:
              products
                .find((pr) => pr.id === p.id)
                ?.name.toLocaleUpperCase("es-CL") || "",
            lotId: p.lotId,
            palletNumber: p.palletNumber,
            unitsNumber: p.unitsNumber,
            looseUnitsNumber: p.looseUnitsNumber,
            totalUnitsNumber: totalUnitsnumber,
            boxes: Number((p.unitsNumber / p.unitsPerBox!).toFixed(0)) || 1,
          });
        }
        return acc;
      }, [] as IDispatchRow[]);
    };

    setRows(generateRows());
  }, [addedToDispatch, products]);

  useEffect(() => {
    // USE EFFECT TO SET THE VALUES OF THE FORM BASED ON THE DISPATCH TO EDIT OR A FIXTURE
    if (dispatchToEdit) {
      Object.keys(dispatchToEdit).forEach((key) => {
        if (key === "products") {
          setAddedToDispatch(dispatchToEdit.products);
        } else {
          setValue(
            key as keyof IDispatchForm,
            // @ts-ignore
            dispatchToEdit[key as keyof IDispatch]
          );
        }
      });
      trigger();
    } else if (import.meta.env.MODE === "development") {
      const entry = DispatchFixture.toStructure();
      Object.keys(entry).forEach((key) => {
        setValue(key as keyof IDispatchForm, entry[key as keyof IDispatchForm]);
      });
      trigger();
    }
  }, [setValue, dispatchToEdit, trigger]);

  useEffect(() => {
    // USE EFFECT TO ONLY RENDER UNIQUE SUPPLIERS AND DISCARD THE REPEATED ONES
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
    // USE EFFECT TO ONLY RENDER UNIQUE TRANSPORTERS AND DISCARD THE REPEATED ONES
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
  }, [searchResults, getTransporters, isOpenCreateTransporter]);

  const uniqueProducts = useMemo(() => {
    return [
      ...((searchResults as IProduct[]) || []),
      ...(getProductsData || []),
    ].filter(
      (product, index, self) =>
        index === self.findIndex((s) => s.id === product.id)
    );
  }, [searchResults, getProductsData]);

  useEffect(() => {
    // USE EFFECT TO ONLY RENDER UNIQUE PRODUCTS AND DISCARD THE REPEATED ONES
    setProducts(uniqueProducts);
    setProductId(uniqueProducts[0]?.id || "");
    setSelectedProduct(uniqueProducts[0] || null);
    setValue("productId", uniqueProducts[0]?.id || "");
    trigger();
  }, [uniqueProducts, isOpenCreateProduct]);

  useEffect(() => {
    // USE EFFECT TO ONLY RENDER UNIQUE LOTS AND DISCARD THE REPEATED ONES
    const uniqueLots = [...((searchResults as IStock[]) || [])].filter(
      (lot, index, self) => index === self.findIndex((s) => s.id === lot.id)
    );
    setLots(uniqueLots);
    setValue("lotId", uniqueLots[0]?.lotId || "");
    trigger();
  }, [searchResults, getProductsData]);

  useEffect(() => {
    // USE EFFECT TO SET THE VALUE OF THE PLACE SELECTOR TO THE FIRST OPTION OF THE DB
    setValue("placeId", getPlacesData?.places[0]?.id || "");
    trigger();
  }, [getPlacesData]);

  useEffect(() => {
    // USE EFFECT TO SET THE VALUE OF THE LOT SELECTOR BASED ON THE JUST SELECTED PRODUCT
    const lotId = getProductLotsData?.lots[0]?.lotId;
    if (!getProductLotsData || !lotId) {
      return;
    }
    setValue("lotId", lotId);
    // setLotId(lotId);
    trigger();
  }, [productId, getProductLotsData]);

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

  useEffect(() => {
    const { unitsNumber, looseUnitsNumber } = getValues();
    if (
      typeof unitsNumber === "number" &&
      typeof looseUnitsNumber === "number"
    ) {
      setValue(
        "totalUnitsNumber",
        watch("unitsNumber") + watch("looseUnitsNumber")
      );
    } else {
      setValue(
        "totalUnitsNumber",
        (parseInt(watch("unitsNumber") as unknown as string) || 0) +
          (parseInt(watch("looseUnitsNumber") as unknown as string) || 0)
      );
    }
  }, [watch("looseUnitsNumber"), watch("unitsNumber")]);

  const unitsTooltipLabel = `${t(
    "Each unit is made up of"
  )} ${selectedProduct?.boxDetails?.container.toLowerCase()} ${
    selectedProduct?.boxDetails!.quantity
  } ${t(selectedProduct?.boxDetails?.unitOfMeasure || "").toLowerCase()}`;

  const looseUnitsTooltipLabel = `${t(
    "Each unit is made up of"
  )} ${selectedProduct?.boxDetails?.container.toLowerCase()} ${t("of")} ${
    selectedProduct?.boxDetails!.quantity
  } ${t(selectedProduct?.boxDetails?.unitOfMeasure || "").toLowerCase()}`;

  useEffect(() => {
    if (!totalStockByLotAndProduct?.unitsNumber) {
      setInStockValue(0);
    }
    if (totalStockByLotAndProduct?.unitsNumber) {
      setInStockValue(totalStockByLotAndProduct.unitsNumber);
    }
  }, [totalStockByLotAndProduct?.unitsNumber]);

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
    setLotId,
    totalStockByLotAndProduct,
    isLoadingTotalStockByLotAndProduct,
    isErrorTotalStockByLotAndProduct,
    productId,
    showBoxTooltip,
    setShowBoxTooltip,
    showUnitsTooltip,
    setShowUnitsTooltip,
    showTotalTooltip,
    setShowTotalTooltip,
    unitsTooltipLabel,
    looseUnitsTooltipLabel,
    selectedProduct,
    setSelectedProduct,
    register,
    inStockValue,
  };
};
