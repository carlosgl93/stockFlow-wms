import {
  fetchEntries,
  addEntry,
  updateEntry,
  removeEntry,
  getEntryById,
} from "./entriesApi";
import { APIError } from "shared/Error";
import { queryClient, useQuery, useRedirect, useTranslate } from "utils";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@chakra-ui/react";
import { FirestoreError } from "firebase/firestore";
import { useParams } from "shared/Router";

export const useEntries = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [lastVisible, setLastVisible] = useState<null | string>(null);
  const toast = useToast();
  const { t } = useTranslate();
  const redirect = useRedirect();

  const { entryId } = useParams<{ entryId: string }>();

  const { data: entriesData, isLoading: isLoadingGetEntries } = useQuery({
    queryKey: ["entries", page, pageSize, lastVisible],
    queryFn: () => fetchEntries(page, pageSize, lastVisible),
  });

  const addEntryMutation = useMutation(addEntry, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(["entries"]);
      toast({
        title: t("Entry added successfully"),
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      redirect(`/entries`);
    },
    onError: (error: FirestoreError) => {
      toast({
        title: t("Failed to add entry"),
        description: t(error?.message),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
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
        description: t(error?.message),
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

  const {
    data: getEntryByIdData,
    isFetching: isFetchingGetEntryById,
    isError: isErrorgetEntryById,
  } = useQuery({
    queryKey: ["entry", entryId],
    queryFn: () => getEntryById(entryId as string),
    enabled: !!entryId,
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
    getEntryByIdData,
    isFetchingGetEntryById,
    isErrorgetEntryById,
  };
};
