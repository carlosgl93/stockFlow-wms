import {
  fetchStock,
  addStock,
  updateStock,
  removeStock,
  getStockById,
} from "./stockApi";
import { APIError, getHumanReadableError } from "shared/Error";
import { queryClient, useQuery, useTranslate } from "utils";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";
import { FirestoreError } from "firebase/firestore";
import { useParams } from "shared/Router";

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
