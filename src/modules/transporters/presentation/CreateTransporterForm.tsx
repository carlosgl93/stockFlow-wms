import { Box, Button, FormControl, FormLabel, Input } from "@chakra-ui/react";
import { useForm, Controller } from "react-hook-form";
import { useEffect } from "react";
import { Logger } from "utils/logger";
import { ITransporter } from "../types";
import { useToast } from "shared/Toast";
import { useTranslate } from "utils";
import { useLocation } from "shared/Router";
import { useTransporters } from "../infrastructure";
import { Loading } from "shared/Layout";
import { TransporterFixture } from "utils/fixtures";

export const CreateTransporterForm = ({
  transporterToEdit,
  onSuccess,
}: {
  transporterToEdit?: ITransporter;
  onSuccess?: (transporter: ITransporter) => void;
}) => {
  const location = useLocation();

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    reset,
    trigger,
  } = useForm<ITransporter>();
  const toast = useToast();
  const { t } = useTranslate();

  const {
    saveTransporter,
    isLoadingSaveTransporter,
    updateIsLoading,
    updateTransporter,
  } = useTransporters();

  const onSubmit = async (data: ITransporter) => {
    const validation = await trigger();

    if (!validation) {
      Logger.error("Form is not valid", [errors]);
      toast({
        title: "Error",
        description: `${t(
          "Please fill all the fields"
        )} fields to fill: ${Object.keys(errors).join(", ")}`,
        status: "error",
      });
      return;
    }
    // Handle form submission logic here
    Logger.info("handle data store", data);
    if (location.pathname.includes("edit")) {
      updateTransporter({
        transId: transporterToEdit?.id || "",
        transporter: data,
      });
    } else {
      saveTransporter(data, {
        onSuccess: (newTransporter) => {
          if (onSuccess) onSuccess(newTransporter);
        },
      });
    }
  };

  useEffect(() => {
    if (transporterToEdit) {
      Object.keys(transporterToEdit).forEach((key) => {
        setValue(
          key as keyof ITransporter,
          transporterToEdit[key as keyof ITransporter]
        );
      });
      trigger();
      return;
    } else if (import.meta.env.MODE === "development" && !transporterToEdit) {
      const transporter = TransporterFixture.toStructure();
      Object.keys(transporter).forEach((key) => {
        setValue(
          key as keyof ITransporter,
          transporter[key as keyof ITransporter]
        );
      });
      trigger();
      return;
    }
  }, [setValue, transporterToEdit, trigger]);

  if (isLoadingSaveTransporter || updateIsLoading) {
    return <Loading size="md" />;
  }

  return (
    <Box
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      p={5}
      display={"flex"}
      flexDirection={"column"}
    >
      <Box display="flex" justifyContent="space-around" gap={16}>
        <FormControl mb={4}>
          <FormLabel>{t("Name")}</FormLabel>
          <Controller
            name="name"
            control={control}
            defaultValue=""
            rules={{ required: true }}
            render={({ field }) => <Input {...field} />}
          />
          {errors.name && <Box color="red">{t("This field is required")}</Box>}
        </FormControl>
      </Box>
      <Button
        type="submit"
        colorScheme="teal"
        disabled={isLoadingSaveTransporter || updateIsLoading}
      >
        {transporterToEdit ? t("Edit Transporter") : t("Create Transporter")}
      </Button>
    </Box>
  );
};
