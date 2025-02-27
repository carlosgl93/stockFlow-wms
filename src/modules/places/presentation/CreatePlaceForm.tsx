import { Box, Button, FormControl, FormLabel, Input } from "@chakra-ui/react";
import { useForm, Controller } from "react-hook-form";
import { useEffect } from "react";
import { useToast } from "shared/Toast";
import { useTranslate } from "utils";
import { Loading } from "shared/Layout";
import { IPlace, usePlaces } from "../infra";

export const CreatePlaceForm = ({ placeToEdit }: { placeToEdit?: IPlace }) => {
  const {
    addPlaceMutation,
    updatePlaceMutation,
    isLoadingAddPlace,
    isLoadingUpdatePlace,
  } = usePlaces();
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    reset,
    trigger,
  } = useForm<IPlace>();
  const toast = useToast();
  const { t } = useTranslate();

  const onSubmit = async (data: IPlace) => {
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

    if (placeToEdit) {
      updatePlaceMutation({ placeId: placeToEdit.id, values: data });
    } else {
      addPlaceMutation(data);
    }
  };

  useEffect(() => {
    if (placeToEdit) {
      Object.keys(placeToEdit).forEach((key) => {
        setValue(key as keyof IPlace, placeToEdit[key as keyof IPlace]);
      });
      trigger();
    }
  }, [setValue, placeToEdit, trigger]);

  if (isLoadingAddPlace || isLoadingUpdatePlace) {
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
        disabled={isLoadingAddPlace || isLoadingUpdatePlace}
      >
        {placeToEdit ? t("Edit Place") : t("Create Place")}
      </Button>
    </Box>
  );
};
