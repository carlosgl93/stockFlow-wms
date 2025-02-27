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
} from "@chakra-ui/react";
import { useForm, Controller } from "react-hook-form";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useStock } from "../infraestructure/useStock";
import { useToast } from "shared/Toast";
import { IStock } from "../types";
import { useTranslate } from "utils";
import { FlexBox, FlexColumn, Loading } from "shared/Layout";
import { AddButton, Search as SearchButton } from "shared/Actions";
import { Logger } from "utils/logger";
import { IProduct } from "modules/products/types";
import { searchProduct, useProducts } from "modules/products/infrastructure";
import { Search } from "shared/Form";
import { CreateProductForm } from "modules/products/presentation";
import { usePlaces } from "modules/places/infra";

export const CreateStockForm = ({ stockToEdit }: { stockToEdit?: IStock }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchingProduct, setIsSearchingProduct] = useState(false);
  const [searchResults, setSearchedResults] = useState<null | IProduct[]>(null);

  const { products: getProductsData, isFetching } = useProducts(5);
  const { getPlacesData, isLoadingGetPlaces } = usePlaces();

  const [products, setProducts] = useState<IProduct[]>([]);

  const {
    addStockMutation,
    updateStockMutation,
    isLoadingAddStock,
    isLoadingUpdateStock,
  } = useStock();

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    trigger,
  } = useForm<IStock>();
  const toast = useToast();
  const { t } = useTranslate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleNewProduct = useCallback(
    (newProduct: IProduct) => {
      setProducts((prev) => [...prev, newProduct]);
      setValue("productId", newProduct.id || "");
      onClose();
    },
    [setValue, onClose]
  );

  const onSubmit = async (data: IStock) => {
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
      if (stockToEdit) {
        await updateStockMutation({ stockId: stockToEdit.id, values: data });
      } else {
        await addStockMutation(data);
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
    if (stockToEdit) {
      Object.keys(stockToEdit).forEach((key) => {
        setValue(key as keyof IStock, stockToEdit[key as keyof IStock]);
      });
      trigger();
    }
  }, [setValue, stockToEdit, trigger]);

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
  }, [searchResults, getProductsData, isOpen]);

  useEffect(() => {
    setValue("id", getPlacesData?.places[0]?.id || "");
    trigger();
  }, [getPlacesData]);

  if (isLoadingAddStock || isLoadingUpdateStock) {
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
        <Box display="flex" justifyContent="space-around" gap={16}>
          <FormControl mb={4}>
            <FlexBox alignItems={"center"} mb={2}>
              <FormLabel>{t("Product")}</FormLabel>
              <FlexBox gap={2}>
                <SearchButton
                  onSearch={() => setIsSearchingProduct((prev) => !prev)}
                />
                <AddButton onAdd={onOpen} />
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
          <FormControl mb={4}>
            <FormLabel>{t("Lot")}</FormLabel>
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
        </Box>
        <Box display="flex" justifyContent="space-around" gap={16}>
          <FormControl mb={4}>
            <FlexBox>
              <FormLabel>{t("Place")}</FormLabel>
            </FlexBox>
            <Controller
              name="id"
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
        <Button
          type="submit"
          colorScheme="teal"
          disabled={isLoadingAddStock || isLoadingUpdateStock}
        >
          {stockToEdit ? t("Edit Stock") : t("Create Stock")}
        </Button>
      </Box>
      <Modal isOpen={isOpen} onClose={onClose}>
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
