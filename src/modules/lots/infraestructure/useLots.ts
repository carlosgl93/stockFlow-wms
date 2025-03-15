import { useMutation } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";
import { UpdateLotParams, addLot, removeLot, updateLot } from "./mutations";
import { queryClient, useQuery, useRedirect, useTranslate } from "utils";
import { getLots } from "./queries/getLots";
import { useState } from "react";
import { getProductLots } from "./queries";

type UseLotsProps = {
  productId?: string;
  pageSize?: number;
  page?: number;
};

export const useLots = ({
  productId = "",
  pageSize = 10,
  page = 1,
}: UseLotsProps) => {
  const [lastVisible, setLastVisible] = useState<null | string>(null);
  const toast = useToast();
  const { t } = useTranslate();
  const redirect = useRedirect();

  const {
    mutate: addLotMutation,
    isLoading: isLoadingAddLot,
    isError: isErrorAddLot,
  } = useMutation(addLot, {
    onSuccess: () => {
      toast({
        title: t("Lot added successfully."),
        status: "success",
      });
      queryClient.invalidateQueries(["lots"]);
      redirect("/lots");
    },
    onError: () => {
      toast({
        title: t("Failed to add lot."),
        status: "error",
      });
    },
  });

  const {
    mutate: updateLotMutation,
    isLoading: isLoadingUpdateLot,
    isError: isErrorUpdateLot,
  } = useMutation(
    ({ lotId, values }: UpdateLotParams) => updateLot({ lotId, values }),
    {
      onSuccess: () => {
        toast({
          title: t("Lot updated successfully."),
          status: "success",
        });
        queryClient.invalidateQueries(["lots"]);
      },
      onError: () => {
        toast({
          title: t("Failed to update lot."),
          status: "error",
        });
      },
    }
  );

  const {
    mutate: removeLotMutation,
    isLoading: isLoadingRemoveLot,
    isError: isErrorRemoveLot,
  } = useMutation(removeLot, {
    onSuccess: () => {
      toast({
        title: t("Lot removed successfully."),
        status: "success",
      });
      queryClient.invalidateQueries(["lots"]);
    },
    onError: () => {
      toast({
        title: t("Failed to remove lot."),
        status: "error",
      });
    },
  });

  const {
    data: getLotsData,
    isLoading: isLoadingGetLots,
    isError: isErrorGetLots,
  } = useQuery({
    queryKey: ["lots", page, pageSize],
    queryFn: () => getLots(pageSize, page),
    onSuccess: (data) => {
      setLastVisible(data.lastVisible);
    },
  });

  const {
    data: getProductLotsData,
    isLoading: isLoadingGetProductLots,
    isError: isErrorGetProductLots,
  } = useQuery({
    queryKey: ["productLots", productId, page, pageSize],
    queryFn: () =>
      getProductLots({
        productId,
        page,
        pageSize,
      }),
    enabled: !!productId,
    onSuccess: (data) => {
      setLastVisible(data.lastVisible);
    },
  });

  const {
    data: getUniqueLots,
    isLoading: isLoadingGetUniqueLots,
    isError: isErrorGetUniqueLots,
  } = useQuery({
    queryKey: ["lots"],
    queryFn: () => getLots(pageSize, page),
    onSuccess: (data) => {
      setLastVisible(data.lastVisible);
    },
  });

  return {
    addLotMutation,
    isLoadingAddLot,
    isErrorAddLot,
    updateLotMutation,
    isLoadingUpdateLot,
    isErrorUpdateLot,
    removeLotMutation,
    isLoadingRemoveLot,
    isErrorRemoveLot,
    getLotsData,
    isLoadingGetLots,
    isErrorGetLots,
    getProductLotsData,
    isLoadingGetProductLots,
    isErrorGetProductLots,
  };
};
