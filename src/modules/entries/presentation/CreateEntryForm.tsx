import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Text,
} from "@chakra-ui/react";
import { useForm, Controller } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { useEntries } from "../infraestructure/useEntries";
import { useNotImplementedYetToast, useToast } from "shared/Toast";
import { IEntry } from "../types";
import { useTranslate } from "utils";
import { Loading } from "shared/Layout";
import { AddButton, Search } from "shared/Actions";
import { Logger } from "utils/logger";
import { useSuppliers, CreateSupplierForm } from "modules/suppliers";
import { useLots } from "modules/lots/infraestructure";
import { EntryFixture } from "utils/fixtures";
import { SearchProduct } from "modules/products/presentation";
import { IProduct } from "modules/products/types";
import { SearchIcon } from "@chakra-ui/icons";

export const CreateEntryForm = ({ entryToEdit }: { entryToEdit?: IEntry }) => {
  const [isSearchingProduct, setIsSearchingProduct] = useState(false);
  const [productsSearched, setProductsSearched] = useState<null | IProduct[]>(
    null
  );

  const {
    addEntryMutation,
    updateEntryMutation,
    isLoadingAddEntry,
    isLoadingUpdateEntry,
  } = useEntries();

  const { getSuppliersData, isLoadingGetSuppliers } = useSuppliers();
  const { getLotsData } = useLots();

  Logger.info("products searched", [productsSearched]);

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    reset,
    trigger,
    watch,
  } = useForm<IEntry>();
  const toast = useToast();
  const { t } = useTranslate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleProductSelect = (product: IProduct) => {
    setValue("productId", product?.id || "");
  };

  const onSubmit = async (data: IEntry) => {
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

    try {
      if (entryToEdit) {
        await updateEntryMutation({ entryId: entryToEdit.id, values: data });
      } else {
        await addEntryMutation(data);
      }
    } catch (error) {
      let errorMessage = "An unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
      });
    }
  };

  useEffect(() => {
    if (entryToEdit) {
      Object.keys(entryToEdit).forEach((key) => {
        setValue(key as keyof IEntry, entryToEdit[key as keyof IEntry]);
      });
      trigger();
    }
  }, [setValue, entryToEdit, trigger]);

  useEffect(() => {
    if (entryToEdit) {
      Object.keys(entryToEdit).forEach((key) => {
        setValue(key as keyof IEntry, entryToEdit[key as keyof IEntry]);
      });
      trigger();
    } else if (import.meta.env.MODE === "development") {
      const entry = EntryFixture.toStructure();
      Object.keys(entry).forEach((key) => {
        setValue(key as keyof IEntry, entry[key as keyof IEntry]);
      });
      trigger();
    }
  }, [setValue, entryToEdit, trigger]);

  if (isLoadingAddEntry || isLoadingUpdateEntry || isLoadingGetSuppliers) {
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
      <Box display="flex" justifyContent="space-around" gap={16}>
        <FormControl mb={4}>
          <FormLabel>{t("Supplier ID")}</FormLabel>
          <Box display="flex" alignItems="center" gap={2}>
            <Controller
              name="supplierId"
              control={control}
              defaultValue=""
              rules={{ required: true }}
              render={({ field }) => (
                <Select {...field}>
                  <option value="">{t("Select the supplier")}</option>
                  {getSuppliersData?.suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.company}
                    </option>
                  ))}
                  {/* Add supplier options here */}
                </Select>
              )}
            />
            <AddButton onAdd={onOpen} />
          </Box>
          {errors.supplierId && (
            <Box color="red">{t("This field is required")}</Box>
          )}
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>{t("Document Number")}</FormLabel>
          <Controller
            name="docNumber"
            control={control}
            defaultValue=""
            rules={{ required: true }}
            render={({ field }) => <Input {...field} />}
          />
          {errors.docNumber && (
            <Box color="red">{t("This field is required")}</Box>
          )}
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>{t("Transporter")}</FormLabel>
          <Box display="flex" alignItems="center" gap={2}>
            <Controller
              name="transporter"
              control={control}
              defaultValue=""
              rules={{ required: true }}
              render={({ field }) => (
                <Select {...field}>
                  <option value="">{t("Select the transporter")}</option>
                  {/* TODO: MAP OVER THE TRANSPORTERS CREATED */}
                  {/* {getTransportersData?.transporters.map((transporter) => (
                    <option key={transporter.id} value={transporter.id}>
                      {transporter.company}
                    </option>
                  ))} */}
                </Select>
              )}
            />
            {errors.transporter && (
              <Box color="red">{t("This field is required")}</Box>
            )}
            <AddButton
              onAdd={() => {
                // TODO: implement transporter creation
              }}
            />
          </Box>
        </FormControl>
      </Box>
      <Box display="flex" justifyContent="space-around" gap={16}>
        <FormControl mb={4}>
          <Box
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            <FormLabel>{t("Product ID")}</FormLabel>
            <Search onSearch={() => setIsSearchingProduct((prev) => !prev)} />
          </Box>
          <Controller
            name="productId"
            control={control}
            defaultValue=""
            rules={{ required: true }}
            render={({ field }) => (
              <>
                {isSearchingProduct && (
                  <SearchProduct setResults={setProductsSearched} />
                )}
                {productsSearched?.length === 0 && isSearchingProduct ? null : (
                  <Select
                    {...field}
                    placeholder={
                      productsSearched?.length
                        ? ""
                        : t("Start by searching for a product name")
                    }
                  >
                    {productsSearched?.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </Select>
                )}
              </>
            )}
          />
          {errors.productId && (
            <Box color="red">{t("This field is required")}</Box>
          )}
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>{t("Lot ID")}</FormLabel>
          <Controller
            name="lotId"
            control={control}
            defaultValue=""
            rules={{ required: true }}
            render={({ field }) => (
              <Select {...field}>
                <option value="">{t("Select the lot")}</option>
                {/* TODO: MAP OVER THE lots CREATED */}
                {getLotsData?.lots.map((lots) => (
                  <option key={lots.id} value={lots.id}>
                    {lots.name}
                  </option>
                ))}
              </Select>
            )}
          />
          {errors.lotId && <Box color="red">{t("This field is required")}</Box>}
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>{t("Expiry Date")}</FormLabel>
          <Controller
            name="expirityDate"
            control={control}
            defaultValue=""
            rules={{ required: true }}
            render={({ field }) => <Input {...field} />}
          />
          {errors.expirityDate && (
            <Box color="red">{t("This field is required")}</Box>
          )}
        </FormControl>
      </Box>
      <Box display="flex" justifyContent="space-around" gap={16}>
        <FormControl mb={4}>
          <FormLabel>{t("Pallet Number")}</FormLabel>
          <Controller
            name="palletNumber"
            control={control}
            defaultValue=""
            rules={{ required: true }}
            render={({ field }) => <Input {...field} />}
          />
          {errors.palletNumber && (
            <Box color="red">{t("This field is required")}</Box>
          )}
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>{t("Units Number")}</FormLabel>
          <Controller
            name="unitsNumber"
            control={control}
            defaultValue={0}
            rules={{ required: true }}
            render={({ field }) => <Input type="number" {...field} />}
          />
          {errors.unitsNumber && (
            <Box color="red">{t("This field is required")}</Box>
          )}
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>{t("Loose Units Number")}</FormLabel>
          <Controller
            name="looseUnitsNumber"
            control={control}
            defaultValue={0}
            rules={{ required: true }}
            render={({ field }) => <Input type="number" {...field} />}
          />
          {errors.looseUnitsNumber && (
            <Box color="red">{t("This field is required")}</Box>
          )}
        </FormControl>
      </Box>
      <Box display="flex" justifyContent="space-around" gap={16}>
        <FormControl mb={4}>
          <FormLabel>{t("Total Units Number")}</FormLabel>
          <Controller
            name="totalUnitsNumber"
            control={control}
            defaultValue={0}
            rules={{ required: true }}
            render={({ field }) => (
              <Input type="number" {...field} isReadOnly />
            )}
          />
          {errors.totalUnitsNumber && (
            <Box color="red">{t("This field is required")}</Box>
          )}
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>{t("Height (CMs)")}</FormLabel>
          <Controller
            name="heightCMs"
            control={control}
            defaultValue={0}
            rules={{ required: true }}
            render={({ field }) => <Input type="number" {...field} />}
          />
          {errors.heightCMs && (
            <Box color="red">{t("This field is required")}</Box>
          )}
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>{t("Width (CMs)")}</FormLabel>
          <Controller
            name="widthCMs"
            control={control}
            defaultValue={0}
            rules={{ required: true }}
            render={({ field }) => <Input type="number" {...field} />}
          />
          {errors.widthCMs && (
            <Box color="red">{t("This field is required")}</Box>
          )}
        </FormControl>
      </Box>
      <FormControl mb={4}>
        <FormLabel>{t("Description")}</FormLabel>
        <Controller
          name="description"
          control={control}
          defaultValue=""
          rules={{ required: true }}
          render={({ field }) => <Input {...field} />}
        />
        {errors.description && (
          <Box color="red">{t("This field is required")}</Box>
        )}
      </FormControl>
      <Button
        type="submit"
        colorScheme="teal"
        disabled={isLoadingAddEntry || isLoadingUpdateEntry}
      >
        {entryToEdit ? t("Edit Entry") : t("Create Entry")}
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent width={"100%"} maxW={"80vw"}>
          <ModalHeader>{t("Add Supplier")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody width={"100%"}>
            {/* Add form fields for creating a new supplier here */}
            <CreateSupplierForm />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};
