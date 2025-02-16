import {
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  Input,
  SimpleGrid,
} from "@chakra-ui/react";
import { useForm, Controller } from "react-hook-form";
import { useEffect } from "react";
import { useSuppliers } from "../infraestructure/useSuppliers";
import { useToast } from "shared/Toast";
import { ISupplier } from "../types/ISupplier";
import { useTranslate } from "utils";
import { Loading } from "shared/Layout";

export const CreateSupplierForm = ({
  supplierToEdit,
}: {
  supplierToEdit?: ISupplier;
}) => {
  const {
    addSupplierMutation,
    updateSupplierMutation,
    isLoadingAddSupplier,
    isLoadingUpdateSupplier,
  } = useSuppliers();
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    trigger,
  } = useForm<ISupplier>();
  const toast = useToast();
  const { t } = useTranslate();

  const onSubmit = async (data: ISupplier) => {
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

    if (supplierToEdit) {
      updateSupplierMutation({
        supplierId: supplierToEdit.idNumber,
        values: data,
      });
    } else {
      addSupplierMutation(data);
    }
  };

  useEffect(() => {
    if (supplierToEdit) {
      Object.keys(supplierToEdit).forEach((key) => {
        setValue(
          key as keyof ISupplier,
          supplierToEdit[key as keyof ISupplier]
        );
      });
      trigger();
    }
  }, [setValue, supplierToEdit, trigger]);

  if (isLoadingAddSupplier || isLoadingUpdateSupplier) {
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
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <FormControl mb={4}>
          <FormLabel>{t("Company")}</FormLabel>
          <Controller
            name="company"
            control={control}
            defaultValue=""
            rules={{ required: true }}
            render={({ field }) => <Input {...field} />}
          />
          {errors.company && (
            <Box color="red">{t("This field is required")}</Box>
          )}
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>{t("ID Number")}</FormLabel>
          <Controller
            name="idNumber"
            control={control}
            defaultValue=""
            rules={{ required: true }}
            render={({ field }) => <Input {...field} />}
          />
          {errors.idNumber && (
            <Box color="red">{t("This field is required")}</Box>
          )}
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>{t("Business Category")}</FormLabel>
          <Controller
            name="businessCategory"
            control={control}
            defaultValue=""
            rules={{ required: true }}
            render={({ field }) => <Input {...field} />}
          />
          {errors.businessCategory && (
            <Box color="red">{t("This field is required")}</Box>
          )}
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>{t("County")}</FormLabel>
          <Controller
            name="county"
            control={control}
            defaultValue=""
            rules={{ required: true }}
            render={({ field }) => <Input {...field} />}
          />
          {errors.county && (
            <Box color="red">{t("This field is required")}</Box>
          )}
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>{t("Region")}</FormLabel>
          <Controller
            name="region"
            control={control}
            defaultValue=""
            rules={{ required: true }}
            render={({ field }) => <Input {...field} />}
          />
          {errors.region && (
            <Box color="red">{t("This field is required")}</Box>
          )}
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>{t("Fax")}</FormLabel>
          <Controller
            name="fax"
            control={control}
            defaultValue=""
            rules={{ required: true }}
            render={({ field }) => <Input {...field} />}
          />
          {errors.fax && <Box color="red">{t("This field is required")}</Box>}
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>{t("Phone")}</FormLabel>
          <Controller
            name="phone"
            control={control}
            defaultValue=""
            rules={{ required: true }}
            render={({ field }) => <Input {...field} />}
          />
          {errors.phone && <Box color="red">{t("This field is required")}</Box>}
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>{t("Website")}</FormLabel>
          <Controller
            name="website"
            control={control}
            defaultValue=""
            rules={{ required: true }}
            render={({ field }) => <Input {...field} />}
          />
          {errors.website && (
            <Box color="red">{t("This field is required")}</Box>
          )}
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>{t("Email")}</FormLabel>
          <Controller
            name="email"
            control={control}
            defaultValue=""
            rules={{ required: true }}
            render={({ field }) => <Input {...field} />}
          />
          {errors.email && <Box color="red">{t("This field is required")}</Box>}
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>{t("Address")}</FormLabel>
          <Controller
            name="address"
            control={control}
            defaultValue=""
            rules={{ required: true }}
            render={({ field }) => <Input {...field} />}
          />
          {errors.address && (
            <Box color="red">{t("This field is required")}</Box>
          )}
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>{t("Contact Name")}</FormLabel>
          <Controller
            name="contact.name"
            control={control}
            defaultValue=""
            rules={{ required: true }}
            render={({ field }) => <Input {...field} />}
          />
          {errors.contact?.name && (
            <Box color="red">{t("This field is required")}</Box>
          )}
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>{t("Contact Email")}</FormLabel>
          <Controller
            name="contact.email"
            control={control}
            defaultValue=""
            rules={{ required: true }}
            render={({ field }) => <Input {...field} />}
          />
          {errors.contact?.email && (
            <Box color="red">{t("This field is required")}</Box>
          )}
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>{t("Contact Phone")}</FormLabel>
          <Controller
            name="contact.phone"
            control={control}
            defaultValue=""
            rules={{ required: true }}
            render={({ field }) => <Input {...field} />}
          />
          {errors.contact?.phone && (
            <Box color="red">{t("This field is required")}</Box>
          )}
        </FormControl>
      </SimpleGrid>
      <Button
        type="submit"
        colorScheme="teal"
        disabled={isLoadingAddSupplier || isLoadingUpdateSupplier}
        mt={4}
      >
        {supplierToEdit ? t("Edit Supplier") : t("Create Supplier")}
      </Button>
    </Box>
  );
};
