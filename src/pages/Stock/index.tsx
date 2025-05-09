import { Box, Text, FormControl, FormLabel, Select } from "@chakra-ui/react";
import { fetchEntriesByProductIdAndLotId } from "modules/entries/infraestructure";
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
import {
  EmptyStateResult,
  ErrorPageStrategy,
  LetsBegin,
  Result,
} from "shared/Result";
import { useTranslate } from "utils";
import { Logger } from "utils/logger";
import { Controller, useForm } from "react-hook-form";
import { IStock, ISuppsAndTrans } from "modules/stock/types";
import { searchLot } from "modules/lots/infraestructure";
import { getTransporterById } from "modules/transporters/infrastructure";
import { getSupplierById } from "modules/suppliers";
import { APIError } from "shared/Error";
import { getPlaceById, IPlace } from "modules/places/infra";

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

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLotSearch, setIsLoadingLotSearch] = useState(false);
  const [isFetchingEntriesByProductId, setIsFetchingEntriesByProductId] =
    useState(false);
  const [isFetchingEntries, setIsFetchingEntries] = useState(false);
  const { t } = useTranslate();

  const { control } = useForm();
  const { stockData, isLoadingGetStock } = useStock();

  useEffect(() => {
    const fetchProductEntries = async () => {
      setIsFetchingEntries(true);
      try {
        const entries = await fetchEntriesByProductIdAndLotId(
          searchedStockProduct,
          lotSelected
        );
        setProductEntries(entries);
      } catch (error) {
        Logger.error("Failed to fetch entries", error as unknown as APIError);
      } finally {
        setIsFetchingEntries(false);
      }
    };
    fetchProductEntries();
  }, [searchedStockProduct, lotSelected]);

  // fetch stock based on the entries
  useEffect(() => {
    // if (!lotSelected && !searchedStockProduct) return;
    if (searchedStockProduct) {
      const fetchStockByProductId = async () => {
        if (!searchedStockProduct) return;
        const productStock = await getStockByProdId(searchedStockProduct);
        setProductStock(productStock);
      };
      fetchStockByProductId();
    } else if (lotSelected && !searchedStockProduct) {
      const fetchStockByLotId = async () => {
        const stock = await getStockByLotId(lotSelected);
        setProductStock(stock);
      };
      fetchStockByLotId();
    } else {
      const fetchStockByProductIdAndLotId = async () => {
        const stock = await getStockByProdIdAndLotId(
          searchedStockProduct,
          lotSelected
        );
        setProductStock(stock);
      };
      fetchStockByProductIdAndLotId();
    }
  }, [searchedStockProduct, lotSelected]);

  // fetch transporter and supplier by id
  useEffect(() => {
    const fetchSupplierAndTransporter = async () => {
      if (!productEntries?.length) return;

      const uniqueSupplierIds = Array.from(
        new Set(productEntries?.map((entry) => entry.supplierId))
      );
      const uniqueTransporterIds = Array.from(
        new Set(productEntries?.map((entry) => entry.transporterId))
      );

      const supplierPromises = uniqueSupplierIds.map((id) => {
        return getSupplierById(id);
      });
      const transporterPromises = uniqueTransporterIds.map((id) => {
        return getTransporterById(id);
      });

      try {
        const suppliers = await Promise.all(supplierPromises);
        const transporters = await Promise.all(transporterPromises);

        const suppsAndTrans = productEntries.map((entry) => ({
          entryId: entry.id,
          supplier: suppliers.find((supp) => supp.id === entry.supplierId),
          transporter: transporters.find(
            (trans) => trans.id === entry.transporterId
          ),
        })) as ISuppsAndTrans;
        Logger.info("supps and trans", suppsAndTrans);

        setSuppsAndTrans(suppsAndTrans);
      } catch (error) {
        Logger.error(
          "Failed to fetch suppliers and transporters",
          error as APIError
        );
      }
    };
    fetchSupplierAndTransporter();
  }, [productEntries]);

  useEffect(() => {
    const fetchPlacesInfo = async () => {
      // filter to get unique placesIDs
      const uniquePlacesIds = Array.from(
        new Set(
          productEntries
            ?.map((entry) => entry.productsToEnter.map((p) => p.placeId))
            .flat()
        )
      );

      // fetch places info
      const placesPromises = uniquePlacesIds.map((id) => {
        return getPlaceById(id!);
      });

      const placesInfo = await Promise.all(placesPromises);
      setPlacesInfo(placesInfo);
    };
    fetchPlacesInfo();
  }, [productEntries]);

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
      let options = uniqueProducts?.map((product) => (
        <option key={product!.id} value={product!.id}>
          {product!.name}
        </option>
      ));
      options = [
        <option key="all" value="">
          Selecciona un resultado
        </option>,
        ...options,
      ];
      return options;
    }

    if (!uniqueProducts?.length) {
      return <option>Busca un producto arriba</option>;
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
          Selecciona un resultado
        </option>,
        ...options,
      ];
      return options;
    }

    if (!uniqueLots?.length) {
      return <option>Busca un lote arriba</option>;
    }
  };

  const renderLoading = () => {
    if (isLoadingGetStock || isFetchingEntries) {
      return <Loading size="md" />;
    }
  };

  const renderLetsBegin = () => {
    if (stockData?.length && !(setSearchedStockProduct || lotSelected)) {
      return (
        <LetsBegin headingText="Start by searching for a product AND/OR lot" />
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
                      setSearchedStockProduct(e.target.value);
                    }}
                    value={searchedStockProduct}
                  >
                    {renderProductsOptions()}
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
                    placeholderText={t("Search for a lot")}
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
                    {renderLotsOptions()}
                  </Select>
                </FlexColumn>
              )}
            />
            {/* {errors.productId && (
              <Box color="red">{t("This field is required")}</Box>
            )} */}
          </FormControl>
        </Box>
      </PageHeader>
      {renderLoading()}
      {renderLetsBegin()}
      {productEntries ? (
        <StockList
          entries={productEntries}
          stock={productStock}
          productId={searchedStockProduct}
          selectedLot={lotSelected}
          suppsAndTrans={suppsAndTrans}
          placesInfo={placesInfo}
        />
      ) : (
        <EmptyStateResult />
      )}
    </Page>
  );
};

export const Component = StockPage;

export const ErrorBoundary = ErrorPageStrategy;
