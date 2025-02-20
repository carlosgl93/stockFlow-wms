import { useMutation } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";
import { UpdateLotParams, addLot, removeLot, updateLot } from "./mutations";
import { queryClient, useQuery, useRedirect, useTranslate } from "utils";
import { useParams } from "shared/Router";
import { getLots } from "./queries/getLots";
import { useState } from "react";

export const useLots = (pageSize: number = 10, page: number = 1) => {
  const [lastVisible, setLastVisible] = useState<null | string>(null);
  const toast = useToast();
  const { t } = useTranslate();
  const redirect = useRedirect();

  const params = useParams();

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
  };
};
