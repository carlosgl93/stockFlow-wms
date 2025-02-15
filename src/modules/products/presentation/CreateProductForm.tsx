import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  RadioGroup,
  Radio,
} from "@chakra-ui/react";
import { useForm, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import { Logger } from "utils/logger";
import {
  Category,
  IContainer,
  IProduct,
  RiskCategory,
  IPallet,
  IUnitOfMeasure,
  IMaterialType,
} from "../types";
import { useToast } from "shared/Toast";
import { ProductFixture } from "utils/fixtures";
import { useRedirect, useTranslate } from "utils";
import { saveProduct } from "../infrastructure/saveProduct";
import { useMutation } from "@tanstack/react-query";
import { ValidationError } from "shared/Error";
import { useLocation } from "shared/Router";
import { queryClient } from "utils";
import { editProduct } from "../infrastructure";
import { Loading } from "shared/Layout";

export const CreateProductForm = ({
  productToEdit,
}: {
  productToEdit?: IProduct;
}) => {
  const redirect = useRedirect();
  const location = useLocation();

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    reset,
    trigger,
  } = useForm<IProduct>();
  const [safetyDocument, setSafetyDocument] = useState<FileList | null>(null);
  const toast = useToast();
  const { t } = useTranslate();

  const {
    mutate: saveProductMutation,
    isLoading,
    isError,
    error,
    isSuccess,
  } = useMutation(["addProduct"], saveProduct, {
    onSuccess: async (data) => {
      toast({
        title: t("Product created"),
        description: t("Product created successfully"),
        status: "success",
      });
      reset();
      Logger.info("setting query data", [data]);
      queryClient.setQueryData(["products"], (old: IProduct[] | undefined) => {
        if (old) {
          return [...old, data];
        }
        return [data];
      });

      redirect("/products");
    },
    onError: (error: ValidationError) => {
      Logger.error("Error creating product", [error]);
      toast({
        title: "Error",
        description: `${t("Error creating product")}, ${t(error.message)}`,
        status: "error",
      });
    },
  });

  const {
    mutate: editProductMutation,
    isLoading: editIsLoading,
    isError: editIsError,
    error: editError,
    isSuccess: editIsSuccess,
  } = useMutation(editProduct, {
    onSuccess: async (data) => {
      toast({
        title: t("Product updated"),
        description: t("Product updated successfully"),
        status: "success",
      });
      reset();
      Logger.info("setting query data", [data]);
      queryClient.setQueryData(["products"], (old: IProduct[] | undefined) => {
        if (old) {
          return [...old, data];
        }
        return [data];
      });

      redirect("/products");
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

  const onSubmit = async (data: IProduct) => {
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
      editProductMutation({ values: data, id: productToEdit?.id || "" });
      return;
    }
    saveProductMutation(data);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSafetyDocument(files);
      setValue("safetyDocument", files);
    }
  };

  useEffect(() => {
    if (import.meta.env.MODE === "development" && !productToEdit) {
      const product = ProductFixture.toStructure();
      Object.keys(product).forEach((key) => {
        setValue(key as keyof IProduct, product[key as keyof IProduct]);
      });
      trigger();
      return;
    }

    if (productToEdit) {
      Object.keys(productToEdit).forEach((key) => {
        setValue(key as keyof IProduct, productToEdit[key as keyof IProduct]);
      });
      trigger();
      return;
    }
  }, [setValue, productToEdit, trigger]);

  if (isLoading) {
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
      {/* PRODUCT */}
      <Box display="flex" justifyContent="space-around" gap={16}>
        <FormControl mb={4}>
          <FormLabel>{t("Ext Code")}</FormLabel>
          <Controller
            name="extCode"
            control={control}
            defaultValue="ext123"
            rules={{ required: true }}
            render={({ field }) => <Input {...field} />}
          />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>{t("Internal Code")}</FormLabel>
          <Controller
            name="internalCode"
            control={control}
            defaultValue="int123"
            render={({ field }) => <Input {...field} />}
          />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>{t("Name")}</FormLabel>
          <Controller
            name="name"
            control={control}
            defaultValue="Valor 4%"
            rules={{ required: true }}
            render={({ field }) => <Input {...field} />}
          />
        </FormControl>
      </Box>
      <Box display="flex" justifyContent="space-around" gap={16}>
        <FormControl mb={4}>
          <FormLabel>{t("Price")}</FormLabel>
          <Controller
            name="price"
            control={control}
            rules={{ required: true }}
            render={({ field }) => <Input type="number" {...field} />}
          />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>{t("Risk Category")}</FormLabel>
          <Controller
            name="riskCategory"
            control={control}
            defaultValue={RiskCategory.Toxic}
            rules={{ required: true }}
            render={({ field }) => (
              <Select {...field}>
                <option value="">{t("Select Risk Category")}</option>
                {Object.values(RiskCategory).map((category) => (
                  <option key={category} value={category}>
                    {t(category)}
                  </option>
                ))}
              </Select>
            )}
          />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>{t("Category")}</FormLabel>
          <Controller
            name="category"
            control={control}
            defaultValue={Category.Acaricide}
            rules={{ required: true }}
            render={({ field }) => (
              <Select {...field}>
                <option value="">{t("Select Category")}</option>
                {Object.values(Category).map((category) => (
                  <option key={category} value={category}>
                    {t(category)}
                  </option>
                ))}
              </Select>
            )}
          />
        </FormControl>
      </Box>
      {/*  END OF PRODUCT */}
      {/* SAFETY DOC &  UNIT TYPE*/}
      <Box
        display="flex"
        justifyContent="space-between"
        w={"100vw"}
        gap={16}
        alignContent={"center"}
        alignItems={"center"}
      >
        {/* <FormControl mb={4}>
          <FormLabel>{t("Safety Document")}</FormLabel>
          <Controller
            name="safetyDocument"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Input
                type="file"
                onChange={handleFileChange}
                onBlur={field.onBlur}
                ref={field.ref}
              />
            )}
          />
          {errors.safetyDocument && (
            <Box color="red">{t("This field is required")}</Box>
          )}
        </FormControl> */}
        <FormControl mb={4}>
          <FormLabel>{t("Unit Type")}</FormLabel>
          <Controller
            name="selectionType"
            control={control}
            defaultValue="box"
            rules={{ required: true }}
            render={({ field }) => (
              <RadioGroup
                {...field}
                display="flex"
                gap={8}
                alignContent={"center"}
                alignItems={"center"}
              >
                <Radio value="box">{t("Box")}</Radio>
                <Radio value="unit">{t("Unit")}</Radio>
              </RadioGroup>
            )}
          />
        </FormControl>
      </Box>
      {/* END SAFETY DOC &  UNIT TYPE*/}
      {/* UNIT TYPE FIELDS */}
      <Box gap={16} display="flex" justifyContent="space-around">
        <FormControl mb={4}>
          <FormLabel>{t("N of Units")}</FormLabel>
          <Controller
            name="boxDetails.units"
            control={control}
            rules={{ required: true }}
            render={({ field }) => <Input {...field} />}
          />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>{t("Quantity")}</FormLabel>
          <Controller
            name="boxDetails.quantity"
            control={control}
            rules={{ required: true }}
            render={({ field }) => <Input {...field} />}
          />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>{t("Unit of Measure")}</FormLabel>
          <Controller
            name="boxDetails.unitOfMeasure"
            control={control}
            defaultValue={IUnitOfMeasure.CC}
            rules={{ required: true }}
            render={({ field }) => (
              <Select {...field}>
                <option value="">{t("Select Unit of Measure")}</option>
                {Object.values(IUnitOfMeasure).map((measure) => (
                  <option key={measure} value={measure}>
                    {t(measure)}
                  </option>
                ))}
              </Select>
            )}
          />
        </FormControl>
      </Box>
      <Box display="flex" gap={16} justifyContent="space-around">
        <FormControl mb={4}>
          <FormLabel>{t("Container")}</FormLabel>
          <Controller
            name="boxDetails.container"
            control={control}
            defaultValue={IContainer.Bidon}
            rules={{ required: true }}
            render={({ field }) => (
              <Select {...field}>
                <option value="">{t("Select Container")}</option>
                {Object.values(IContainer).map((container) => (
                  <option key={container} value={container}>
                    {t(container)}
                  </option>
                ))}
              </Select>
            )}
          />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>{t("Type")}</FormLabel>
          <Controller
            name="boxDetails.type"
            control={control}
            defaultValue={IMaterialType.Plastic}
            rules={{ required: true }}
            render={({ field }) => (
              <Select {...field}>
                <option value="">{t("Select Type")}</option>
                {Object.values(IMaterialType).map((type) => (
                  <option key={type} value={type}>
                    {t(type)}
                  </option>
                ))}
              </Select>
            )}
          />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>{t("Kilos")}</FormLabel>
          <Controller
            name="boxDetails.kilos"
            control={control}
            rules={{ required: true }}
            render={({ field }) => <Input {...field} />}
          />
        </FormControl>
      </Box>
      <Box display="flex" gap={16} justifyContent="space-around">
        <FormControl mb={4}>
          <FormLabel>{t("Height")}</FormLabel>
          <Controller
            name="boxDetails.height"
            control={control}
            rules={{ required: true }}
            render={({ field }) => <Input {...field} />}
          />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>{t("Width")}</FormLabel>
          <Controller
            name="boxDetails.width"
            control={control}
            rules={{ required: true }}
            render={({ field }) => <Input {...field} />}
          />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>{t("Depth")}</FormLabel>
          <Controller
            name="boxDetails.depth"
            control={control}
            rules={{ required: true }}
            render={({ field }) => <Input {...field} />}
          />
        </FormControl>
      </Box>
      <Box display="flex" gap={16} justifyContent="space-around">
        <FormControl mb={4}>
          <FormLabel>{t("Units per Surface")}</FormLabel>
          <Controller
            name="boxDetails.unitsPerSurface"
            control={control}
            rules={{ required: true }}
            render={({ field }) => <Input {...field} />}
          />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>{t("Pallet Type")}</FormLabel>
          <Controller
            name="boxDetails.palletType"
            control={control}
            defaultValue={IPallet.European}
            rules={{ required: true }}
            render={({ field }) => (
              <Select {...field}>
                <option value="">{t("Select Pallet Type")}</option>
                {Object.values(IPallet).map((pallet) => (
                  <option key={pallet} value={pallet}>
                    {t(pallet)}
                  </option>
                ))}
              </Select>
            )}
          />
        </FormControl>
      </Box>
      {/* END UNIT TYPE FIELDS */}

      <Button
        type="submit"
        colorScheme="teal"
        disabled={isLoading || isSuccess}
      >
        {productToEdit ? t("Edit Product") : t("Create Product")}
      </Button>
    </Box>
  );
};
