import { AddIcon } from "@chakra-ui/icons";
import { Box, Button, Text } from "@chakra-ui/react";
import { Loading, Page, PageHeader } from "shared/Layout";
import { ErrorPageStrategy } from "shared/Result";
import { ProductsList } from "modules/products/presentation";
import { useRedirect, useTranslate } from "utils";
import { useProducts } from "modules/products/infrastructure";
import { useState, useEffect } from "react";
import { loadProductsFromExcel } from "modules/products/utils/loadProductsFromExcel";
import { IProduct } from "modules/products/types";
import { Logger } from "utils/logger";
import { ConfirmationModal } from "../../shared/ConfirmationModal";

const ProductsPage = () => {
  const redirect = useRedirect();
  const { t } = useTranslate();
  const [uploadedProducts, setUploadedProducts] = useState<IProduct[] | null>(
    null
  );
  const [isPreviewFromExcelLoad, setIsPreviewFromExcelLoad] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    products: data,
    meta,
    params,
    isFetching,
    saveMultipleProductsMutation,
    saveMultipleProductsIsLoading,
  } = useProducts();

  Logger.info("products", {
    data,
    uploadedProducts,
  });

  useEffect(() => {
    if (uploadedProducts && !isPreviewFromExcelLoad) {
      saveMultipleProductsMutation(uploadedProducts);
    }
  }, [uploadedProducts, isPreviewFromExcelLoad, saveMultipleProductsMutation]);

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

  const handleConfirmUpload = () => {
    if (uploadedProducts) {
      saveMultipleProductsMutation(uploadedProducts);
      setIsPreviewFromExcelLoad(false);
      setUploadedProducts(null);
    }
  };

  if (isFetching || saveMultipleProductsIsLoading || isLoading) {
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
          <Button leftIcon={<AddIcon />} onClick={handleCreate}>
            {t("Create")}
          </Button>
        </Box>
      </PageHeader>
      {isPreviewFromExcelLoad && uploadedProducts && (
        <Box>
          <ProductsList
            products={uploadedProducts}
            isPreview={isPreviewFromExcelLoad}
          />
          <Box display="flex" justifyContent="center" mt={4} gap={4}>
            <Button
              colorScheme="green"
              onClick={() => setIsConfirmationModalOpen(true)}
            >
              {t("Confirm Upload")}
            </Button>
            <Button
              colorScheme="red"
              onClick={() => {
                setUploadedProducts(null);
                setIsPreviewFromExcelLoad(false);
              }}
            >
              {t("Cancel")}
            </Button>
          </Box>
        </Box>
      )}
      {!isPreviewFromExcelLoad && (
        <ProductsList
          products={data}
          isLoading={isFetching}
          isPreview={isPreviewFromExcelLoad}
        />
      )}

      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => {
          setUploadedProducts(null);
          setIsPreviewFromExcelLoad(false);
          setIsConfirmationModalOpen(false);
        }}
        onConfirm={handleConfirmUpload}
        title={t("Confirm Upload")}
        description={t(
          "Are you sure you want to upload these products? This will overwrite any existing products with its current STOCK"
        )}
      />
    </Page>
  );
};

export const Component = ProductsPage;

export const ErrorBoundary = ErrorPageStrategy;
