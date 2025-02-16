import { useState } from "react";
import { SearchIcon, AddIcon } from "@chakra-ui/icons";
import { Box, Button, Text } from "@chakra-ui/react";
import { IQueryParams } from "types";
import { Loading, Page, PageHeader } from "shared/Layout";
import { ErrorPageStrategy } from "shared/Result";
import { useNotImplementedYetToast } from "shared/Toast";

import { ProductsList } from "modules/products/presentation";
import { withRequireAuth } from "modules/auth/application";
import { useQuery, useRedirect, useTranslate } from "utils";
import { IProductsCollection } from "modules/products/infrastructure";
import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  query,
  startAfter,
} from "firebase/firestore";
import { db } from "shared/firebase";
import { IProduct } from "modules/products/types";

const defaultParams: IQueryParams = { limit: 50, sort: "asc" };

const ProductsPage = () => {
  const notImplemented = useNotImplementedYetToast();
  const redirect = useRedirect();
  const { t } = useTranslate();

  const [params, setParams] = useState<IQueryParams>(defaultParams);
  const { data, isFetching, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async (): Promise<IProductsCollection> => {
      const productsRef = collection(db, "products");
      let productsQuery = query(productsRef, limit(params.limit));

      if (params.startAfter) {
        productsQuery = query(productsRef, startAfter(params.startAfter));
      }
      const querySnapshot = await getDocs(productsQuery);
      const products: IProduct[] = [];
      querySnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() } as IProduct);
      });

      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      const countSnapshot = await getCountFromServer(productsRef);

      return {
        products,
        meta: {
          ...params,
          total: countSnapshot.data().count,
          lastVisible,
        },
      };
    },
  });

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
    </Page>
  );
};

export const Component = withRequireAuth(ProductsPage, { to: "/sign-in" });

export const ErrorBoundary = ErrorPageStrategy;
