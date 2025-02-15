import { useState } from "react";
import { SearchIcon, AddIcon } from "@chakra-ui/icons";
import { Box, Button, CircularProgress, Text } from "@chakra-ui/react";
import { IQueryParams } from "types";
import { Loading, Page, PageHeader } from "shared/Layout";
import { ErrorPageStrategy } from "shared/Result";
import { useNotImplementedYetToast } from "shared/Toast";

import { ProductsList } from "modules/products/presentation";
import { withRequireAuth } from "modules/auth/application";
import { useQuery, useRedirect, useTranslate } from "utils";
import { getProductsQuery } from "modules/products/infrastructure";

const defaultParams: IQueryParams = { limit: 50, sort: "asc" };

const ProductsPage = () => {
  const notImplemented = useNotImplementedYetToast();
  const redirect = useRedirect();
  const { t } = useTranslate();

  const [params, setParams] = useState<IQueryParams>(defaultParams);
  const { data, isFetching, isLoading } = useQuery(getProductsQuery(params));

  if (!data) return null;
  const { products, meta } = data || {};
  const pages = Math.ceil(meta.total / params.limit);
  const total = meta.total;

  const handleCreate = () => redirect("/products/create");

  if (isLoading || isFetching) {
    return <Loading />;
  }
  return (
    <Page>
      <PageHeader
        title={t("Products list")}
        description={t("Create, edit, remove products.")}
      >
        <Box display="flex" alignItems="center" gap={4}>
          <Text>
            {t("Total registers: ")} {total} {t("Pages:")} {pages}
          </Text>
          <Button leftIcon={<SearchIcon />} onClick={notImplemented}>
            {t("Search")}
          </Button>

          <Button leftIcon={<AddIcon />} onClick={handleCreate}>
            {t("Create")}
          </Button>
        </Box>
      </PageHeader>
      <ProductsList products={products} />
      {/* {data.products.length > 0 && (
        <Button
          w="100%"
          onClick={() =>
            setParams((params) => ({
              ...params,
              limit: (params?.limit ?? 10) + 10,
            }))
          }
          isLoading={isFetching}
          isDisabled={noMoreProducts}
        >
          {noMoreProducts ? t("No more products") : t("Show more products")}
        </Button>
      )} */}
    </Page>
  );
};

export const Component = withRequireAuth(ProductsPage, { to: "/sign-in" });

export const ErrorBoundary = ErrorPageStrategy;
