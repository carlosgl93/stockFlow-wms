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
  Tooltip,
} from "@chakra-ui/react";
import { Controller } from "react-hook-form";
import { IEntry, IEntryForm } from "../types";
import { FlexBox, FlexColumn, Loading } from "shared/Layout";
import { AddButton, Search as SearchButton } from "shared/Actions";
import {
  CreateSupplierForm,
  ISupplier,
  searchSupplier,
} from "modules/suppliers";
import { IProduct } from "modules/products/types";
import { searchProduct } from "modules/products/infrastructure";
import { Search } from "shared/Form";
import { ITransporter } from "modules/transporters/types";
import { searchTransporter } from "modules/transporters/infrastructure";
import { CreateProductForm } from "modules/products/presentation";
import { CreateTransporterForm } from "modules/transporters/presentation";
import { DataGrid } from "@mui/x-data-grid";
import { CreateEntryController } from "../infraestructure";
import { AppThemeProvider } from "theme/materialTheme";
import { InfoIcon } from "@chakra-ui/icons";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { capitalize } from "../../../utils/format/capitalize";

export const CreateEntryForm = ({ entryToEdit }: { entryToEdit?: IEntry }) => {
  const [showBoxTooltip, setShowBoxTooltip] = useState(false);
  const [showUnitsTooltip, setShowUnitsTooltip] = useState(false);
  const [showTotalTooltip, setShowTotalTooltip] = useState(false);

  const {
    isLoading,
    setIsLoading,
    isSearchingSupplier,
    setIsSearchingSupplier,
    isSearchingTransporter,
    setIsSearchingTransporter,
    isSearchingProduct,
    setIsSearchingProduct,
    searchResults,
    isLoadingGetSuppliers,
    isLoadingGetTransporters,
    isFetching,
    getPlacesData,
    isLoadingGetPlaces,
    suppliers,
    setSuppliers,
    transporters,
    setTransporters,
    products,
    setProducts,
    isLoadingAddEntry,
    isLoadingUpdateEntry,
    handleSubmit,
    control,
    errors,
    watch,
    t,
    isOpen,
    onOpen,
    onClose,
    isOpenCreateTransporter,
    onOpenCreateTransporter,
    onCloseCreateTransporter,
    handleNewTransporter,
    isOpenCreateProduct,
    onOpenCreateProduct,
    onCloseCreateProduct,
    handleNewProduct,
    handleNewSupplier,
    onSubmit,
    columns,
    rows,
    register,
    handleAddProductToEntry,
    selectedProduct,
    addedToEntry,
    setSelectedProduct,
    handleRowClick,
  } = CreateEntryController({ entryToEdit: entryToEdit || null });

  const unitsNumber = watch("unitsNumber");
  const looseUnitsNumber = watch("looseUnitsNumber");
  const productId = watch("productId");

  // Add useEffect to update selectedProduct when productId changes
  useEffect(() => {
    if (productId && products.length > 0) {
      const product = products.find((p) => p.id === productId);
      if (product && product !== selectedProduct) {
        setSelectedProduct(product);
      }
    }
  }, [productId, products, selectedProduct, setSelectedProduct]);

  const boxesTooltipLabel = `${t("Each box is made up of")} ${
    selectedProduct?.boxDetails?.units
  } ${t(selectedProduct?.boxDetails?.container || "").toLowerCase()} ${t(
    "of"
  )} ${selectedProduct?.boxDetails?.quantity}  ${t(
    selectedProduct?.boxDetails?.unitOfMeasure || ""
  ).toLowerCase()} ${t("per")}`;

  const unitsTooltipLabel = `${t("Each unit is made up of")} ${
    selectedProduct?.boxDetails?.container?.toLowerCase() || "of"
  } ${selectedProduct?.boxDetails?.quantity || ""} ${t(
    selectedProduct?.boxDetails?.unitOfMeasure || ""
  ).toLowerCase()}`;

  const looseUnitsTooltipLabel = `${t("Each unit is made up of")} ${
    selectedProduct?.boxDetails?.container?.toLowerCase() || "of"
  } ${t("of")} ${selectedProduct?.boxDetails?.quantity || ""} ${t(
    selectedProduct?.boxDetails?.unitOfMeasure || ""
  ).toLowerCase()}`;

  const totalValue =
    selectedProduct?.selectionType === "box"
      ? (selectedProduct?.boxDetails?.units || 0) * (unitsNumber || 0) +
        (looseUnitsNumber || 0)
      : (selectedProduct?.boxDetails?.quantity || 0) * (unitsNumber || 0);

  if (isLoadingAddEntry || isLoadingUpdateEntry) {
    return <Loading />;
  }

  return (
    <>
      <Box
        as="form"
        onSubmit={handleSubmit(
          onSubmit as unknown as (data: IEntryForm) => void // TODO: improve this. im using this because i need to extract the product data from the form
        )}
        p={5}
        display={"flex"}
        flexDirection={"column"}
      >
        <Box display="flex" justifyContent="space-around" gap={16}>
          <FormControl mb={4}>
            <FlexBox mb={2}>
              <FormLabel>{t("Supplier")}</FormLabel>
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
                            {capitalize(trans.name)}
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
          <FormControl mb={4}>
            <FormLabel my={3}>{t("Entry Date")}</FormLabel>
            <Controller
              name="entryDate"
              control={control}
              defaultValue={dayjs().format("DD-MM-YYYY")}
              rules={{ required: true }}
              render={({ field }) => <Input {...field} type="date" />}
            />
            {errors.entryDate && (
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
                    value={field.value || ""} // Ensure controlled component
                    onChange={(e) => {
                      field.onChange(e);
                      setIsSearchingProduct(false);
                      const selectedProd =
                        products.find(
                          (product) => product.id === e.target.value
                        ) || null;
                      setSelectedProduct(selectedProd);
                    }}
                  >
                    <option value="">{t("Select a product")}</option>
                    {products?.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name.toUpperCase()}
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
            <FormLabel my={3}>{t("Lot")}</FormLabel>
            <Controller
              name="lotId"
              control={control}
              defaultValue=""
              rules={{}}
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
                    {getPlacesData?.places?.length === 0 ? (
                      <option value="" style={{ color: "red" }}>
                        {t("There are no places created!")}
                      </option>
                    ) : (
                      <option value="">{t("Select the place")}</option>
                    )}
                    <option value={undefined}>
                      {t("I will not specify a place")}
                    </option>

                    {getPlacesData?.places
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((places) => (
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
            <FormLabel my={3}>{t("Expiry Date")}</FormLabel>
            <Controller
              name="expirityDate"
              control={control}
              defaultValue=""
              rules={{}}
              render={({ field }) => <Input {...field} type="date" />}
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
              render={({ field }) => <Input {...field} />}
            />
          </FormControl>
          <FormControl mb={4}>
            <FlexBox>
              {selectedProduct?.selectionType === "box" ? (
                <>
                  <FormLabel>{t("Boxes Number")}</FormLabel>
                  <Tooltip
                    label={boxesTooltipLabel}
                    isOpen={showBoxTooltip}
                    placement="top"
                    hasArrow
                  >
                    <InfoIcon
                      onMouseOver={() => {
                        setShowBoxTooltip(true);
                      }}
                      onMouseOut={() => {
                        setShowBoxTooltip(false);
                      }}
                    />
                  </Tooltip>
                </>
              ) : (
                <>
                  <FormLabel>{t("Units Number")}</FormLabel>
                  <Tooltip
                    label={unitsTooltipLabel}
                    isOpen={showUnitsTooltip}
                    placement="top"
                    hasArrow
                  >
                    <InfoIcon
                      onMouseOver={() => {
                        setShowUnitsTooltip(true);
                      }}
                      onMouseOut={() => {
                        setShowUnitsTooltip(false);
                      }}
                    />
                  </Tooltip>
                </>
              )}
            </FlexBox>
            <Controller
              name="unitsNumber"
              control={control}
              defaultValue={0}
              rules={{}}
              render={({ field }) => (
                <Input
                  type="number"
                  {...field}
                  {...register("unitsNumber", {
                    valueAsNumber: true,
                  })}
                />
              )}
            />
            {errors.unitsNumber && (
              <Box color="red">{t("This field is required")}</Box>
            )}
          </FormControl>
          {selectedProduct?.selectionType === "box" && (
            <FormControl mb={4}>
              <FlexBox>
                <FormLabel>{t("Loose Units Number")}</FormLabel>
                <Tooltip
                  label={looseUnitsTooltipLabel}
                  isOpen={showUnitsTooltip}
                  placement="top"
                  hasArrow
                >
                  <InfoIcon
                    onMouseOver={() => {
                      setShowUnitsTooltip(true);
                    }}
                    onMouseOut={() => {
                      setShowUnitsTooltip(false);
                    }}
                  />
                </Tooltip>
              </FlexBox>
              <Controller
                name="looseUnitsNumber"
                control={control}
                defaultValue={0}
                rules={{}}
                render={({ field }) => (
                  <Input
                    type="number"
                    {...field}
                    {...register("looseUnitsNumber", {
                      valueAsNumber: true,
                    })}
                  />
                )}
              />
              {errors.looseUnitsNumber && (
                <Box color="red">{t("This field is required")}</Box>
              )}
            </FormControl>
          )}
          <FormControl mb={4}>
            <FlexBox>
              <FormLabel>
                {`${t("Total of")} ${
                  ["Gram", "ML", "C.C"].includes(
                    selectedProduct?.boxDetails?.unitOfMeasure || ""
                  )
                    ? t(
                        selectedProduct?.boxDetails?.unitOfMeasure === "Gram"
                          ? "Kilo"
                          : selectedProduct?.boxDetails?.unitOfMeasure ===
                              "ML" ||
                            selectedProduct?.boxDetails?.unitOfMeasure === "C.C"
                          ? "Liter"
                          : selectedProduct?.boxDetails?.unitOfMeasure || ""
                      )
                    : t(selectedProduct?.boxDetails?.unitOfMeasure || "")
                }`}
              </FormLabel>
              <Tooltip
                label={
                  selectedProduct?.selectionType === "box"
                    ? `${t("Units per box")}: (${
                        selectedProduct?.boxDetails?.units
                      }) * ${t("Boxes to enter")} (${unitsNumber}) + ${t(
                        "Loose units to enter"
                      )} (${looseUnitsNumber}) = ${
                        ["Gram", "ML", "C.C"].includes(
                          selectedProduct?.boxDetails?.unitOfMeasure || ""
                        )
                          ? (totalValue / 1000).toLocaleString(undefined, {
                              maximumFractionDigits: 3,
                            })
                          : totalValue
                      } ${
                        selectedProduct?.boxDetails?.unitOfMeasure === "Gram"
                          ? t("Kilo")
                          : selectedProduct?.boxDetails?.unitOfMeasure ===
                              "ML" ||
                            selectedProduct?.boxDetails?.unitOfMeasure === "C.C"
                          ? t("Liter")
                          : t(selectedProduct?.boxDetails?.unitOfMeasure || "")
                      }`
                    : `${selectedProduct?.boxDetails?.quantity} ${t(
                        selectedProduct?.boxDetails?.unitOfMeasure || ""
                      )} * ${unitsNumber} = ${
                        ["Gram", "ML", "C.C"].includes(
                          selectedProduct?.boxDetails?.unitOfMeasure || ""
                        )
                          ? (totalValue / 1000).toLocaleString(undefined, {
                              maximumFractionDigits: 3,
                            })
                          : totalValue
                      } ${
                        selectedProduct?.boxDetails?.unitOfMeasure === "Gram"
                          ? t("Kilo")
                          : selectedProduct?.boxDetails?.unitOfMeasure ===
                              "ML" ||
                            selectedProduct?.boxDetails?.unitOfMeasure === "C.C"
                          ? t("Liter")
                          : t(selectedProduct?.boxDetails?.unitOfMeasure || "")
                      }`
                }
                isOpen={showTotalTooltip}
                placement="top"
                hasArrow
              >
                <InfoIcon
                  onMouseOver={() => {
                    setShowTotalTooltip(true);
                  }}
                  onMouseOut={() => {
                    setShowTotalTooltip(false);
                  }}
                />
              </Tooltip>
            </FlexBox>
            <Controller
              name="totalUnitsNumber"
              control={control}
              rules={{}}
              render={({ field }) => {
                const isSpecialUnit = ["Gram", "ML", "C.C"].includes(
                  selectedProduct?.boxDetails?.unitOfMeasure || ""
                );
                const displayValue = isSpecialUnit
                  ? totalValue / 1000
                  : totalValue;
                return (
                  <Input
                    type="number"
                    {...field}
                    {...register("totalUnitsNumber", {
                      valueAsNumber: true,
                    })}
                    value={displayValue}
                    disabled
                  />
                );
              }}
            />
            {errors.totalUnitsNumber && (
              <Box color="red">{t("This field is required")}</Box>
            )}
          </FormControl>
        </Box>
        <Box display="flex" justifyContent="space-around" gap={16}>
          {/* <FormControl mb={4}>
            <FormLabel>{t("Height (CMs)")}</FormLabel>
            <Controller
              name="heightCMs"
              control={control}
              defaultValue={0}
              rules={{}}
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
              rules={{}}
              render={({ field }) => <Input type="number" {...field} />}
            /> */}
          {/* {errors.widthCMs && (
              <Box color="red">{t("This field is required")}</Box>
            )}
          </FormControl> */}
        </Box>
        <Button
          onClick={handleAddProductToEntry}
          colorScheme="green"
          disabled={!productId || !unitsNumber}
        >
          {t("Add product to the list")}
        </Button>
        <AppThemeProvider>
          <DataGrid
            rows={rows || []}
            columns={columns}
            rowCount={rows?.length || 100}
            onRowClick={handleRowClick}
          />
        </AppThemeProvider>

        <Button
          type="submit"
          colorScheme="teal"
          disabled={
            isLoadingAddEntry || isLoadingUpdateEntry || !addedToEntry?.length
          }
        >
          {entryToEdit ? t("Edit Entry") : t("Create Entry")}
        </Button>
      </Box>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent width={"100%"} maxW={"80vw"}>
          <ModalHeader>{t("Add Supplier")}</ModalHeader>
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
