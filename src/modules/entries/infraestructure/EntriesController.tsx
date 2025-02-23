import { Box, IconButton, useDisclosure } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useEffect, useState, useCallback } from "react";
import { useEntries } from "./useEntries";
import { useNotImplementedYetToast, useToast } from "shared/Toast";
import { IEntry, IEntryRow } from "../types";
import { useTranslate } from "utils";
import { Logger } from "utils/logger";
import { useSuppliers, ISupplier } from "modules/suppliers";
import { getLots, usePlaces } from "modules/lots/infraestructure";
import { EntryFixture } from "utils/fixtures";
import { IProduct } from "modules/products/types";
import { useProducts } from "modules/products/infrastructure";
import { ITransporter } from "modules/transporters/types";
import { useTransporters } from "modules/transporters/infrastructure";
import { ValidationError } from "shared/Error";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { SearchIcon, EditIcon, DeleteIcon, TimeIcon } from "@chakra-ui/icons";

export const EntriesController = ({
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
  const [addedToEntry, setAddedToEntry] = useState<IEntry[]>([]);
  const [willSpecifyPlace, setWillSpecifyPlace] = useState(true);

  const { getSuppliersData, isLoadingGetSuppliers } = useSuppliers(5);
  const { getTransporters, isLoadingGetTransporters } = useTransporters(5);
  const { products: getProductsData, isFetching } = useProducts(5);
  const { getPlacesData, isLoadingGetPlaces } = usePlaces();

  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
  const [transporters, setTransporters] = useState<ITransporter[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const notImplemented = useNotImplementedYetToast();

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
  } = useForm<IEntry>();
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

  const onSubmit = async (data: IEntry) => {
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
      if (entryToEdit) {
        if (!entryToEdit.id) {
          throw new ValidationError("Entry to edit has no id");
        }
        await updateEntryMutation({ entryId: entryToEdit.id, values: data });
      } else {
        await addEntryMutation(data);
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
      Object.keys(entryToEdit).forEach((key) => {
        setValue(key as keyof IEntry, entryToEdit[key as keyof IEntry]);
      });
      trigger();
    } else if (import.meta.env?.MODE === "development") {
      const entry = EntryFixture.toStructure();
      Object.keys(entry).forEach((key) => {
        setValue(key as keyof IEntry, entry[key as keyof IEntry]);
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
    trigger();
  }, [searchResults, getProductsData, isOpenCreateProduct]);

  useEffect(() => {
    setValue("placeId", getPlacesData?.places[0]?.id || "");
    trigger();
  }, [getPlacesData]);

  Logger.info("adde dproducts ", addedToEntry);

  let rows: IEntryRow[] = addedToEntry.map((p, index) => ({
    id: index + 1,
    productName: products.find((pr) => pr.id === p.productId)?.name || "",
    lot: p.lotId,
    palletNumber: p.palletNumber,
    expirityDate: p.expirityDate,
    unitsNumber: p.unitsNumber,
    looseUnitsNumber: p.looseUnitsNumber,
    totalUnitsNumber: p.totalUnitsNumber,
  }));
  Logger.info("ROWS", rows);

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
          <IconButton
            aria-label="View Details"
            icon={<SearchIcon />}
            onClick={notImplemented}
          />
          <IconButton
            aria-label="Edit Entry"
            icon={<EditIcon />}
            onClick={notImplemented}
          />
          {/* {!isLoadingRemoveEntry ? (
             <IconButton
               aria-label="Remove Entry"
               icon={<DeleteIcon />}
               onClick={() => removeEntryMutation(params.row.id || "")}
             />
           ) : (
             <IconButton
               aria-label="Remove Entry"
               icon={<TimeIcon />}
               onClick={() => removeEntryMutation(params.row.id || "")}
             />
           )} */}
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
  };
};
