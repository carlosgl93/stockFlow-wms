import { SearchIcon, AddIcon } from "@chakra-ui/icons";
import { Box, Button, Text } from "@chakra-ui/react";
import { Loading, Page, PageHeader } from "shared/Layout";
import { ErrorPageStrategy } from "shared/Result";
import { useNotImplementedYetToast } from "shared/Toast";
import { ProductsList } from "modules/products/presentation";
import { useRedirect, useTranslate } from "utils";
import { useProducts } from "modules/products/infrastructure";
import { useState } from "react";
import { loadProductsFromExcel } from "modules/products/utils/loadProductsFromExcel";
import { IProduct } from "modules/products/types";

const ProductsPage = () => {
  const notImplemented = useNotImplementedYetToast();
  const redirect = useRedirect();
  const { t } = useTranslate();
  const [uploadedProducts, setUploadedProducts] = useState<IProduct[] | null>(
    null
  );
  const { products: data, meta, params, isFetching } = useProducts();

  const [isPreviewFromExcelLoad, setIsPreviewFromExcelLoad] = useState(false);

  if (!data) return null;
  const pages = Math.ceil(meta.total / params.limit);
  const total = meta.total;

  const handleCreate = () => redirect("/products/create");

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const products = await loadProductsFromExcel(file);
      setUploadedProducts(products);
      setIsPreviewFromExcelLoad(true);
    }
  };

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

          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            style={{ display: "none" }}
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button as="span">{t("Upload Excel")}</Button>
          </label>
        </Box>
      </PageHeader>
      {uploadedProducts ? (
        <ProductsList
          products={uploadedProducts}
          isPreview={isPreviewFromExcelLoad}
        />
      ) : (
        <ProductsList products={data} />
      )}
    </Page>
  );
};

export const Component = ProductsPage;

export const ErrorBoundary = ErrorPageStrategy;
