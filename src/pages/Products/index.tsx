import { SearchIcon, AddIcon } from "@chakra-ui/icons";
import { Box, Button, Text } from "@chakra-ui/react";
import { Loading, Page, PageHeader } from "shared/Layout";
import { ErrorPageStrategy } from "shared/Result";
import { useNotImplementedYetToast } from "shared/Toast";
import { ProductsList } from "modules/products/presentation";
import { withRequireAuth } from "modules/auth/application";
import { useRedirect, useTranslate } from "utils";
import { useProducts } from "modules/products/infrastructure";

const ProductsPage = () => {
  const notImplemented = useNotImplementedYetToast();
  const redirect = useRedirect();
  const { t } = useTranslate();

  const { products: data, meta, params, isFetching } = useProducts();

  if (!data) return null;
  const pages = Math.ceil(meta.total / params.limit);
  const total = meta.total;

  const handleCreate = () => redirect("/products/create");

  if (isFetching) {
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
      <ProductsList products={data} />
    </Page>
  );
};

export const Component = withRequireAuth(ProductsPage, { to: "/sign-in" });

export const ErrorBoundary = ErrorPageStrategy;
