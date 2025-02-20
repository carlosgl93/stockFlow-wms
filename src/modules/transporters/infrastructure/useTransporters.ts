import { useState } from "react";
import { queryClient, useQuery, useTranslate } from "utils";
import { getTransporters } from "./queries/getTransporters";
import { useToast } from "@chakra-ui/react";
import { APIError, ValidationError } from "shared/Error";
import { useMutation } from "@tanstack/react-query";
import { Logger } from "utils/logger";
import { saveTransporter } from "./mutations/saveTransporter";
import { updateTransporter } from "./mutations/updateTransporter";

export const useTransporters = (limit?: number | undefined) => {
  const [pageSize, setPageSize] = useState(50);
  const [lastVisible, setLastVisible] = useState<null | string>(null);
  const toast = useToast();
  const { t } = useTranslate();

  const {
    data: getTransportersData,
    isLoading: isLoadingGetTransporters,
    isError: isErrorGetTransporters,
  } = useQuery({
    queryKey: ["transporters"],
    queryFn: () => getTransporters(limit || pageSize, lastVisible),
    onSuccess: (data) => {
      setLastVisible(data?.lastVisible || null);
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
    mutate: saveTransporterMutation,
    isLoading: isLoadingSaveTransporter,
    isError: isErrorSaveTransporter,
    error,
    isSuccess,
  } = useMutation(saveTransporter, {
    onSuccess: async (data) => {
      toast({
        title: t("Transporter created"),
        description: t("Transporter created successfully"),
        status: "success",
      });
      queryClient.invalidateQueries(["transporters"]);

      // Redirect or perform other actions after successful creation
    },
    onError: (error: ValidationError) => {
      Logger.error("Error creating transporter", [error]);
      toast({
        title: "Error",
        description: `${t("Error creating transporter")}, ${t(error.message)}`,
        status: "error",
      });
    },
  });

  const {
    mutate: updateTransporterMutation,
    isLoading: updateIsLoading,
    isError: updateIsError,
    error: updateError,
    isSuccess: updateIsSuccess,
  } = useMutation(updateTransporter, {
    onSuccess: async (data) => {
      toast({
        title: t("Transporter updated"),
        description: t("Transporter updated successfully"),
        status: "success",
      });
      queryClient.invalidateQueries(["transporters"]);
    },
    onError: (error: ValidationError) => {
      Logger.error("Error updating transporter", [error]);
      toast({
        title: "Error",
        description: `${t("Error updating transporter")}, ${t(error.message)}`,
        status: "error",
      });
    },
  });

  return {
    getTransporters: getTransportersData?.transporters || [],
    isLoadingGetTransporters,
    isErrorGetTransporters,
    saveTransporter: saveTransporterMutation,
    isLoadingSaveTransporter,
    isErrorSaveTransporter,
    updateTransporter: updateTransporterMutation,
    updateIsLoading,
  };
};
