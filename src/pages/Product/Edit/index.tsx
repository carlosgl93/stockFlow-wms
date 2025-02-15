import {
  CreateProductForm,
  ProductNotFoundResult,
} from "modules/products/presentation";
import { InternalErrorResult } from "shared/Result";
import { ResourceNotFoundException, useQuery, useTranslate } from "utils";
import { useNavigate, useParams, useRouteError } from "shared/Router";
import {
  getProductQuery,
  useCRUDProducts,
} from "modules/products/infrastructure";
import { Loading, Page, PageHeader } from "shared/Layout";
import { Cancel, Delete } from "shared/Actions";

export const EditProductPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const { t } = useTranslate();
  const { data, isLoading, isError } = useQuery(
    getProductQuery(productId as string)
  );

  const { removeProductMutation } = useCRUDProducts();

  const navigate = useNavigate();

  if (isError || !data) {
    return <ProductNotFoundResult />;
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Page>
      <PageHeader
        title={t("Edit Product")}
        description={t("Edit your product.")}
        position="sticky"
      >
        <Cancel onCancel={() => navigate(-1)} />
      </PageHeader>
      <CreateProductForm productToEdit={data} />;
    </Page>
  );
};

export const Component = EditProductPage;

export const ErrorBoundary = () => {
  const error = useRouteError();

  if (error instanceof ResourceNotFoundException) {
    return <ProductNotFoundResult />;
  }

  return <InternalErrorResult />;
};
