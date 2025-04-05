import { Box, IconButton, useDisclosure } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useEffect, useState, useCallback } from "react";
import { useEntries } from "./useEntries";
import { useToast } from "shared/Toast";
import {
  EntryDTO,
  IEntry,
  IEntryForm,
  IEntryRow,
  IProductEntry,
} from "../types";
import { useTranslate } from "utils";
import { useSuppliers, ISupplier } from "modules/suppliers";
import { EntryFixture } from "utils/fixtures";
import { IProduct } from "modules/products/types";
import { useProducts } from "modules/products/infrastructure";
import { ITransporter } from "modules/transporters/types";
import { useTransporters } from "modules/transporters/infrastructure";
import { ValidationError } from "shared/Error";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { DeleteIcon } from "@chakra-ui/icons";
import { getProductCompositeId } from "./getProductCompositeId";
import { usePlaces } from "modules/places/infra";

export const CreateEntryController = ({
  entryToEdit,
}: {
  entryToEdit?: IEntry | null;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchingSupplier, setIsSearchingSupplier] = useState(false);
  const [isSearchingTransporter, setIsSearchingTransporter] = useState(false);
  const [isSearchingProduct, setIsSearchingProduct] = useState(false);
  const [searchResults, setSearchedResults] = useState<
    null | (IProduct | ITransporter | ISupplier)[]
  >(null);
  const [addedToEntry, setAddedToEntry] = useState<IProductEntry[]>([]);
  const [willSpecifyPlace, setWillSpecifyPlace] = useState(true);

  const { getSuppliersData, isLoadingGetSuppliers } = useSuppliers({
    limit: 5,
  });
  const { getTransporters, isLoadingGetTransporters } = useTransporters(5);
  const { products: getProductsData, isFetching } = useProducts(5);
  const { getPlacesData, isLoadingGetPlaces } = usePlaces();

  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
  const [transporters, setTransporters] = useState<ITransporter[]>([]);

  const [products, setProducts] = useState<IProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);

  const {
    addEntryMutation,
    updateEntryMutation,
    isLoadingAddEntry,
    isLoadingUpdateEntry,
  } = useEntries();

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    trigger,
    watch,
    getValues,
    register,
  } = useForm<IEntryForm>();
  const toast = useToast();
  const { t } = useTranslate();
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

  const makeEntryFromForm = (data: IEntry) => {
    const { id, supplierId, docNumber, transporterId, description } = data;
    return {
      id,
      supplierId,
      docNumber,
      transporterId,
      description: `${[
        ...new Set(
          addedToEntry.map((p) => products.find((up) => up.id === p.id)?.name)
        ),
      ]
        .filter(Boolean)
        .join(", ")} - ${
        suppliers.find((s) => s.id === getValues("supplierId"))?.company
      } - ${
        transporters.find((t) => t.id === getValues("transporterId"))?.name
      }`,
      productsToEnter: addedToEntry,
    };
  };

  const onSubmit = async (data: IEntry) => {
    const validation = await trigger();

    if (!addedToEntry?.length) {
      toast({
        title: "Error",
        description: `${t("Please add products to the entry")}`,
        status: "error",
      });
      return;
    }

    if (!validation) {
      toast({
        title: "Error",
        description: `${t(
          "Please check the fields"
        )} fields to fill: ${Object.keys(errors).join(", ")}`,
        status: "error",
      });
      return;
    }

    const dataToSave: EntryDTO = makeEntryFromForm(data);

    try {
      if (entryToEdit) {
        if (!entryToEdit.id) {
          throw new ValidationError("Entry to edit has no id");
        }
        await updateEntryMutation({
          entryId: entryToEdit.id,
          values: dataToSave,
        });
      } else {
        await addEntryMutation(dataToSave);
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

  useEffect(() => {
    if (entryToEdit) {
      (Object.keys(entryToEdit) as (keyof IEntry)[]).forEach((key) => {
        if (key !== "productsToEnter") {
          setValue(key, entryToEdit[key]);
        }
      });
      trigger();
    } else if (import.meta.env?.MODE === "development") {
      const entry = EntryFixture.toStructure();
      (Object.keys(entry) as (keyof IEntry)[]).forEach((key) => {
        if (key !== "productsToEnter") {
          setValue(key, entry[key]);
        }
      });
      trigger();
    }
  }, [setValue, entryToEdit, trigger]);

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
    setValue("productId", uniqueProducts[0]?.id || "");
    setSelectedProduct(uniqueProducts[0] || null);
    trigger();
  }, [searchResults, getProductsData, isOpenCreateProduct]);

  useEffect(() => {
    setValue("placeId", getPlacesData?.places[0]?.id || "");
    trigger();
  }, [getPlacesData]);

  useEffect(() => {
    if (entryToEdit?.productsToEnter) {
      entryToEdit.productsToEnter.forEach((p) => {
        setAddedToEntry((prev) => {
          const existingEntry = prev.find(
            (entry) =>
              entry.id === p.id &&
              entry.lotId === p.lotId &&
              entry.palletNumber === p.palletNumber
          );
          if (!existingEntry) {
            return [...prev, p];
          }
          return prev;
        });
      });
    }
  }, [entryToEdit]);

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

  let rows: IEntryRow[] = addedToEntry.reduce((acc, p) => {
    const uniqueId = `${p.id}-${p.lotId}-${p.palletNumber}`;
    if (!acc.find((row) => row.id === uniqueId)) {
      acc.push({
        id: uniqueId,
        productName: products.find((pr) => pr.id === p.id)?.name || "",
        lot: p.lotId,
        palletNumber: p.palletNumber,
        expirityDate: p.expirityDate || "",
        unitsNumber: p.unitsNumber,
        looseUnitsNumber: p.looseUnitsNumber,
        totalUnitsNumber: p.totalUnitsNumber,
      });
    }
    return acc;
  }, [] as IEntryRow[]);

  const columns: GridColDef[] = [
    {
      field: "actions",
      headerName: t("Actions"),
      width: 100,
      renderCell: (params: GridRenderCellParams<IEntry>) => (
        <Box
          display="flex"
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
              onClick={() =>
                setAddedToEntry((prev) => {
                  return prev.filter((p) => {
                    const uniqueId = getProductCompositeId(p);
                    return uniqueId !== params.id;
                  });
                })
              }
            />
          }
        </Box>
      ),
    },
    { field: "productName", headerName: "Product", width: 150 },
    { field: "lot", headerName: "Lot", width: 150 },
    { field: "expirityDate", headerName: "Expiry Date", width: 150 },
    { field: "palletNumber", headerName: "Pallet Number", width: 150 },
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

  const handleAddProductToEntry = () => {
    const newDataToEntry = getValues(); // making the new product entry to add
    const {
      totalUnitsNumber,
      lotId,
      placeId,
      expirityDate,
      palletNumber,
      heightCMs,
      widthCMs,
    } = newDataToEntry;
    if (
      totalUnitsNumber === 0 ||
      totalUnitsNumber === undefined ||
      lotId === "" ||
      placeId === "" ||
      expirityDate === "" ||
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
        expirityDate: getValues("expirityDate"),
        palletNumber: getValues("palletNumber"),
        heightCMs: getValues("heightCMs"),
        widthCMs: getValues("widthCMs"),
        description: "",
      };
      const uniqueId = `${newProductToAdd.id}-${newProductToAdd.lotId}-${newProductToAdd.palletNumber}`;
      if (
        !addedToEntry.find(
          (entry) =>
            `${entry.id}-${entry.lotId}-${entry.palletNumber}` === uniqueId
        )
      ) {
        setAddedToEntry((prev) => [...prev, newProductToAdd]);
      }
      setValue("lotId", "");
      setValue("placeId", "");
      setValue("expirityDate", "");
      setValue("palletNumber", "");
      setValue("heightCMs", 0);
      setValue("widthCMs", 0);
      setValue("unitsNumber", 0);
      setValue("looseUnitsNumber", 0);
      setValue("totalUnitsNumber", 0);
      trigger();
    }
  };

  return {
    isLoading,
    setIsLoading,
    isSearchingSupplier,
    setIsSearchingSupplier,
    isSearchingTransporter,
    setIsSearchingTransporter,
    isSearchingProduct,
    setIsSearchingProduct,
    searchResults,
    setSearchedResults,
    addedProducts: addedToEntry,
    setAddedProducts: setAddedToEntry,
    willSpecifyPlace,
    setWillSpecifyPlace,
    getSuppliersData,
    isLoadingGetSuppliers,
    getTransporters,
    isLoadingGetTransporters,
    getProductsData,
    isFetching,
    getPlacesData,
    isLoadingGetPlaces,
    suppliers,
    setSuppliers,
    transporters,
    setTransporters,
    products,
    setProducts,
    addEntryMutation,
    updateEntryMutation,
    isLoadingAddEntry,
    isLoadingUpdateEntry,
    handleSubmit,
    control,
    setValue,
    errors,
    trigger,
    watch,
    toast,
    t,
    isOpen,
    onOpen,
    onClose,
    isOpenCreateTransporter,
    onOpenCreateTransporter,
    onCloseCreateTransporter,
    handleNewTransporter,
    isOpenCreateProduct,
    onOpenCreateProduct,
    onCloseCreateProduct,
    handleNewProduct,
    handleNewSupplier,
    onSubmit,
    columns,
    rows,
    addedToEntry,
    setAddedToEntry,
    getValues,
    handleAddProductToEntry,
    register,
    selectedProduct,
    setSelectedProduct,
  };
};
