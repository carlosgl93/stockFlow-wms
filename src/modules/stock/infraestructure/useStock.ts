import {
  fetchStock,
  addStock,
  updateStock,
  removeStock,
  getStockById,
  fetchAllStock,
} from "./stockApi";
import { APIError, getHumanReadableError } from "shared/Error";
import { queryClient, useQuery, useTranslate } from "utils";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";
import { FirestoreError } from "firebase/firestore";
import { useParams } from "shared/Router";
import * as XLSX from "xlsx";
import { Logger } from "utils/logger";

export const useStock = () => {
  const toast = useToast();
  const { t } = useTranslate();

  const { stockId } = useParams<{ stockId: string }>();

  const { data: stockData, isLoading: isLoadingGetStock } = useQuery({
    queryKey: ["stock"],
    queryFn: fetchStock,
  });

  const addStockMutation = useMutation(addStock, {
    onSuccess: () => {
      queryClient.invalidateQueries(["stock"]);
      toast({
        title: t("Stock added successfully"),
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    },
    onError: (error: FirestoreError) => {
      const errorMessage = getHumanReadableError(error, t);
      toast({
        title: t("Failed to add stock"),
        description: errorMessage,
        status: "error",
        duration: 8000,
        isClosable: true,
      });
    },
  });

  const updateStockMutation = useMutation(updateStock, {
    onSuccess: () => {
      queryClient.invalidateQueries(["stock"]);
      toast({
        title: t("Stock updated successfully"),
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    },
    onError: (error: FirestoreError) => {
      const errorMessage = getHumanReadableError(error, t);
      toast({
        title: t("Failed to update stock"),
        description: errorMessage,
        status: "error",
        duration: 8000,
        isClosable: true,
      });
      throw new APIError(errorMessage, error);
    },
  });

  const removeStockMutation = useMutation(removeStock, {
    onSuccess: () => {
      queryClient.invalidateQueries(["stock"]);
      toast({
        title: t("Stock removed successfully"),
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    },
    onError: (error: FirestoreError) => {
      const errorMessage = getHumanReadableError(error, t);
      toast({
        title: t("Failed to remove stock"),
        description: errorMessage,
        status: "error",
        duration: 8000,
        isClosable: true,
      });
      throw new APIError(errorMessage, error);
    },
  });

  const {
    data: stockByIdData,
    isFetching: isFetchingGetStock,
    isError: isErrorGetStock,
  } = useQuery({
    queryKey: ["getStockById", stockId],
    queryFn: () => getStockById(stockId as string),
    enabled: !!stockId,
  });

  const handleDownloadAllStock = async () => {
    try {
      const allStockData = await fetchAllStock();
      if (!allStockData || allStockData.length === 0) {
        toast({
          title: t("No stock data available for export"),
          status: "info",
          duration: 5000,
        });
        return;
      }
      const xlColumns = [
        { header: "Lote", key: "lotId" },
        { header: "Producto", key: "product.name" },
        { header: "Units Number", key: "unitsNumber" },
        { header: "Loose Units Number", key: "looseUnitsNumber" },
        { header: "Total Units Number", key: "totalUnitsNumber" },
        { header: "Lot ID", key: "lotId" },
        { header: "Place ID", key: "placeId" },
        { header: "Expirity Date", key: "expirityDate" },
        { header: "Pallet Number", key: "palletNumber" },
        { header: "Unit of Measure", key: "unitOfMeasure" },
        { header: "Q per Unit", key: "qPerUnit" },
        { header: "Units per Box", key: "unitsPerBox" },
      ];

      // using xlsx package to download all stock data
      const worksheet = XLSX.utils.json_to_sheet(allStockData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Stock Data");
      XLSX.writeFile(workbook, "stock_data.xlsx");
    } catch (error) {
      Logger.error("Failed to download all stock data", [error]);
      toast({
        title: t("Failed to download all stock data"),
        description: getHumanReadableError(error, t),
        status: "error",
        duration: 8000,
        isClosable: true,
      });
    }
  };

  return {
    stockData,
    isLoadingGetStock,
    addStockMutation: addStockMutation.mutateAsync,
    isLoadingAddStock: addStockMutation.isLoading,
    updateStockMutation: updateStockMutation.mutateAsync,
    isLoadingUpdateStock: updateStockMutation.isLoading,
    removeStockMutation: removeStockMutation.mutateAsync,
    isLoadingRemoveStock: removeStockMutation.isLoading,
    stockByIdData,
    isFetchingGetStock,
    isErrorGetStock,
    handleDownloadAllStock,
  };
};
