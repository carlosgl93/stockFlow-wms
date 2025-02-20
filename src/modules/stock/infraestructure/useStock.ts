import {
  fetchStock,
  addStock,
  updateStock,
  removeStock,
  getStockById,
} from "./stockApi";
import { APIError } from "shared/Error";
import { queryClient, useQuery, useTranslate } from "utils";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@chakra-ui/react";
import { FirestoreError } from "firebase/firestore";
import { useParams } from "shared/Router";

export const useStock = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [lastVisible, setLastVisible] = useState<null | string>(null);
  const toast = useToast();
  const { t } = useTranslate();

  const { stockId } = useParams<{ stockId: string }>();

  const { data: stockData, isLoading: isLoadingGetStock } = useQuery({
    queryKey: ["stock", page, pageSize, lastVisible],
    queryFn: () => fetchStock(page, pageSize, lastVisible),
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
      toast({
        title: t("Failed to add stock"),
        description: t(error?.message),
        status: "error",
        duration: 5000,
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
      toast({
        title: t("Failed to update stock"),
        description: t(error?.message),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      throw new APIError(t("Failed to update stock"), error);
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
      toast({
        title: t("Failed to remove stock"),
        description: error?.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      throw new APIError(t("Failed to remove stock"), error);
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
  };
};
