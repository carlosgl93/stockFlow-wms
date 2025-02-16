import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";
import { addSupplier, updateSupplier, removeSupplier, getSuppliers } from "./";
import { queryClient, useQuery, useRedirect, useTranslate } from "utils";
import { APIError } from "shared/Error";

export const useSuppliers = () => {
  const [pageSize, setPageSize] = useState(50);
  const [lastVisible, setLastVisible] = useState<null | string>(null);
  const toast = useToast();
  const { t } = useTranslate();
  const redirect = useRedirect();

  const {
    mutate: addSupplierMutation,
    isLoading: isLoadingAddSupplier,
    isError: isErrorAddSupplier,
  } = useMutation(addSupplier, {
    onSuccess: () => {
      toast({
        title: t("Supplier added successfully."),
        status: "success",
      });
      queryClient.invalidateQueries(["suppliers"]);
    },
    onError: (error: APIError) => {
      toast({
        title: t("Failed to add supplier."),
        description: error.message,
        status: "error",
      });
    },
  });

  const {
    mutate: updateSupplierMutation,
    isLoading: isLoadingUpdateSupplier,
    isError: isErrorUpdateSupplier,
  } = useMutation(updateSupplier, {
    onSuccess: () => {
      toast({
        title: t("Supplier updated successfully."),
        status: "success",
      });
      queryClient.invalidateQueries(["suppliers"]);
    },
    onError: (error: APIError) => {
      toast({
        title: t("Failed to update supplier."),
        description: error.message,
        status: "error",
      });
    },
  });

  const {
    mutate: removeSupplierMutation,
    isLoading: isLoadingRemoveSupplier,
    isError: isErrorRemoveSupplier,
  } = useMutation(removeSupplier, {
    onSuccess: () => {
      toast({
        title: t("Supplier removed successfully."),
        status: "success",
      });
      queryClient.invalidateQueries(["suppliers"]);
    },
    onError: (error: APIError) => {
      toast({
        title: t("Failed to remove supplier."),
        description: error.message,
        status: "error",
      });
    },
  });

  const {
    data: getSuppliersData,
    isLoading: isLoadingGetSuppliers,
    isError: isErrorGetSuppliers,
  } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => getSuppliers(pageSize, lastVisible ? lastVisible : null),
    onSuccess: (data) => {
      setLastVisible(data?.lastVisible || null);
    },
  });

  return {
    addSupplierMutation,
    isLoadingAddSupplier,
    isErrorAddSupplier,
    updateSupplierMutation,
    isLoadingUpdateSupplier,
    isErrorUpdateSupplier,
    removeSupplierMutation,
    isLoadingRemoveSupplier,
    isErrorRemoveSupplier,
    getSuppliersData,
    isLoadingGetSuppliers,
    isErrorGetSuppliers,
  };
};
