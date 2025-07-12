import { Box, FormControl, FormLabel, Select, Button } from "@chakra-ui/react";
import { HistoricMovementsList } from "modules/historicMovements/presentation/HistoricMovementsList";
import { FlexBox, FlexColumn, Loading, Page, PageHeader } from "shared/Layout";
import { ErrorPageStrategy } from "shared/Result";
import { useToast } from "shared/Toast";
import { useRedirect, useTranslate } from "utils";
import { Search } from "shared/Form/Search";
import { searchProduct } from "modules/products/infrastructure";
import { useEffect, useState } from "react";
import { IProduct } from "modules/products/types";
import { Controller, useForm } from "react-hook-form";

const HistoricMovements = () => {
  const redirect = useRedirect();
  const { t } = useTranslate();
  const toast = useToast();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const [searchedStockProduct, setSearchedStockProduct] = useState("");
  const [searchedProductsResult, setSearchedProductsResult] = useState<
    IProduct[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const { control } = useForm();
  const [selectedType, setSelectedType] = useState<"entry" | "dispatch" | null>(
    null
  );
  const [searchKey, setSearchKey] = useState(0);

  const handleProductSelect = (productId: string) => {
    if (productId === "") {
      setSelectedProductId(null);
      setSearchedStockProduct("");
    } else {
      setSelectedProductId(productId);
    }
  };

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedType(value === "" ? null : (value as "entry" | "dispatch"));
  };

  const handleClearFilters = () => {
    setSelectedProductId(null);
    setSearchedStockProduct("");
    setSelectedType(null);
    setSearchedProductsResult([]);
    setSearchKey((prev) => prev + 1); // Force Search component to re-render and reset its internal state
  };

  const renderProductsOptions = () => {
    const uniqueProducts = Array.from(
      new Set(searchedProductsResult.map((product) => product.id))
    ).map((id) => searchedProductsResult.find((product) => product.id === id));

    if (uniqueProducts?.length === 1) {
      setSearchedStockProduct(uniqueProducts[0]!.id!);
      return (
        <option value={uniqueProducts[0]!.id}>{uniqueProducts[0]!.name}</option>
      );
    }
    if (uniqueProducts?.length >= 1) {
      let options = uniqueProducts
        ?.sort((a, b) => b?.name.localeCompare(a?.name || "") || 0)
        .map((product) => (
          <option key={product!.id} value={product!.id}>
            {product!.name}
          </option>
        ));
      options = [
        <option key="all" value="">
          {t("All Products")}
        </option>,
        ...options,
      ];
      return options;
    }

    if (!uniqueProducts?.length) {
      return (
        <option value="">
          {t("Search for a product above or select 'All Products'")}
        </option>
      );
    }
  };

  // const { historicMovements, isLoading: isLoadingHistoricMovements } =
  //   useHistoricMovements(selectedProductId);

  useEffect(() => {
    if (searchedStockProduct && searchedStockProduct !== "") {
      handleProductSelect(searchedStockProduct);
    }
  }, [searchedStockProduct]);

  return (
    <Page>
      <PageHeader
        title={t("Historic Movements")}
        description={t(
          "Here you can only see the historic movements of the products, editing is not allowed."
        )}
      >
        <Box
          display="flex"
          gap={4}
          alignContent={"center"}
          alignItems={"start"}
        >
          <Box display="flex" flexDirection="column" gap={4} flex={2}>
            <FormControl mb={4}>
              <FlexBox alignItems={"center"}>
                <FormLabel>{t("Product")}</FormLabel>
              </FlexBox>
              <Controller
                name="productId"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <FlexColumn gap={4}>
                    <Search<IProduct>
                      key={searchKey}
                      placeholderText={t("Search for a product name")}
                      searchFunction={searchProduct}
                      setResults={setSearchedProductsResult}
                      notFoundText={t("No products found")}
                      setIsLoading={setIsLoading}
                    />
                    {isLoading && (
                      <FlexBox justifyContent="center" w={"100%"}>
                        <Loading size="xs" />
                      </FlexBox>
                    )}
                    <Select
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSearchedStockProduct(value);
                        handleProductSelect(value);
                      }}
                      value={searchedStockProduct}
                    >
                      {searchedProductsResult.length > 0 ? (
                        renderProductsOptions()
                      ) : (
                        <option value="">{t("All Products")}</option>
                      )}
                    </Select>
                  </FlexColumn>
                )}
              />
            </FormControl>
          </Box>

          <Box display={"flex"} flexDirection="column" gap={4} flex={1.25}>
            <FormControl mb={4}>
              <FormLabel>{t("Type")}</FormLabel>
              <Select onChange={handleTypeChange} value={selectedType || ""}>
                <option value="">{t("All")}</option>
                <option value="entry">{t("Entries")}</option>
                <option value="dispatch">{t("Dispatches")}</option>
              </Select>
            </FormControl>
          </Box>

          <Box display={"flex"} flexDirection="column" gap={4} flex={1}>
            <FormControl mb={4}>
              <FormLabel>&nbsp;</FormLabel>
              <Button
                colorScheme="gray"
                variant="outline"
                onClick={handleClearFilters}
                size="md"
              >
                {t("Clear Filters")}
              </Button>
            </FormControl>
          </Box>
        </Box>
      </PageHeader>
      <HistoricMovementsList
        productId={selectedProductId}
        type={selectedType}
      />
    </Page>
  );
};

export const Component = HistoricMovements;

export const ErrorBoundary = ErrorPageStrategy;
