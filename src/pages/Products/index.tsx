import { useState } from "react";

import { SearchIcon, AddIcon } from "@chakra-ui/icons";

import { Button } from "@chakra-ui/react";

import { IQueryParams } from "types";

import { t } from "utils";

import { Page, PageHeader } from "shared/Layout";
import { ErrorPageStrategy } from "shared/Result";
import { useNotImplementedYetToast } from "shared/Toast";

import { useProductsQuery } from "modules/products/infrastructure";
import { ProductsList } from "modules/products/presentation";
import { useAuthStore, withRequireAuth } from "modules/auth/application";
import { Logger } from "utils/logger";
import { useRedirect } from "utils";

const defaultParams: IQueryParams = { limit: 10, sort: "asc" };

const ProductsPage = () => {
  const logged = useAuthStore((state) => state);
  const notImplemented = useNotImplementedYetToast();
  const redirect = useRedirect();

  const [params, setParams] = useState<IQueryParams>(defaultParams);
  const { data, isFetching } = useProductsQuery(params, {
    keepPreviousData: true,
  });

  const noMoreProducts = data.meta.total <= params.limit;

  const handleCreate = () => redirect("/products/create");
  return (
    <Page>
      <PageHeader
        title={t("Products list")}
        description={t("Create, edit, remove products.")}
      >
        <Button leftIcon={<SearchIcon />} onClick={notImplemented}>
          {t("Search")}
        </Button>

        <Button leftIcon={<AddIcon />} onClick={handleCreate}>
          {t("Create")}
        </Button>
      </PageHeader>
      {/* <ProductsList products={data.products} /> */}
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
