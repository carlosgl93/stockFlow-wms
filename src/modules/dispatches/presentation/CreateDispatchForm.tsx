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
    setLotId,
    totalStockByLotAndProduct,
    isLoadingTotalStockByLotAndProduct,
    productId,
  } = CreateDispatchController({ dispatchToEdit });

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
                      setProductId(e.target.value); // Update the product ID
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
          <FormControl mb={0}>
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
              render={({ field }) => (
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
                    onChange={(e) => {
                      field.onChange(e);
                      setIsSearchingLot(false);
                      setLotId(e.target.value);
                    }}
                  >
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
                isLoadingGetPlaces || isLoadingTotalStockByLotAndProduct ? (
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

                    {(totalStockByLotAndProduct?.placesIds?.length
                      ? getPlacesData?.places.filter((p) =>
                          totalStockByLotAndProduct?.placesIds?.includes(p.id)
                        )
                      : getPlacesData?.places
                    )?.map((places) => (
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
            <FormLabel
              display="flex"
              justifyContent="space-between"
              width={"100%"}
            >
              <span>{t("Units Number")} </span>
              <span style={{ color: "red" }}>
                {t("In stock")} {totalStockByLotAndProduct?.unitsNumber}
              </span>
            </FormLabel>
            <Controller
              name="unitsNumber"
              control={control}
              defaultValue={0}
              rules={{
                required: true,
                validate: (value) => {
                  if (value > 0 && totalStockByLotAndProduct?.unitsNumber) {
                    if (value > totalStockByLotAndProduct?.unitsNumber) {
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
                  type="number"
                  isInvalid={!!errors.unitsNumber}
                />
              )}
            />
            {errors.unitsNumber && (
              <Box color="red">{errors.unitsNumber.message}</Box>
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
                  required: true,
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
                    isInvalid={!!errors.looseUnitsNumber}
                  />
                )}
              />
              {errors.looseUnitsNumber && (
                <Box color="red">{errors.looseUnitsNumber.message}</Box>
              )}
            </FormControl>
          )}
        </Box>
        <Box display="flex" justifyContent="space-around" gap={16}>
          <FormControl mb={4}>
            <FormLabel
              display="flex"
              justifyContent="space-between"
              width={"100%"}
            >
              <span>{t("Total")}</span>{" "}
              <span
                style={{
                  color: "red",
                }}
              >
                {t("Total in stock")} {totalStockByLotAndProduct?.totalUnits}
              </span>
            </FormLabel>

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
        {/* <FormControl mb={4}>
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
        </FormControl> */}
        <FormControl mb={4}>
          <FormLabel>{t("Dispatch Status")}</FormLabel>
          <Controller
            name="dispatchedStatus"
            control={control}
            defaultValue={
              dispatchToEdit?.dispatchedStatus || DispatchedStatus.Pending
            }
            rules={{ required: true }}
            render={({ field }) => (
              <RadioGroup {...field} display={"flex"} gap={4} mt={4}>
                {Object.values(DispatchedStatus).map((status) => {
                  return (
                    <Radio key={status} value={status}>
                      {t(status)}
                    </Radio>
                  );
                })}
              </RadioGroup>
            )}
          />
          {errors.dispatchedStatus && (
            <Box color="red">{t("This field is required")}</Box>
          )}
        </FormControl>
        <Button onClick={handleAddProductToDispatch} colorScheme="green">
          {t("Add product to the list")}
        </Button>
        <AppThemeProvider>
          <DataGrid
            rows={rows || []}
            columns={columns}
            rowCount={rows?.length || 100}
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
