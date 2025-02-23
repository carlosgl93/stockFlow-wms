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
  useDisclosure,
  RadioGroup,
  Radio,
} from "@chakra-ui/react";
import { useForm, Controller } from "react-hook-form";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useToast } from "shared/Toast";
import { useTranslate } from "utils";
import { FlexBox, FlexColumn, Loading } from "shared/Layout";
import { AddButton, Search as SearchButton } from "shared/Actions";
import { Logger } from "utils/logger";
import {
  useSuppliers,
  CreateSupplierForm,
  ISupplier,
  searchSupplier,
} from "modules/suppliers";
import { useLots, usePlaces } from "modules/lots/infraestructure";
import { DispatchFixture } from "utils/fixtures";
import { IProduct } from "modules/products/types";
import { searchProduct, useProducts } from "modules/products/infrastructure";
import { Search } from "shared/Form";
import { ITransporter } from "modules/transporters/types";
import {
  searchTransporter,
  useTransporters,
} from "modules/transporters/infrastructure";
import { CreateProductForm } from "modules/products/presentation";
import { CreateTransporterForm } from "modules/transporters/presentation";
import { ValidationError } from "shared/Error";
import { useDispatches } from "../infraestructure";
import { DocumentType, IDispatch } from "../types";

export const CreateDispatchForm = ({
  dispatchToEdit,
}: {
  dispatchToEdit?: IDispatch;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchingSupplier, setIsSearchingSupplier] = useState(false);
  const [isSearchingTransporter, setIsSearchingTransporter] = useState(false);
  const [isSearchingProduct, setIsSearchingProduct] = useState(false);
  const [searchResults, setSearchedResults] = useState<
    null | (IProduct | ITransporter | ISupplier)[]
  >(null);
  const [willSpecifyPlace, setWillSpecifyPlace] = useState(true);

  const toast = useToast();
  const { t } = useTranslate();
  const { getSuppliersData, isLoadingGetSuppliers } = useSuppliers(5);
  const { getTransporters, isLoadingGetTransporters } = useTransporters(5);
  const { products: getProductsData, isFetching } = useProducts(5);
  const { getPlacesData, isLoadingGetPlaces } = usePlaces();

  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
  const [transporters, setTransporters] = useState<ITransporter[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);

  const {
    addDispatchMutation,
    updateDispatchMutation,
    isLoadingAddDispatch,
    isLoadingUpdateDispatch,
  } = useDispatches();

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    trigger,
    watch,
  } = useForm<IDispatch>();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpenCreateTransporter,
    onOpen: onOpenCreateTransporter,
    onClose: onCloseCreateTransporter,
  } = useDisclosure();

  const {
    isOpen: isOpenCreateProduct,
    onOpen: onOpenCreateProduct,
    onClose: onCloseCreateProduct,
  } = useDisclosure();

  const handleNewSupplier = useCallback(
    (newSupplier: ISupplier) => {
      setSuppliers((prev) => [...prev, newSupplier]);
      Logger.info("new supplier", [newSupplier]);
      setValue("supplierId", newSupplier.id || "");
      onClose();
    },
    [setValue, onClose]
  );

  const handleNewTransporter = useCallback(
    (newTransporter: ITransporter) => {
      setTransporters((prev) => [...prev, newTransporter]);
      setValue("transporterId", newTransporter.id || "");
      onCloseCreateTransporter();
    },
    [setValue, onCloseCreateTransporter]
  );

  const handleNewProduct = useCallback(
    (newProduct: IProduct) => {
      setProducts((prev) => [...prev, newProduct]);
      setValue("productId", newProduct.id || "");
      onCloseCreateProduct();
    },
    [setValue, onCloseCreateProduct]
  );

  const onSubmit = async (data: IDispatch) => {
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
      if (dispatchToEdit) {
        if (!dispatchToEdit.id) {
          throw new ValidationError("Entry to edit has no id");
        }
        await updateDispatchMutation({
          dispatchId: dispatchToEdit.id,
          values: data,
        });
      } else {
        await addDispatchMutation(data);
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
    if (dispatchToEdit) {
      Object.keys(dispatchToEdit).forEach((key) => {
        setValue(
          key as keyof IDispatch,
          dispatchToEdit[key as keyof IDispatch]
        );
      });
      trigger();
    } else if (import.meta.env.MODE === "development") {
      const entry = DispatchFixture.toStructure();
      Object.keys(entry).forEach((key) => {
        setValue(key as keyof IDispatch, entry[key as keyof IDispatch]);
      });
      trigger();
    }
  }, [setValue, dispatchToEdit, trigger]);

  useEffect(() => {
    const uniqueSuppliers = [
      ...((searchResults as ISupplier[]) || []),
      ...(getSuppliersData?.suppliers || []),
    ].filter(
      (supplier, index, self) =>
        index === self.findIndex((s) => s.id === supplier.id)
    );
    setSuppliers(uniqueSuppliers);
    setValue("supplierId", uniqueSuppliers[0]?.id || "");
    trigger();
  }, [searchResults, getSuppliersData?.suppliers, isOpen]);

  useEffect(() => {
    const uniqueTransporters = [
      ...((searchResults as ITransporter[]) || []),
      ...(getTransporters || []),
    ].filter(
      (transporter, index, self) =>
        index === self.findIndex((s) => s.id === transporter.id)
    );
    setTransporters(uniqueTransporters);
    setValue("transporterId", uniqueTransporters[0]?.id || "");
    trigger();
  }, [
    searchResults,
    getTransporters,
    isOpenCreateProduct,
    isOpenCreateTransporter,
  ]);

  useEffect(() => {
    const uniqueProducts = [
      ...((searchResults as IProduct[]) || []),
      ...(getProductsData || []),
    ].filter(
      (product, index, self) =>
        index === self.findIndex((s) => s.id === product.id)
    );
    setProducts(uniqueProducts);
    setValue("productId", uniqueProducts[0]?.id || "");
    trigger();
  }, [searchResults, getProductsData, isOpenCreateProduct]);

  useEffect(() => {
    setValue("placeId", getPlacesData?.places[0]?.id || "");
    trigger();
  }, [getPlacesData]);

  if (isLoadingAddDispatch || isLoadingUpdateDispatch) {
    return <Loading />;
  }

  return (
    <>
      <Box
        as="form"
        onSubmit={handleSubmit(onSubmit)}
        p={5}
        display={"flex"}
        flexDirection={"column"}
      >
        <FlexBox justifyContent="space-around" gap={16}>
          <FormControl mb={4}>
            <FormLabel>{t("Document Type")}</FormLabel>
            <Controller
              name="docType"
              control={control}
              defaultValue={dispatchToEdit?.docType || DocumentType.Dispatch}
              rules={{ required: true }}
              render={({ field }) => (
                <RadioGroup {...field} display={"flex"} gap={4} mt={4}>
                  {Object.values(DocumentType).map((type) => (
                    <Radio key={type} value={type}>
                      {t(type)}
                    </Radio>
                  ))}
                </RadioGroup>
              )}
            />
            {errors.docType && (
              <Box color="red">{t("This field is required")}</Box>
            )}
          </FormControl>
        </FlexBox>
        <Box display="flex" justifyContent="space-around" gap={16}>
          <FormControl mb={4}>
            <FormLabel>{t("Document Number")}</FormLabel>
            <Controller
              name="docNumber"
              control={control}
              defaultValue=""
              rules={{ required: true }}
              render={({ field }) => <Input {...field} mt={4} />}
            />
            {errors.docNumber && (
              <Box color="red">{t("This field is required")}</Box>
            )}
          </FormControl>
          <FormControl mb={4}>
            <FlexBox mb={2}>
              <FormLabel>{t("Customer")}</FormLabel>
              <FlexBox gap={2}>
                <SearchButton
                  onSearch={() => setIsSearchingSupplier((prev) => !prev)}
                />
                <AddButton onAdd={onOpen} />
              </FlexBox>
            </FlexBox>
            <FlexColumn alignItems="start" gap={2}>
              <Controller
                name="supplierId"
                control={control}
                defaultValue=""
                rules={{ required: true }}
                render={({ field }) => (
                  <>
                    {isSearchingSupplier && (
                      <Search<ISupplier>
                        placeholderText={t("Search for a supplier name")}
                        searchFunction={searchSupplier}
                        setResults={setSuppliers}
                        notFoundText={t("No suppliers found for this term")}
                        setIsLoading={setIsLoading}
                      />
                    )}
                    {/* IN DISPATCHES THE SUPPLIERS ARE THE SAME AS THE CUSTOMERS */}
                    {isLoadingGetSuppliers ? (
                      <FlexBox justifyContent="center" w={"100%"}>
                        <Loading size="xs" />
                      </FlexBox>
                    ) : searchResults?.length === 0 &&
                      isSearchingSupplier &&
                      watch("supplierId") === undefined ? null : (
                      <Select
                        {...field}
                        onChange={(e) => {
                          field.onChange(e); // Update the form state
                          setIsSearchingSupplier(false); // Close the search
                        }}
                      >
                        {suppliers?.map((supp) => (
                          <option key={supp.id} value={supp.id}>
                            {supp.company}
                          </option>
                        ))}
                      </Select>
                    )}
                  </>
                )}
              />
            </FlexColumn>
            {errors.supplierId && (
              <Box color="red">{t("This field is required")}</Box>
            )}
          </FormControl>
          <FormControl mb={4}>
            <FlexBox mb={2}>
              <FormLabel>{t("Transporter")}</FormLabel>
              <FlexBox gap={2}>
                <SearchButton
                  onSearch={() => setIsSearchingTransporter((prev) => !prev)}
                />
                <AddButton onAdd={onOpenCreateTransporter} />
              </FlexBox>
            </FlexBox>
            <FlexColumn gap={2} alignItems={"start"}>
              <Controller
                name="transporterId"
                control={control}
                defaultValue=""
                rules={{ required: true }}
                render={({ field }) => (
                  <>
                    {isSearchingTransporter && (
                      <Search<ITransporter>
                        placeholderText={t("Search for a transporter name")}
                        searchFunction={searchTransporter}
                        setResults={setTransporters}
                        notFoundText={t("No transporters found for this term")}
                        setIsLoading={setIsLoading}
                      />
                    )}

                    {isLoadingGetTransporters ? (
                      <FlexBox justifyContent="center" w={"100%"}>
                        <Loading size="xs" />
                      </FlexBox>
                    ) : searchResults?.length === 0 &&
                      isSearchingTransporter &&
                      watch("transporterId") === undefined ? null : (
                      <Select
                        {...field}
                        onChange={(e) => {
                          field.onChange(e); // Update the form state
                          setIsSearchingTransporter(false); // Close the search
                        }}
                      >
                        {transporters?.map((trans) => (
                          <option key={trans.id} value={trans.id}>
                            {trans.name}
                          </option>
                        ))}
                      </Select>
                    )}
                  </>
                )}
              />
            </FlexColumn>
            {errors.transporterId && (
              <Box color="red">{t("This field is required")}</Box>
            )}
          </FormControl>
        </Box>
        <Box display="flex" justifyContent="space-around" gap={16}>
          <FormControl mb={4}>
            <FlexBox alignItems={"center"} mb={2}>
              <FormLabel>{t("Product")}</FormLabel>
              <FlexBox gap={2}>
                <SearchButton
                  onSearch={() => setIsSearchingProduct((prev) => !prev)}
                />
                <AddButton onAdd={onOpenCreateProduct} />
              </FlexBox>
            </FlexBox>
            <Controller
              name="productId"
              control={control}
              defaultValue=""
              rules={{ required: true }}
              render={({ field }) => (
                <>
                  {isSearchingProduct && (
                    <Search<IProduct>
                      placeholderText={t("Search for a product name")}
                      searchFunction={searchProduct}
                      setResults={setProducts}
                      notFoundText="No products found"
                      setIsLoading={setIsLoading}
                    />
                  )}
                  {isFetching ? (
                    <FlexBox justifyContent="center" w={"100%"}>
                      <Loading size="xs" />
                    </FlexBox>
                  ) : (
                    isSearchingProduct && isLoading && <Loading size="xs" />
                  )}
                  <Select
                    {...field}
                    onChange={(e) => {
                      field.onChange(e); // Update the form state
                      setIsSearchingProduct(false); // Close the search
                    }}
                  >
                    {products?.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </Select>
                </>
              )}
            />
            {errors.productId && (
              <Box color="red">{t("This field is required")}</Box>
            )}
          </FormControl>
          {/* TODO:  */}
          <FormControl mb={4}>
            <FormLabel my={3}>{t("Lot")}</FormLabel>
            <Controller
              name="lotId"
              control={control}
              defaultValue=""
              rules={{ required: true }}
              render={({ field }) => <Input {...field} />}
            />
            {errors.lotId && (
              <Box color="red">{t("This field is required")}</Box>
            )}
          </FormControl>
          <FormControl mb={4}>
            <FormLabel my={3}>{t("Place")}</FormLabel>

            <Controller
              name="placeId"
              control={control}
              defaultValue=""
              render={({ field }) =>
                isLoadingGetPlaces ? (
                  <FlexBox justifyContent="center" w={"100%"}>
                    <Loading size="xs" />
                  </FlexBox>
                ) : (
                  <Select {...field}>
                    {getPlacesData?.places.length === 0 ? (
                      <option value="" style={{ color: "red" }}>
                        {t("There are no places created!")}
                      </option>
                    ) : (
                      <option value="">{t("Select the place")}</option>
                    )}
                    <option value={undefined}>
                      {t("I will not specify a place")}
                    </option>

                    {getPlacesData?.places.map((places) => (
                      <option key={places.id} value={places.id}>
                        {places.name}
                      </option>
                    ))}
                  </Select>
                )
              }
            />
            {errors.lotId && (
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
        {/* TODO: Implement boxes per pallet calculator */}
        <Button
          type="submit"
          colorScheme="teal"
          disabled={isLoadingAddDispatch || isLoadingUpdateDispatch}
        >
          {dispatchToEdit ? t("Edit Entry") : t("Create Entry")}
        </Button>
      </Box>
      {/* TODO: IMPLEMENT GRID TO DISPLAY THE SELECTED PRODUCTS THAT HAVE BEEN SELECTED TO DISPATCH WITH THE FOLLOWING COLUMNS:
        1. Row number
        2. extCode
        3. internalCode
        4. product name
        5. Safety Document boolean
        6. Units number
        7. Loose Units number
        8. Total Units number
        9. Status
      */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent width={"100%"} maxW={"80vw"}>
          <ModalHeader>{t("Add Customer")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody width={"100%"}>
            <CreateSupplierForm onSuccess={handleNewSupplier} />
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isOpenCreateTransporter}
        onClose={onCloseCreateTransporter}
      >
        <ModalOverlay />
        <ModalContent width={"100%"} maxW={"80vw"}>
          <ModalHeader>{t("Add Transporter")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody width={"100%"}>
            <CreateTransporterForm onSuccess={handleNewTransporter} />
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpenCreateProduct} onClose={onCloseCreateProduct}>
        <ModalOverlay />
        <ModalContent width={"100%"} maxW={"80vw"}>
          <ModalHeader>{t("Add Product")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody width={"100%"}>
            <CreateProductForm onSuccess={handleNewProduct} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
