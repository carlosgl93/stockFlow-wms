import {
  Box,
  Text,
  FormControl,
  FormLabel,
  Select,
  Button,
} from "@chakra-ui/react";
import { IEntry } from "modules/entries/types";
import { searchProduct } from "modules/products/infrastructure";
import { IProduct } from "modules/products/types";
import {
  getStockByLotId,
  getStockByProdId,
  getStockByProdIdAndLotId,
  useStock,
} from "modules/stock/infraestructure";
import { StockList } from "modules/stock/presentation";
import { useEffect, useState } from "react";
import { Search } from "shared/Form";
import { FlexBox, FlexColumn, Loading, Page, PageHeader } from "shared/Layout";
import { EmptyStateResult, ErrorPageStrategy } from "shared/Result";
import { useTranslate } from "utils";
import { Logger } from "utils/logger";
import { Controller, useForm } from "react-hook-form";
import { IStock, ISuppsAndTrans } from "modules/stock/types";
import { searchLot } from "modules/lots/infraestructure";
import { getPlaceById, IPlace } from "modules/places/infra";
import { useLotProduct } from "modules/lotProduct/infraestructure";

const StockPage = () => {
  const [productEntries, setProductEntries] = useState<IEntry[]>([]);
  const [productStock, setProductStock] = useState<IStock[]>([]);
  const [searchedStockProduct, setSearchedStockProduct] = useState("");
  const [searchedProductsResult, setSearchedProductsResult] = useState<
    IProduct[]
  >([]);
  const [lotsResults, setLotsResults] = useState<IStock[]>([]);
  const [lotSelected, setLotSelected] = useState("");
  const [suppsAndTrans, setSuppsAndTrans] = useState<ISuppsAndTrans>([]);
  const [placesInfo, setPlacesInfo] = useState<IPlace[]>([]);

  const [isLoadingProductSearch, setIsLoadingProductSearch] = useState(false);
  const [isLoadingLotSearch, setIsLoadingLotSearch] = useState(false);
  const [searchKey, setSearchKey] = useState(0);
  const { getLotProductsData, isLoadingGetLotProducts } = useLotProduct({
    lotId: lotSelected,
    productId: searchedStockProduct,
  });
  const { t } = useTranslate();

  const { control } = useForm();
  const { stockData, isLoadingGetStock, handleDownloadAllStock } = useStock();

  const handleClearFilters = () => {
    setSearchedStockProduct("");
    setLotSelected("");
    setSearchedProductsResult([]);
    setLotsResults([]);
    setProductStock([]);
    setSearchKey((prev) => prev + 1); // Force Search components to re-render and reset their internal state
  };

  const onDownloadAllStock = () => {
    // using xlsx package to download all stock data
    handleDownloadAllStock();
  };

  // fetch stock based on the entries
  useEffect(() => {
    // if (!lotSelected && !searchedStockProduct) return;
    if (searchedStockProduct && !lotSelected) {
      const fetchStockByProductId = async () => {
        if (!searchedStockProduct) return;
        const productStock = await getStockByProdId(searchedStockProduct);
        setProductStock(productStock);
        return;
      };
      fetchStockByProductId();
    } else if (lotSelected && !searchedStockProduct) {
      const fetchStockByLotId = async () => {
        const stock = await getStockByLotId(lotSelected);
        setProductStock(stock);
        return;
      };
      fetchStockByLotId();
    } else {
      const fetchStockByProductIdAndLotId = async () => {
        const stock = await getStockByProdIdAndLotId(
          searchedStockProduct,
          lotSelected
        );
        setProductStock(stock);
        return;
      };
      fetchStockByProductIdAndLotId();
    }
  }, [searchedStockProduct, lotSelected]);

  useEffect(() => {
    const fetchPlacesInfo = async () => {
      try {
        // filter to get unique placesIDs
        const uniquePlacesIds = Array.from(
          new Set(stockData?.map((stock) => stock?.placeId))
        );

        const placesPromises = uniquePlacesIds.map(async (id) => {
          if (!id || id === "NO ESPECIFICARÉ UN LUGAR" || id === "") {
            return null; // Skip if id is empty
          }
          try {
            return await getPlaceById(id);
          } catch (error) {
            Logger.error(`Failed to fetch place with ID: ${id}`, [error]);
            return null; // Return null if place fetch fails
          }
        });

        const placesInfo = await Promise.all(placesPromises);
        setPlacesInfo(placesInfo.filter((place) => place !== null) as IPlace[]);
      } catch (error) {
        Logger.error("Failed to fetch places info", [error]);
        // Set empty array if everything fails
        setPlacesInfo([]);
      }
    };

    if (stockData && stockData.length > 0) {
      fetchPlacesInfo();
    }
  }, [stockData]);

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

  const renderLotsOptions = () => {
    const uniqueLots = Array.from(
      new Set(lotsResults.map((lot) => lot.lotId))
    ).map((lotId) => lotsResults.find((lot) => lot.lotId === lotId));

    if (uniqueLots?.length === 1) {
      setLotSelected(uniqueLots[0]!.lotId!);
      return <option value={uniqueLots[0]!.id}>{uniqueLots[0]!.lotId}</option>;
    }
    if (uniqueLots?.length >= 1) {
      let options = uniqueLots?.map((lot) => (
        <option key={lot!.id} value={lot!.lotId}>
          {lot!.lotId}
        </option>
      ));
      options = [
        <option key="all" value="">
          {t("All Lots")}
        </option>,
        ...options,
      ];
      return options;
    }

    if (!uniqueLots?.length) {
      return (
        <option value="">
          {t("Search for a lot above or select 'All Lots'")}
        </option>
      );
    }
  };

  return (
    <Page>
      <PageHeader
        title={t("Stock list")}
        description={t("Create, edit, remove stock items.")}
      >
        <Box display="flex" alignItems="center" gap={4}>
          <Text>
            {/* {t("Total registers: ")} {total} {t("Pages:")} {pages} */}
          </Text>

          <FormControl mb={4}>
            <FlexBox alignItems={"center"} mb={2}>
              <FormLabel>{t("Product")}</FormLabel>
            </FlexBox>
            <Controller
              name="productId"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <FlexColumn gap={4}>
                  <Search<IProduct>
                    key={`product-${searchKey}`}
                    placeholderText={t("Search for a product name")}
                    searchFunction={searchProduct}
                    setResults={setSearchedProductsResult}
                    notFoundText={t("No products found")}
                    setIsLoading={setIsLoadingProductSearch}
                  />
                  {isLoadingProductSearch && (
                    <FlexBox justifyContent="center" w={"100%"}>
                      <Loading size="xs" />
                    </FlexBox>
                  )}
                  <Select
                    {...field}
                    onChange={(e) => {
                      setSearchedStockProduct(e.target.value);
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
          <FormControl mb={4}>
            <FlexBox alignItems={"center"} mb={2}>
              <FormLabel>{t("Lot")}</FormLabel>
            </FlexBox>
            <Controller
              name="lotId"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <FlexColumn gap={4}>
                  <Search<IStock>
                    key={`lot-${searchKey}`}
                    placeholderText={t("Search by lot")}
                    searchFunction={searchLot}
                    setResults={setLotsResults}
                    notFoundText={t("No lots found")}
                    setIsLoading={setIsLoadingLotSearch}
                  />
                  {isLoadingLotSearch && (
                    <FlexBox justifyContent="center" w={"100%"}>
                      <Loading size="xs" />
                    </FlexBox>
                  )}
                  <Select
                    {...field}
                    onChange={(e) => {
                      Logger.info(e.target.value);
                      setLotSelected(e.target.value);
                    }}
                    value={lotSelected}
                  >
                    {lotsResults.length > 0 ? (
                      renderLotsOptions()
                    ) : (
                      <option value="">{t("All Lots")}</option>
                    )}
                  </Select>
                </FlexColumn>
              )}
            />
            {/* {errors.productId && (
              <Box color="red">{t("This field is required")}</Box>
            )} */}
          </FormControl>
          <FormControl mb={4}>
            <FlexBox alignItems={"center"} mb={2}>
              <FormLabel>&nbsp;</FormLabel>
            </FlexBox>
            <Button
              colorScheme="gray"
              variant="outline"
              onClick={handleClearFilters}
              size="md"
            >
              {t("Clear Filters")}
            </Button>
          </FormControl>
          <FormControl mb={4}>
            <FlexBox alignItems={"center"} mb={2}>
              <FormLabel>&nbsp;</FormLabel>
            </FlexBox>
            <Button
              colorScheme="gray"
              variant="outline"
              onClick={onDownloadAllStock}
              size="md"
            >
              {t("Export All Stock")}
            </Button>
          </FormControl>
        </Box>
      </PageHeader>
      {/* {renderLoading()} */}
      {/* {renderLetsBegin()} */}
      {/* {(isLoadingGetLotProducts ||
        isLoadingProductSearch ||
        isLoadingLotSearch) && <Loading size="sm" />} */}
      {getLotProductsData?.lotProducts ? (
        <StockList
          entries={productEntries}
          stock={productStock}
          stockData={stockData}
          productId={searchedStockProduct}
          selectedLot={lotSelected}
          suppsAndTrans={suppsAndTrans}
          placesInfo={placesInfo}
          lotProducts={getLotProductsData?.lotProducts}
          isLoading={
            isLoadingGetStock ||
            isLoadingProductSearch ||
            isLoadingGetLotProducts
          }
        />
      ) : (
        <EmptyStateResult />
      )}
    </Page>
  );
};

export const Component = StockPage;

export const ErrorBoundary = ErrorPageStrategy;
