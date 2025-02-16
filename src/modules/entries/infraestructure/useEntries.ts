import { fetchEntries, addEntry, updateEntry } from "./entriesApi";
import { APIError } from "shared/Error";
import { queryClient, useQuery } from "utils";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

export const useEntries = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [lastVisible, setLastVisible] = useState<null | string>(null);

  const { data: entriesData, isLoading: isLoadingGetEntries } = useQuery({
    queryKey: ["entries"],
    queryFn: fetchEntries,
  });

  const addEntryMutation = useMutation(addEntry, {
    onSuccess: () => {
      queryClient.invalidateQueries(["entries"]);
    },
    onError: (error) => {
      throw new APIError("Failed to add entry", error);
    },
  });

  const updateEntryMutation = useMutation(updateEntry, {
    onSuccess: () => {
      queryClient.invalidateQueries(["entries"]);
    },
    onError: (error) => {
      throw new APIError("Failed to update entry", error);
    },
  });

  return {
    entriesData,
    isLoadingGetEntries,
    addEntryMutation: addEntryMutation.mutateAsync,
    isLoadingAddEntry: addEntryMutation.isLoading,
    updateEntryMutation: updateEntryMutation.mutateAsync,
    isLoadingUpdateEntry: updateEntryMutation.isLoading,
  };
};
