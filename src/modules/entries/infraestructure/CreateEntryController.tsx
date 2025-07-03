import { Box, IconButton, Tooltip, useDisclosure } from "@chakra-ui/react";
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
import {
  GridColDef,
  GridRenderCellParams,
  GridRowParams,
} from "@mui/x-data-grid";
import { DeleteIcon } from "@chakra-ui/icons";
import { getProductCompositeId } from "./getProductCompositeId";
import { usePlaces } from "modules/places/infra";
import { Logger } from "utils/logger";
import { useQueryClient } from "@tanstack/react-query";
import { commonTooltipStyles } from "../../products/presentation/ProductsList";
import { getHumanReadableError } from "shared/Error";

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

  const { getSuppliersData, isLoadingGetSuppliers } = useSuppliers({});
  const { getTransporters, isLoadingGetTransporters } = useTransporters();
  const { products: getProductsData, isFetching } = useProducts();
  const { getPlacesData, isLoadingGetPlaces } = usePlaces();

  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
  const [transporters, setTransporters] = useState<ITransporter[]>([]);

  const [products, setProducts] = useState<IProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [removedProductsFromEntry, setRemovedProductsFromEntry] = useState<
    IProductEntry[]
  >([]);
  const [rows, setRows] = useState<IEntryRow[]>([]);
  const queryClient = useQueryClient();

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
  } = useForm<IEntryForm>({
    defaultValues: {
      looseUnitsNumber: 0,
    },
  });
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
    const { id, supplierId, docNumber, transporterId, entryDate } = data;
    return {
      id,
      supplierId,
      docNumber,
      transporterId,
      entryDate,
      description: `${[
        ...new Set(
          addedToEntry.map((p) => products.find((up) => up.id === p.id)?.name)
        ),
      ]
        .filter(Boolean)
        .join(", ")}`,
      products: addedToEntry.map((p) => ({
        ...p,
        lotId: p.lotId.toLowerCase(),
      })),
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
          queryClient,
        });
      } else {
        await addEntryMutation(dataToSave);
      }
    } catch (error) {
      const errorMessage = getHumanReadableError(error, t);
      toast({
        title: t("Error"),
        description: errorMessage,
        status: "error",
        duration: 8000,
        isClosable: true,
      });
    }
  };

  const handleRowClick = (params: GridRowParams) => {
    const clickedRowId = params.row.id as string; // Assuming 'id' in your rows is the uniqueId like `${p.id}-${p.lotId}-${p.palletNumber}`

    // Find the product in addedToEntry that corresponds to the clicked row
    // The uniqueId for rows is created as `${p.id}-${p.lotId}-${p.palletNumber}`
    const productEntry = addedToEntry.find(
      (p) => getProductCompositeId(p) === clickedRowId
    );

    if (productEntry) {
      setValue("productId", productEntry.id);
      setValue("lotId", productEntry.lotId);
      setValue("placeId", productEntry.placeId || "");
      setValue(
        "expirityDate",
        productEntry.expirityDate || new Date().toISOString()
      );
      setValue("palletNumber", productEntry.palletNumber);
      setValue("unitsNumber", productEntry.unitsNumber);
      setValue("looseUnitsNumber", productEntry.looseUnitsNumber || 0);
      // Recalculate or set totalUnitsNumber based on your logic
      // For simplicity, directly setting it from productEntry, adjust as needed
      setValue("totalUnitsNumber", productEntry.totalUnitsNumber || 0);

      // Update selectedProduct state if necessary
      const productDetails = products.find((p) => p.id === productEntry.id);
      if (productDetails) {
        setSelectedProduct(productDetails);
      }
      trigger(); // Optionally trigger validation or re-render
    }
  };

  useEffect(() => {
    if (entryToEdit) {
      (Object.keys(entryToEdit) as (keyof IEntry)[]).forEach((key) => {
        if (key !== "products") {
          setValue(key, entryToEdit[key]);
        }
      });
      trigger();
    } else if (import.meta.env?.MODE === "development") {
      // const entry = EntryFixture.toStructure();
      // (Object.keys(entry) as (keyof IEntry)[]).forEach((key) => {
      //   if (key !== "products") {
      //     setValue(key, entry[key]);
      //   }
      // });
      // trigger();
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

    // Only set the first product as default if no product is currently selected
    // or if we're dealing with search results
    const currentProductId = watch("productId");
    const shouldUpdateProduct =
      !currentProductId || (searchResults as IProduct[])?.length > 0;

    if (shouldUpdateProduct && uniqueProducts.length > 0) {
      setValue("productId", uniqueProducts[0]?.id || "");
      setSelectedProduct(uniqueProducts[0] || null);
    }

    // If we have a current product ID, make sure selectedProduct is in sync
    if (currentProductId && uniqueProducts.length > 0) {
      const currentProduct = uniqueProducts.find(
        (p) => p.id === currentProductId
      );
      if (currentProduct) {
        setSelectedProduct(currentProduct);
      }
    }

    trigger();
  }, [
    searchResults,
    getProductsData,
    isOpenCreateProduct,
    setValue,
    watch,
    trigger,
    setSelectedProduct,
  ]);

  useEffect(() => {
    setValue("placeId", getPlacesData?.places[0]?.id || "");
    trigger();
  }, [getPlacesData]);

  useEffect(() => {
    if (entryToEdit?.products) {
      entryToEdit.products.forEach((p) => {
        setAddedToEntry((prev) => {
          const existingEntry = prev.find(
            (entry) => entry.id === p.id && entry.lotId === p.lotId
            // entry.palletNumber === p.palletNumber
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

  useEffect(() => {
    const generateRows = () => {
      return addedToEntry.reduce((acc, p) => {
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
          acc.push({
            id: uniqueId,
            productName:
              products
                .find((pr) => pr.id === p.id)
                ?.name.toLocaleUpperCase("es-CL") || "",
            lot: p.lotId,
            place:
              getPlacesData?.places.find((pl) => pl.id === p.placeId)?.name ||
              "No se especificó",
            palletNumber: p.palletNumber,
            expirityDate: p.expirityDate || "",
            unitsNumber: p.unitsNumber,
            looseUnitsNumber: p.looseUnitsNumber,
            totalUnitsNumber: totalUnitsnumber,
            boxes: Number((p.unitsNumber / p.unitsPerBox!).toFixed(0)) || 1,
          });
        }
        return acc;
      }, [] as IEntryRow[]);
    };

    setRows(generateRows());
  }, [addedToEntry, products, getPlacesData?.places]);

  const columns: GridColDef[] = [
    {
      field: "actions",
      headerName: t("Actions"),
      width: 75,
      renderCell: (params: GridRenderCellParams<IEntry>) => (
        <Box
          display="flex"
          gap={2}
          justifyContent={"center"}
          alignContent={"center"}
          h={"100%"}
        >
          {
            <Tooltip
              label={t("Eliminar producto del ingreso")}
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
                onClick={() => handleRemoveProductFromEntry(params)}
              />
            </Tooltip>
          }
        </Box>
      ),
    },
    { field: "productName", headerName: t("Product"), width: 150 },
    { field: "lot", headerName: t("Lot"), width: 100 },
    { field: "place", headerName: t("Place"), width: 100 },
    {
      field: "expirityDate",
      headerName: t("Expiry Date"),
      width: 150,
      renderCell: (params) => {
        const date = new Date(params.value);
        return (
          <Box display="flex" justifyContent="center" width="100%">
            {date.toLocaleDateString("es-CL", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })}
          </Box>
        );
      },
    },
    { field: "palletNumber", headerName: t("Pallet Number"), width: 100 },
    { field: "unitsNumber", headerName: t("Units Number"), width: 100 },
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

  const validateProductToEnter = (product: IEntryForm) => {
    const { totalUnitsNumber, lotId, expirityDate, productId } = product;
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

    if (!expirityDate) {
      toast({
        title: "Error",
        description: t("Expiry date is required"),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return false;
    }

    return true;
  };

  const handleRemoveProductFromEntry = async (
    params: GridRenderCellParams<IEntry>
  ) => {
    Logger.info("Removing product from entry", {
      params,
    });
    setAddedToEntry((prev) => {
      return prev.filter((p) => {
        const uniqueId = getProductCompositeId(p);
        return params.id !== uniqueId;
      });
    });
    setRemovedProductsFromEntry((prev: IProductEntry[]) => {
      const product = addedToEntry.find(
        (p) => getProductCompositeId(p) === params.id
      );
      if (product) {
        return [...prev, product];
      }
      return prev;
    });
  };

  const handleAddProductToEntry = () => {
    const newDataToEntry = getValues();

    if (validateProductToEnter(newDataToEntry)) {
      const newProductToAdd: IProductEntry = {
        id: getValues("productId"),
        unitsNumber: getValues("unitsNumber"),
        looseUnitsNumber: getValues("looseUnitsNumber"),
        totalUnitsNumber: getValues("totalUnitsNumber"),
        lotId: getValues("lotId"),
        placeId: getValues("placeId"),
        expirityDate: getValues("expirityDate"),
        palletNumber: getValues("palletNumber"),
        description: "",
        unitOfMeasure: selectedProduct?.boxDetails?.unitOfMeasure || "",
        qPerUnit: selectedProduct?.boxDetails?.quantity || 1,
        unitsPerBox: selectedProduct?.boxDetails?.units || 1,
      };
      const uniqueId = getProductCompositeId(newProductToAdd);
      if (
        !addedToEntry.find((product) => {
          const compositeId = getProductCompositeId(product);
          compositeId === uniqueId;
        })
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
    handleRowClick,
  };
};
