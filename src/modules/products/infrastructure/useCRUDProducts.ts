import { useMutation } from "@tanstack/react-query";
import { removeProduct } from "./remove";
import { useToast } from "shared/Toast";
import { useRedirect, useTranslate } from "utils";
import { Logger } from "utils/logger";
import { queryClient } from "utils";
import { IProduct } from "../types";
import { ValidationError } from "shared/Error";

export const useCRUDProducts = () => {
  const toast = useToast();
  const { t } = useTranslate();
  const redirect = useRedirect();

  const { mutate: removeProductMutation, isLoading: isLoadingRemoveProduct } =
    useMutation(removeProduct, {
      onSuccess: async () => {
        toast({
          title: t("Product updated"),
          description: t("Product updated successfully"),
          status: "success",
        });
        queryClient.invalidateQueries(["products"]);
      },
      onError: (error: ValidationError) => {
        Logger.error("Error updating product", [error]);
        toast({
          title: "Error",
          description: `${t("Error updating product")}, ${t(error.message)}`,
          status: "error",
        });
      },
    });

  return {
    removeProductMutation,
    isLoadingRemoveProduct,
  };
};
