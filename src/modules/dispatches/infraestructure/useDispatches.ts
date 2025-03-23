import {
  fetchDispatches,
  addDispatch,
  updateDispatch,
  removeDispatch,
  getDispatchById,
} from "./dispatchesApi";
import { APIError } from "shared/Error";
import { queryClient, useQuery, useTranslate } from "utils";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@chakra-ui/react";
import { FirestoreError } from "firebase/firestore";
import { useParams } from "shared/Router";

export const useDispatches = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [lastVisible, setLastVisible] = useState<null | string>(null);
  const toast = useToast();
  const { t } = useTranslate();

  const { dispatchId } = useParams<{ dispatchId: string }>();

  const {
    data: dispatchesData,
    // isLoading: isLoadingGetDispatches,
    isFetching: isLoadingGetDispatches,
    status,
  } = useQuery({
    queryKey: ["dispatches", page, pageSize, lastVisible],
    queryFn: () => fetchDispatches(page, pageSize, lastVisible),
  });

  const addDispatchMutation = useMutation(addDispatch, {
    onSuccess: () => {
      queryClient.invalidateQueries(["dispatches"]);
      toast({
        title: t("Dispatch added successfully"),
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    },
    onError: (error: FirestoreError) => {
      toast({
        title: t("Failed to add dispatch"),
        description: t(error?.message),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const updateDispatchMutation = useMutation(updateDispatch, {
    onSuccess: () => {
      queryClient.invalidateQueries(["dispatches"]);
      toast({
        title: t("Dispatch updated successfully"),
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    },
    onError: (error: FirestoreError) => {
      toast({
        title: t("Failed to update dispatch"),
        description: t(error?.message),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      throw new APIError(t("Failed to update dispatch"), error);
    },
  });

  const removeDispatchMutation = useMutation(removeDispatch, {
    onSuccess: () => {
      queryClient.invalidateQueries(["dispatches"]);
      toast({
        title: t("Dispatch removed successfully"),
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    },
    onError: (error: FirestoreError) => {
      toast({
        title: t("Failed to remove dispatch"),
        description: error?.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      throw new APIError(t("Failed to remove dispatch"), error);
    },
  });

  const {
    data: getDispatchByIdData,
    isFetching: isFetchingGetDispatchById,
    isError: isErrorGetDispatchById,
  } = useQuery({
    queryKey: ["dispatch", dispatchId],
    queryFn: () => getDispatchById(dispatchId as string),
    enabled: !!dispatchId,
  });

  return {
    dispatchesData,
    isLoadingGetDispatches,
    addDispatchMutation: addDispatchMutation.mutateAsync,
    isLoadingAddDispatch: addDispatchMutation.isLoading,
    updateDispatchMutation: updateDispatchMutation.mutateAsync,
    isLoadingUpdateDispatch: updateDispatchMutation.isLoading,
    removeDispatchMutation: removeDispatchMutation.mutateAsync,
    isLoadingRemoveDispatch: removeDispatchMutation.isLoading,
    getDispatchByIdData,
    isFetchingGetDispatchById,
    isErrorGetDispatchById,
  };
};
