import { Box, Button, FormControl, FormLabel, Input } from "@chakra-ui/react";
import { useForm, Controller } from "react-hook-form";
import { useEffect } from "react";
import { useLots } from "../infraestructure/useLots";
import { useToast } from "shared/Toast";
import { ILot } from "../infraestructure/types/ILot";
import { useTranslate } from "utils";
import { Loading } from "shared/Layout";

export const CreateLotForm = ({ lotToEdit }: { lotToEdit?: ILot }) => {
  const {
    addLotMutation,
    updateLotMutation,
    isLoadingAddLot,
    isLoadingUpdateLot,
  } = useLots({
    page: 1,
    pageSize: 10,
  });
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    reset,
    trigger,
  } = useForm<ILot>();
  const toast = useToast();
  const { t } = useTranslate();

  const onSubmit = async (data: ILot) => {
    const validation = await trigger();

    if (!validation) {
      toast({
        title: "Error",
        description: `${t(
          "Please fill all the fields"
        )} fields to fill: ${Object.keys(errors).join(", ")}`,
        status: "error",
      });
      return;
    }

    if (lotToEdit) {
      updateLotMutation({ lotId: lotToEdit.id, values: data });
    } else {
      addLotMutation(data);
    }
  };

  useEffect(() => {
    if (lotToEdit) {
      Object.keys(lotToEdit).forEach((key) => {
        setValue(key as keyof ILot, lotToEdit[key as keyof ILot]);
      });
      trigger();
    }
  }, [setValue, lotToEdit, trigger]);

  if (isLoadingAddLot || isLoadingUpdateLot) {
    return <Loading />;
  }

  return (
    <Box
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      p={5}
      display={"flex"}
      flexDirection={"column"}
    >
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
      {/* <FormControl mb={4}>
        <FormLabel>{t("Entry Date")}</FormLabel>
        <Controller
          name="entryDate"
          control={control}
          defaultValue=""
          rules={{ required: true }}
          render={({ field }) => <Input type="date" {...field} />}
        />
        {errors.entryDate && (
          <Box color="red">{t("This field is required")}</Box>
        )}
      </FormControl>
      <FormControl mb={4}>
        <FormLabel>{t("Departure Date")}</FormLabel>
        <Controller
          name="departureDate"
          control={control}
          defaultValue=""
          rules={{ required: true }}
          render={({ field }) => <Input type="date" {...field} />}
        />
        {errors.departureDate && (
          <Box color="red">{t("This field is required")}</Box>
        )}
      </FormControl> */}
      {/* <FormControl mb={4}>
        <FormLabel>{t("Movement History")}</FormLabel>
        <Controller
          name="movementHistory"
          control={control}
          defaultValue=""
          rules={{ required: true }}
          render={({ field }) => <Input {...field} />}
        />
        {errors.movementHistory && (
          <Box color="red">{t("This field is required")}</Box>
        )}
      </FormControl> */}
      <Button
        type="submit"
        colorScheme="teal"
        disabled={isLoadingAddLot || isLoadingUpdateLot}
      >
        {lotToEdit ? t("Edit Lot") : t("Create Lot")}
      </Button>
    </Box>
  );
};
