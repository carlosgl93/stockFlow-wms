import { fetchEntries, addEntry, updateEntry, removeEntry } from "./entriesApi";
import { APIError } from "shared/Error";
import { queryClient, useQuery, useTranslate } from "utils";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@chakra-ui/react";
import { FirestoreError } from "firebase/firestore";

export const useEntries = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [lastVisible, setLastVisible] = useState<null | string>(null);
  const toast = useToast();
  const { t } = useTranslate();

  const { data: entriesData, isLoading: isLoadingGetEntries } = useQuery({
    queryKey: ["entries", page, pageSize, lastVisible],
    queryFn: () => fetchEntries(page, pageSize, lastVisible),
  });

  const addEntryMutation = useMutation(addEntry, {
    onSuccess: () => {
      queryClient.invalidateQueries(["entries"]);
      toast({
        title: t("Entry added successfully"),
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    },
    onError: (error: FirestoreError) => {
      toast({
        title: t("Failed to add entry"),
        description: error?.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      throw new APIError(t("Failed to add entry"), error);
    },
  });

  const updateEntryMutation = useMutation(updateEntry, {
    onSuccess: () => {
      queryClient.invalidateQueries(["entries"]);
      toast({
        title: t("Entry updated successfully"),
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    },
    onError: (error: FirestoreError) => {
      toast({
        title: t("Failed to update entry"),
        description: error?.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      throw new APIError(t("Failed to update entry"), error);
    },
  });

  const removeEntryMutation = useMutation(removeEntry, {
    onSuccess: () => {
      queryClient.invalidateQueries(["entries"]);
      toast({
        title: t("Entry removed successfully"),
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    },
    onError: (error: FirestoreError) => {
      toast({
        title: t("Failed to remove entry"),
        description: error?.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      throw new APIError(t("Failed to remove entry"), error);
    },
  });

  return {
    entriesData,
    isLoadingGetEntries,
    addEntryMutation: addEntryMutation.mutateAsync,
    isLoadingAddEntry: addEntryMutation.isLoading,
    updateEntryMutation: updateEntryMutation.mutateAsync,
    isLoadingUpdateEntry: updateEntryMutation.isLoading,
    removeEntryMutation: removeEntryMutation.mutateAsync,
    isLoadingRemoveEntry: removeEntryMutation.isLoading,
  };
};
