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
  IBoxDetails,
} from "../types";
import { useToast } from "shared/Toast";
import { ProductFixture } from "utils/fixtures";
import { useRedirect, useTranslate } from "utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ValidationError } from "shared/Error";
import { useLocation } from "shared/Router";
import { editProduct, useProducts } from "../infrastructure";
import { Loading } from "shared/Layout";
import { calculateUnitsPerSurface } from "../utils";

export const CreateProductForm = ({
  productToEdit,
  onSuccess,
}: {
  productToEdit?: IProduct;
  onSuccess?: (product: IProduct) => void;
}) => {
  const queryClient = useQueryClient();
  const redirect = useRedirect();
  const location = useLocation();

  const { saveProductMutation, saveProductIsLoading, saveProductIsSuccess } =
    useProducts();

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    reset,
    trigger,
    watch,
  } = useForm<IProduct>();
  const [safetyDocument, setSafetyDocument] = useState<FileList | null>(null);
  const toast = useToast();
  const { t } = useTranslate();

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
    if (data.selectionType === "box" && data.boxDetails) {
      data.boxDetails.quantity = 0;
    }

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
    if (data.boxDetails) {
      data.boxDetails.unitsPerSurface = calculateUnitsPerSurface(
        data.boxDetails.palletType,
        {
          width: data.boxDetails.width,
          height: data.boxDetails.height,
          depth: data.boxDetails.depth,
        }
      );
    }
    if (location.pathname.includes("edit")) {
      editProductMutation({ values: data, id: productToEdit?.id || "" });
    } else {
      saveProductMutation(data, {
        onSuccess: (newProduct) => {
          if (onSuccess) onSuccess(newProduct);
        },
      });
    }
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
      Logger.info("Product to edit", [productToEdit]);
      reset();
      Object.keys(productToEdit).forEach((key) => {
        setValue(key as keyof IProduct, productToEdit[key as keyof IProduct]);
        if (key === "boxDetails" && productToEdit.boxDetails) {
          Object.keys(productToEdit.boxDetails).forEach((boxKey) => {
            setValue(
              `boxDetails.${boxKey}` as keyof IProduct,
              productToEdit.boxDetails[boxKey as keyof IBoxDetails]
            );
          });
        }
      });
      trigger();
      return;
    }
  }, [setValue, productToEdit, trigger]);

  const selectionType = watch("selectionType");
  const unitOfMeasure = watch("boxDetails.unitOfMeasure");

  if (saveProductIsLoading) {
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
          <FormLabel>{t("Unit of Measure")}</FormLabel>
          <Controller
            name="boxDetails.unitOfMeasure"
            control={control}
            defaultValue={IUnitOfMeasure.CC}
            rules={{ required: true }}
            render={({ field }) => (
              <Select {...field}>
                <option value="">{t("Select Unit of Measure")}</option>
                {Object.values(IUnitOfMeasure).map((measure) => {
                  return (
                    <option key={measure} value={measure}>
                      {t(measure)}
                    </option>
                  );
                })}
              </Select>
            )}
          />
        </FormControl>
        {selectionType === "box" && (
          <FormControl mb={4}>
            <FormLabel>{t(`Units per box`)}</FormLabel>
            <Controller
              name="boxDetails.units"
              control={control}
              rules={{ required: true }}
              render={({ field }) => <Input {...field} />}
            />
          </FormControl>
        )}

        {selectionType === "unit" && (
          <FormControl mb={4}>
            <FormLabel>{t(`${unitOfMeasure} per unit`)}</FormLabel>
            <Controller
              name="boxDetails.quantity"
              control={control}
              rules={{ required: true }}
              render={({ field }) => <Input {...field} />}
            />
          </FormControl>
        )}

        {/* <FormControl mb={4}>
          <FormLabel>{t("Quantity")}</FormLabel>
          <Controller
            name="boxDetails.quantity"
            control={control}
            rules={{ required: true }}
            render={({ field }) => <Input {...field} />}
          />
        </FormControl> */}
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
          <FormLabel>{`${t("Kilogram") + "s"}  ${
            watch("selectionType") === "box" ? t("by box") : t("by unit")
          }`}</FormLabel>
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
            render={({ field }) => (
              <Input
                {...field}
                onChange={(e) => {
                  const value = e.target.value ? parseInt(e.target.value) : 0;
                  field.onChange(value);
                  setValue(
                    "boxDetails.unitsPerSurface",
                    calculateUnitsPerSurface(watch("boxDetails.palletType"), {
                      width: watch("boxDetails.width"),
                      height: value,
                      depth: watch("boxDetails.depth"),
                    })
                  );
                }}
              />
            )}
          />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>{t("Width")}</FormLabel>
          <Controller
            name="boxDetails.width"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Input
                {...field}
                onChange={(e) => {
                  const value = e.target.value ? parseInt(e.target.value) : 0;
                  field.onChange(value);
                  setValue(
                    "boxDetails.unitsPerSurface",
                    calculateUnitsPerSurface(watch("boxDetails.palletType"), {
                      width: value,
                      height: watch("boxDetails.height"),
                      depth: watch("boxDetails.depth"),
                    })
                  );
                }}
              />
            )}
          />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>{t("Depth")}</FormLabel>
          <Controller
            name="boxDetails.depth"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Input
                {...field}
                onChange={(e) => {
                  const value = e.target.value ? parseInt(e.target.value) : 0;
                  field.onChange(value);
                  setValue(
                    "boxDetails.unitsPerSurface",
                    calculateUnitsPerSurface(watch("boxDetails.palletType"), {
                      width: watch("boxDetails.width"),
                      height: watch("boxDetails.height"),
                      depth: value,
                    })
                  );
                }}
              />
            )}
          />
        </FormControl>
      </Box>
      <Box display="flex" gap={16} justifyContent="space-around">
        <FormControl mb={4}>
          <FormLabel>{t("Pallet Type")}</FormLabel>
          <Controller
            name="boxDetails.palletType"
            control={control}
            defaultValue={IPallet.Standard}
            rules={{ required: true }}
            render={({ field }) => (
              <Select
                {...field}
                onChange={(e) => {
                  const value = e.target.value as IPallet;
                  field.onChange(value);
                  setValue(
                    "boxDetails.unitsPerSurface",
                    calculateUnitsPerSurface(value, {
                      width: watch("boxDetails.width"),
                      height: watch("boxDetails.height"),
                      depth: watch("boxDetails.depth"),
                    })
                  );
                }}
              >
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
        <FormControl mb={4}>
          <FormLabel>{t("Units per Surface")}</FormLabel>
          <Controller
            name="boxDetails.unitsPerSurface"
            control={control}
            rules={{ required: true }}
            render={({ field }) => <Input {...field} readOnly disabled />}
          />
        </FormControl>
      </Box>
      {/* END UNIT TYPE FIELDS */}

      <Button
        type="submit"
        colorScheme="teal"
        disabled={saveProductIsLoading || saveProductIsSuccess}
      >
        {productToEdit ? t("Edit Product") : t("Create Product")}
      </Button>
    </Box>
  );
};
