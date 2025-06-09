import { useMutation } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";
import {
  UpdateLotProductQuantityParams,
  addLotProduct,
  removeLotProduct,
  updateLotProductQuantity,
} from "./mutations";
import { useQuery, useTranslate } from "utils";
import { useParams } from "shared/Router";
import { getLotProducts } from "./queries/getLotProducts";

type useLotsProductProps = {
  lotId?: string;
  productId?: string;
  pageSize?: number;
  lastVisible?: string;
};

export const useLotProduct = ({
  lotId,
  productId,
  pageSize = 25,
  lastVisible,
}: useLotsProductProps) => {
  const toast = useToast();
  const { t } = useTranslate();

  const params = useParams();

  const {
    mutate: addLotProductMutation,
    isLoading: isLoadingAddLotProduct,
    isError: isErrorAddLotProduct,
  } = useMutation(addLotProduct, {
    onSuccess: () => {
      toast({
        title: t("Product added successfully."),
        status: "success",
      });
    },
    onError: () => {
      toast({
        title: t("Failed to add product."),
        status: "error",
      });
    },
  });

  const {
    mutate: updateLotProductQuantityMutation,
    isLoading: isLoadingupdateLotProductQuantity,
    isError: isErrorupdateLotProductQuantity,
  } = useMutation(
    ({ lotProductId, quantity }: UpdateLotProductQuantityParams) =>
      updateLotProductQuantity(lotProductId, quantity),
    {
      onSuccess: () => {
        toast({
          title: t("Product quantity updated successfully."),
          status: "success",
        });
      },
      onError: () => {
        toast({
          title: t("Failed to update product quantity."),
          status: "error",
        });
      },
    }
  );

  const {
    mutate: removeLotProductMutation,
    isLoading: isLoadingRemoveLotProduct,
    isError: isErrorRemoveLotProduct,
  } = useMutation(removeLotProduct, {
    onSuccess: () => {
      toast({
        title: t("Product removed successfully."),
        status: "success",
      });
    },
    onError: () => {
      toast({
        title: t("Failed to remove product."),
        status: "error",
      });
    },
  });

  const {
    data: getLotProductsData,
    isLoading: isLoadingGetLotProducts,
    isError: isErrorGetLotProducts,
  } = useQuery({
    queryKey: [
      "getLotProducts",
      params.productId ? params.productId : productId,
      params?.lotProductId ? params.lotProductId : lotId,
      pageSize,
      lastVisible,
    ],
    queryFn: () =>
      getLotProducts(
        params?.lotProductId ? params.lotProductId : lotId,
        params.productId ? params.productId : productId,
        pageSize,
        lastVisible
      ),
  });

  return {
    addLotProduct: addLotProductMutation,
    isLoadingAddLotProduct,
    isErrorAddLotProduct,
    updateLotProductQuantity: updateLotProductQuantityMutation,
    isLoadingupdateLotProductQuantity,
    isErrorupdateLotProductQuantity,
    removeLotProduct: removeLotProductMutation,
    isLoadingRemoveLotProduct,
    isErrorRemoveLotProduct,
    getLotProductsData,
    isLoadingGetLotProducts,
    isErrorGetLotProducts,
  };
};
