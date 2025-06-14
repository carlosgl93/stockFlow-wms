import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
} from "@chakra-ui/react";
import { Controller } from "react-hook-form";
import { useEffect } from "react";
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
import { useTranslate } from "utils";
import { useLocation } from "shared/Router";
import { useProducts } from "../infrastructure";
import { Loading } from "shared/Layout";
import { calculateUnitsPerSurface } from "../utils";

export const CreateProductForm = ({
  productToEdit,
  onSuccess,
}: {
  productToEdit?: IProduct;
  onSuccess?: (product: IProduct) => void;
}) => {
  const location = useLocation();
  const toast = useToast();
  const { t } = useTranslate();

  const {
    isProductLoading,
    saveProductMutation,
    saveProductIsLoading,
    saveProductIsSuccess,
    control,
    editIsLoading,
    editProductMutation,
    trigger,
    watch,
    setValue,
    errors,
    handleSubmit,
  } = useProducts();

  const onSubmit = async (data: IProduct) => {
    const validation = await trigger();
    // if (data.selectionType === "box" && data.boxDetails) {
    //   data.boxDetails.quantity = 0;
    // }

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
        data.boxDetails?.palletType || IPallet.Standard,
        {
          width: data.boxDetails.width || 1,
          height: data.boxDetails.height || 1,
          depth: data.boxDetails.depth || 1,
        }
      );
    }
    if (location.pathname.includes("edit")) {
      editProductMutation({ values: data, id: productToEdit?.id || "" });
    } else {
      data!.boxDetails!.kilos = kilos;
      saveProductMutation(data, {
        onSuccess: (newProduct) => {
          if (onSuccess) onSuccess(newProduct);
        },
      });
    }
  };

  const selectionType = watch("selectionType");
  const unitOfMeasure = watch("boxDetails.unitOfMeasure");
  const qPerUnit = watch("boxDetails.quantity") || 0;
  const unitsPerBox = watch("boxDetails.units") || 0;
  const kilos = watch("boxDetails.kilos") || 0;

  useEffect(() => {
    setValue("selectionType", "unit");
  }, []);

  useEffect(() => {
    setValue("boxDetails.kilos", qPerUnit * unitsPerBox);
  }, [qPerUnit, unitsPerBox]);

  if (saveProductIsLoading || editIsLoading || isProductLoading) {
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
          {errors.extCode && (
            <Box color="red">{t("This field is required")}</Box>
          )}
        </FormControl>
        {/* <FormControl mb={4}>
          <FormLabel>{t("Internal Code")}</FormLabel>
          <Controller
            name="internalCode"
            control={control}
            rules={{ required: false}}
            defaultValue="int123"
            render={({ field }) => <Input {...field} />}
          />
          {errors.internalCode && (
            <Box color="red">{t("This field is required")}</Box>
          )}
        </FormControl> */}
        <FormControl mb={4}>
          <FormLabel>{t("Name")}</FormLabel>
          <Controller
            name="name"
            control={control}
            defaultValue="Valor 4%"
            rules={{ required: true }}
            render={({ field }) => <Input {...field} />}
          />
          {errors.name && <Box color="red">{t("This field is required")}</Box>}
        </FormControl>
      </Box>
      <Box display="flex" justifyContent="space-around" gap={16}>
        {/* <FormControl mb={4}>
          <FormLabel>{t("Price")}</FormLabel>
          <Controller
            name="price"
            control={control}
            render={({ field }) => <Input type="number" {...field} />}
          />
        </FormControl> */}
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
          {errors.name && <Box color="red">{t("This field is required")}</Box>}
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
          {errors.name && <Box color="red">{t("This field is required")}</Box>}
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
        {/* <FormControl mb={4}>
          <FormLabel>{t("Unit Type")}</FormLabel>
          <Controller
            name="selectionType"
            control={control}
            defaultValue={"unit"}
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
          {errors.name && <Box color="red">{t("This field is required")}</Box>}
        </FormControl> */}
      </Box>
      {/* END SAFETY DOC &  UNIT TYPE*/}
      {/* UNIT TYPE FIELDS */}
      <Box gap={16} display="flex" justifyContent="space-around">
        <FormControl mb={4}>
          <FormLabel>
            {`${t("Unit of Measure")} ${
              watch("selectionType") === "box" ? t("by box") : t("by unit")
            }`}
          </FormLabel>
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
          {errors.name && <Box color="red">{t("This field is required")}</Box>}
        </FormControl>

        {selectionType === "unit" && (
          <FormControl mb={4}>
            <FormLabel>{t(`Quantity (${unitOfMeasure}) per unit`)}</FormLabel>
            <Controller
              name="boxDetails.quantity"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  {...field}
                  // onChange={(e) => {
                  //   setValue(
                  //     "boxDetails.quantity",
                  //     e.target.value ? parseInt(e.target.value) : 0
                  //   );
                  //   const newKilos = watch("boxDetails.quantity");
                  //   setValue("boxDetails.kilos", newKilos);
                  // }}
                />
              )}
            />
            {errors.name && (
              <Box color="red">{t("This field is required")}</Box>
            )}
          </FormControl>
        )}

        <FormControl mb={4}>
          <FormLabel>{t(`Units per box`)}</FormLabel>
          <Controller
            name="boxDetails.units"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Input
                {...field}
                value={
                  productToEdit?.boxDetails.units
                    ? productToEdit?.boxDetails.units
                    : field.value
                }
              />
            )}
          />
          {errors.name && <Box color="red">{t("This field is required")}</Box>}
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>{`${t(
            (watch("boxDetails.unitOfMeasure") === "ML"
              ? "Liter"
              : watch("boxDetails.unitOfMeasure") === "Gram"
              ? "Kilo"
              : watch("boxDetails.unitOfMeasure") === "C.C"
              ? "Liter"
              : watch("boxDetails.unitOfMeasure")) || "Unit"
          )}  ${t("by box")}`}</FormLabel>
          <Controller
            name="boxDetails.kilos"
            control={control}
            rules={{ required: true }}
            render={({ field }) => {
              const unit = watch("boxDetails.unitOfMeasure");
              let value = field.value;
              if (["ML", "Gram", "C.C"].includes(unit || "")) {
                value = value ? value / 1000 : 0;
              }
              return <Input {...field} value={value} disabled />;
            }}
          />
          {errors.name && <Box color="red">{t("This field is required")}</Box>}
        </FormControl>
        {selectionType === "box" && (
          <FormControl mb={4}>
            <FormLabel>
              {`${t("Quantity")} ${t(
                watch("boxDetails.unitOfMeasure") || ""
              )}s ${t("by unit")}`}
            </FormLabel>
            <Controller
              name="boxDetails.quantity"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  {...field}
                  // onChange={(e) => {
                  //   setValue(
                  //     "boxDetails.quantity",
                  //     e.target.value ? parseInt(e.target.value) : 0
                  //   );
                  //   const newKilos =
                  //     watch("boxDetails.quantity") * watch("boxDetails.units");
                  //   setValue("boxDetails.kilos", newKilos);
                  // }}
                />
              )}
            />
            {errors.name && (
              <Box color="red">{t("This field is required")}</Box>
            )}
          </FormControl>
        )}
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
          {errors.name && <Box color="red">{t("This field is required")}</Box>}
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
          {errors.name && <Box color="red">{t("This field is required")}</Box>}
        </FormControl>
      </Box>
      {/* <Box display="flex" gap={16} justifyContent="space-around">
        <FormControl mb={4}>
          <FormLabel>{t("Height")}</FormLabel>
          <Controller
            name="boxDetails.height"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                onChange={(e) => {
                  const value = e.target.value ? parseInt(e.target.value) : 0;
                  field.onChange(value);
                  setValue(
                    "boxDetails.unitsPerSurface",
                    calculateUnitsPerSurface(watch("boxDetails.palletType"), {
                      width: watch("boxDetails.width") || 1,
                      height: value || 1,
                      depth: watch("boxDetails.depth") || 1,
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
                      height: watch("boxDetails.height") || 1,
                      depth: watch("boxDetails.depth") || 1,
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
            render={({ field }) => (
              <Input
                {...field}
                onChange={(e) => {
                  const value = e.target.value ? parseInt(e.target.value) : 0;
                  field.onChange(value);
                  setValue(
                    "boxDetails.unitsPerSurface",
                    calculateUnitsPerSurface(watch("boxDetails.palletType"), {
                      width: watch("boxDetails.width") || 1,
                      height: watch("boxDetails.height") || 1,
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
            render={({ field }) => (
              <Select
                {...field}
                onChange={(e) => {
                  const value = e.target.value as IPallet;
                  field.onChange(value);
                  setValue(
                    "boxDetails.unitsPerSurface",
                    calculateUnitsPerSurface(value, {
                      width: watch("boxDetails.width") || 1,
                      height: watch("boxDetails.height") || 1,
                      depth: watch("boxDetails.depth") || 1,
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
            render={({ field }) => <Input {...field} readOnly disabled />}
          />
        </FormControl>
      </Box> */}
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
