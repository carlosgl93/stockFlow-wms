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
  RadioGroup,
  Radio,
  Tooltip,
  Text,
} from "@chakra-ui/react";
import { Controller } from "react-hook-form";
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
import { CreateDispatchController } from "../infraestructure";
import { DocumentType, IDispatch, DispatchedStatus } from "../types";
import { AppThemeProvider } from "theme/materialTheme";
import { DataGrid } from "@mui/x-data-grid";
import { searchLot } from "modules/lots/infraestructure";
import { IStock } from "modules/stock/types";
import { InfoIcon } from "@chakra-ui/icons";
import { capitalize } from "../../../utils/format/capitalize";

export const CreateDispatchForm = ({
  dispatchToEdit,
}: {
  dispatchToEdit?: IDispatch;
}) => {
  const {
    isLoading,
    isSearchingSupplier,
    isSearchingTransporter,
    isSearchingProduct,
    searchResults,
    suppliers,
    transporters,
    products,
    handleSubmit,
    control,
    errors,
    watch,
    onSubmit,
    handleNewSupplier,
    handleNewTransporter,
    handleNewProduct,
    onOpen,
    onClose,
    isOpen,
    isOpenCreateTransporter,
    onOpenCreateTransporter,
    onCloseCreateTransporter,
    isOpenCreateProduct,
    onOpenCreateProduct,
    onCloseCreateProduct,
    isLoadingGetSuppliers,
    isLoadingGetTransporters,
    isFetching,
    isLoadingGetPlaces,
    isLoadingAddDispatch,
    isLoadingUpdateDispatch,
    t,
    setIsSearchingProduct,
    setIsSearchingSupplier,
    setIsSearchingTransporter,
    setSuppliers,
    setIsLoading,
    setTransporters,
    setProducts,
    getPlacesData,
    columns,
    rows,
    handleAddProductToDispatch,
    isSearchingLot,
    setLots,
    setIsSearchingLot,
    getProductLotsData,
    setProductId,
    lotId,
    setLotId,
    totalStockByLotAndProduct,
    isLoadingTotalStockByLotAndProduct,
    productId,
    showUnitsTooltip,
    showTotalTooltip,
    setShowUnitsTooltip,
    setShowTotalTooltip,
    unitsTooltipLabel,
    setSelectedProduct,
    selectedProduct,
    register,
    inStockValue,
    isLoadingSaveTransporter,
  } = CreateDispatchController({ dispatchToEdit });

  const totalValue =
    selectedProduct?.selectionType === "box"
      ? (selectedProduct?.boxDetails?.units || 0) * watch("unitsNumber") +
        watch("looseUnitsNumber")
      : (selectedProduct?.boxDetails?.quantity || 0) * watch("unitsNumber");

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
              rules={{ required: dispatchToEdit ? false : true }}
              render={({ field }) => (
                <RadioGroup {...field} display={"flex"} gap={4} mt={4}>
                  {Object.values(DocumentType).map((type) => (
                    <Radio
                      sx={{
                        border: "1px solid black",
                        colorScheme: "black",
                      }}
                      key={type}
                      value={type}
                    >
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
          <FormControl mb={4} isInvalid={!!errors.docNumber}>
            <FormLabel>{t("Document Number")}</FormLabel>
            <Controller
              name="docNumber"
              control={control}
              defaultValue=""
              rules={{ required: dispatchToEdit ? false : true }}
              render={({ field }) => (
                <Input
                  {...field}
                  sx={{ border: "1px solid black", colorScheme: "black" }}
                  mt={4}
                />
              )}
            />
            {errors.docNumber && (
              <Text color="red.500" fontSize="sm">
                {t("Document number is required.")}
              </Text>
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
                rules={{ required: dispatchToEdit ? false : true }}
                render={({ field }) => (
                  <>
                    {isSearchingSupplier && (
                      <Search<ISupplier>
                        placeholderText={t("Search for a customer name")}
                        searchFunction={searchSupplier}
                        setResults={setSuppliers}
                        notFoundText={t("No customers found for this term")}
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
                        sx={{ border: "1px solid black", colorScheme: "black" }}
                        onChange={(e) => {
                          setIsSearchingSupplier(false); // Close the search
                          field.onChange(e); // Update the form state
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
              <Text color="red.500" fontSize="sm">
                {t("Customer selection is required.")}
              </Text>
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
                rules={{ required: dispatchToEdit ? false : true }}
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
                        sx={{ border: "1px solid black", colorScheme: "black" }}
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
              <Text color="red.500" fontSize="sm">
                {t("Transporter selection is required.")}
              </Text>
            )}
          </FormControl>
          <FormControl mb={4}>
            <FlexBox mb={2}>
              <FormLabel>{t("Dispatch Date")}</FormLabel>
            </FlexBox>
            <FlexColumn gap={2} alignItems={"start"}>
              <Controller
                name="dispatchDate"
                control={control}
                defaultValue={new Date().toISOString().split("T")[0]}
                rules={{ required: dispatchToEdit ? false : true }}
                render={({ field }) => (
                  <Input
                    {...field}
                    sx={{ border: "1px solid black", colorScheme: "black" }}
                    type="date"
                    size="md"
                    variant="outline"
                    width="auto"
                    defaultValue={new Date().toISOString().split("T")[0]}
                  />
                )}
              />
            </FlexColumn>
            {errors.dispatchDate && (
              <Text color="red.500" fontSize="sm">
                {t("Dispatch date is required.")}
              </Text>
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
              rules={{ required: dispatchToEdit ? false : true }}
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
                    sx={{ border: "1px solid black", colorScheme: "black" }}
                    onChange={(e) => {
                      field.onChange(e); // Update the form state
                      setProductId(e.target.value); // Update the product ID
                      setSelectedProduct(
                        products.find(
                          (product) => product.id === e.target.value
                        ) || null
                      );
                      setIsSearchingProduct(false); // Close the search
                    }}
                  >
                    {products
                      ?.sort((a, b) => b.name.localeCompare(a.name))
                      .map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name.toLocaleUpperCase("es-CL")}
                        </option>
                      ))}
                  </Select>
                </>
              )}
            />
            {errors.productId && (
              <Text color="red.500" fontSize="sm">
                {t("Product selection is required.")}
              </Text>
            )}
          </FormControl>
          <FormControl mb={0} isInvalid={!!errors.lotId}>
            <FlexBox mb={0}>
              <FormLabel my={3}>{t("Lot")}</FormLabel>
              <FlexBox gap={2}>
                <SearchButton
                  onSearch={() => setIsSearchingLot((prev) => !prev)}
                />
              </FlexBox>
            </FlexBox>
            <Controller
              name="lotId"
              control={control}
              defaultValue=""
              rules={{ required: true }}
              render={({ field, fieldState }) => (
                <>
                  {isSearchingLot && (
                    <Search<IStock>
                      placeholderText={t("Search for a lot name")}
                      searchFunction={searchLot}
                      setResults={setLots}
                      notFoundText="No lots found"
                      setIsLoading={setIsLoading}
                    />
                  )}
                  {/* {isLoadingGetProductLots && (
                    <FlexBox justifyContent="center" w={"100%"}>
                      <Loading size="xs" />
                    </FlexBox>
                  )} */}
                  <Select
                    {...field}
                    sx={{ border: "1px solid black", colorScheme: "black" }}
                    onChange={(e) => {
                      field.onChange(e);
                      setIsSearchingLot(false);
                      setLotId(e.target.value);
                    }}
                  >
                    {/* <option>{fieldState.error?.message || ""}</option> */}
                    {getProductLotsData?.lots?.map((lot) => (
                      <option key={lot.id} value={lot.lotId}>
                        {lot.lotId}
                      </option>
                    ))}
                  </Select>
                </>
              )}
            />
            {errors.lotId && (
              <Text color="red.500" fontSize="sm">
                {t("Lot selection is required.")}
              </Text>
            )}
          </FormControl>
          <FormControl mb={4} isInvalid={!!errors.placeId}>
            <FormLabel my={3}>{t("Place")}</FormLabel>
            <Controller
              name="placeId"
              control={control}
              defaultValue={undefined}
              rules={{ required: true }}
              render={({ field }) =>
                selectedProduct &&
                lotId &&
                (isLoadingGetPlaces || isLoadingTotalStockByLotAndProduct) ? (
                  <FlexBox justifyContent="center" w={"100%"}>
                    <Loading size="xs" />
                  </FlexBox>
                ) : (
                  <Select
                    {...field}
                    sx={{ border: "1px solid black", colorScheme: "black" }}
                    value={field.value ?? undefined}
                  >
                    {getPlacesData?.places?.length === 0 && (
                      <option value="" style={{ color: "red" }}>
                        {t("There are no places created!")}
                      </option>
                    )}
                    <option value={undefined}>
                      {t("I will not specify a place")}
                    </option>

                    {(totalStockByLotAndProduct?.placeId?.length
                      ? getPlacesData?.places
                          .filter((p) =>
                            totalStockByLotAndProduct?.placeId?.includes(p.id)
                          )
                          .sort((a, b) => a.name.localeCompare(b.name))
                      : getPlacesData?.places?.sort((a, b) =>
                          a.name.localeCompare(b.name)
                        )
                    )?.map((places) => (
                      <option key={places.id} value={places.id}>
                        {places.name}
                      </option>
                    ))}
                  </Select>
                )
              }
            />
            {errors.placeId && (
              <Text color="red.500" fontSize="sm">
                {t("Place selection is required.")}
              </Text>
            )}
          </FormControl>
        </Box>
        <Box display="flex" justifyContent="space-around" gap={16}>
          <FormControl mb={4} isInvalid={!!errors.palletNumber}>
            <FormLabel>
              {t("Pallet Number")} ({t("Optional")})
            </FormLabel>
            <Controller
              name="palletNumber"
              control={control}
              defaultValue=""
              rules={{ required: false }}
              render={({ field }) => (
                <Input
                  {...field}
                  sx={{ border: "1px solid black", colorScheme: "black" }}
                />
              )}
            />
          </FormControl>
          <FormControl mb={4} isInvalid={!!errors.unitsNumber}>
            <FormLabel
              display="flex"
              justifyContent="space-between"
              width={"100%"}
            >
              <Box
                display="flex"
                alignItems="center"
                gap={2}
                justifyContent={"space-between"}
              >
                <span>{t("Units Number")} </span>
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
              </Box>
              <span style={{ color: "red" }}>
                {t("In stock")} {Number(inStockValue)}
              </span>
            </FormLabel>
            <Controller
              name="unitsNumber"
              control={control}
              defaultValue={0}
              rules={{
                required: dispatchToEdit ? false : true,
                validate: (value) => {
                  if (value > 0 && inStockValue) {
                    if (value > inStockValue) {
                      return t(
                        "The units number can't be higher than the stock"
                      );
                    }
                  } else return true;
                },
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  sx={{ border: "1px solid black", colorScheme: "black" }}
                  type="number"
                  isInvalid={!!errors.unitsNumber}
                />
              )}
            />
            {errors.unitsNumber && (
              <Text color="red.500" fontSize="sm">
                {errors.unitsNumber.message || t("Units number is required.")}
              </Text>
            )}
          </FormControl>
          {products.find((p) => p.id === productId)?.selectionType ===
            "box" && (
            <FormControl mb={4}>
              <FormLabel
                display="flex"
                justifyContent="space-between"
                width={"100%"}
              >
                <span>{t("Loose Units Number")}</span>
                <span style={{ color: "red" }}>
                  {t("In stock")} {totalStockByLotAndProduct?.looseUnitsNumber}
                </span>
              </FormLabel>
              <Controller
                name="looseUnitsNumber"
                control={control}
                defaultValue={0}
                rules={{
                  required: dispatchToEdit ? false : true,
                  validate: (value) => {
                    if (
                      totalStockByLotAndProduct?.looseUnitsNumber &&
                      value > totalStockByLotAndProduct?.looseUnitsNumber
                    ) {
                      return t(
                        "The units number can't be higher than the loose stock"
                      );
                    }
                  },
                }}
                render={({ field }) => (
                  <Input
                    type="number"
                    {...field}
                    sx={{ border: "1px solid black", colorScheme: "black" }}
                    isInvalid={!!errors.looseUnitsNumber}
                  />
                )}
              />
              {errors.looseUnitsNumber && (
                <Text color="red.500" fontSize="sm">
                  {errors.looseUnitsNumber.message ||
                    t("Loose units number is required.")}
                </Text>
              )}
            </FormControl>
          )}
          <FormControl mb={4} isInvalid={!!errors.totalUnitsNumber}>
            <FormLabel
              display="flex"
              justifyContent="space-between"
              width={"100%"}
            >
              {`${t("Total of")} ${
                ["Gram", "ML", "C.C"].includes(
                  selectedProduct?.boxDetails?.unitOfMeasure || ""
                )
                  ? t(
                      selectedProduct?.boxDetails?.unitOfMeasure === "Gram"
                        ? "Kilo"
                        : selectedProduct?.boxDetails?.unitOfMeasure === "ML" ||
                          selectedProduct?.boxDetails?.unitOfMeasure === "C.C"
                        ? "Liter"
                        : selectedProduct?.boxDetails?.unitOfMeasure || ""
                    )
                  : t(selectedProduct?.boxDetails?.unitOfMeasure || "")
              }`}
              {/* <span
                style={{
                  color: "red",
                }}
              >
                {t("Total in stock")} {totalStockByLotAndProduct?.totalUnits}
              </span> */}
              <Tooltip
                label={
                  selectedProduct?.selectionType === "box"
                    ? `${t("Units per box")}: (${
                        selectedProduct?.boxDetails?.units
                      }) * ${t("Boxes to enter")} (${watch(
                        "unitsNumber"
                      )}) + ${t("Loose units to enter")} (${watch(
                        "looseUnitsNumber"
                      )}) = ${
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
                      )} * ${watch("unitsNumber")} = ${
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
            </FormLabel>

            <Controller
              name="totalUnitsNumber"
              control={control}
              rules={{}}
              render={({ field }) => {
                const isSpecialUnit = ["Gram", "ML", "C.C"].includes(
                  selectedProduct?.boxDetails?.unitOfMeasure || ""
                );
                const displayValue = isSpecialUnit
                  ? selectedProduct?.boxDetails?.quantity
                    ? (selectedProduct?.boxDetails?.quantity *
                        watch("unitsNumber")) /
                      1000
                    : 0
                  : field.value;
                return (
                  <Input
                    type="number"
                    {...field}
                    sx={{ border: "1px solid black", colorScheme: "black" }}
                    {...register("totalUnitsNumber", {
                      valueAsNumber: true,
                    })}
                    value={totalValue}
                    disabled
                  />
                );
              }}
            />
            {errors.totalUnitsNumber && (
              <Text color="red.500" fontSize="sm">
                {t("Total units number is required.")}
              </Text>
            )}
          </FormControl>
        </Box>
        <FormControl mb={4}>
          <FormLabel>{t("Dispatch Status")}</FormLabel>
          <Controller
            name="dispatchedStatus"
            control={control}
            defaultValue={
              dispatchToEdit?.dispatchedStatus || DispatchedStatus.Pending
            }
            rules={{ required: dispatchToEdit ? false : true }}
            render={({ field }) => (
              <RadioGroup {...field} display={"flex"} gap={4} mt={4}>
                {Object.values(DispatchedStatus).map((status) => {
                  return (
                    <Radio
                      sx={{ border: "1px solid black", colorScheme: "black" }}
                      key={status}
                      value={status}
                    >
                      {t(status)}
                    </Radio>
                  );
                })}
              </RadioGroup>
            )}
          />
          {errors.dispatchedStatus && (
            <Text color="red.500" fontSize="sm">
              {t("Dispatch status is required.")}
            </Text>
          )}
        </FormControl>
        <Button
          onClick={handleAddProductToDispatch}
          colorScheme="green"
          disabled={
            totalStockByLotAndProduct?.unitsNumber === 0 ||
            (totalStockByLotAndProduct?.unitsNumber || 0) < 0
          }
        >
          {t("Add product to the list")}
        </Button>
        <AppThemeProvider>
          <DataGrid
            sx={{
              height: "100%",
            }}
            rows={rows || []}
            columns={columns}
            rowCount={rows?.length || 100}
            slots={{
              noRowsOverlay: () => (
                <FlexBox
                  sx={{
                    width: "100%",
                    height: "100%",
                    alignContent: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text>{t("Start by a product to dispatch")}</Text>
                </FlexBox>
              ),
            }}
          />
        </AppThemeProvider>
        <Button
          type="submit"
          colorScheme="teal"
          disabled={isLoadingAddDispatch || isLoadingUpdateDispatch}
        >
          {dispatchToEdit ? t("Edit Dispatch") : t("Create Dispatch")}
        </Button>
      </Box>

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
