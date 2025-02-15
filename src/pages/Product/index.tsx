import { ArrowBackIcon, EditIcon } from "@chakra-ui/icons";
import { Button, CircularProgress } from "@chakra-ui/react";

import { t, useQuery } from "utils";
import { ResourceNotFoundException } from "utils";

import { Page } from "shared/Layout";
import { InternalErrorResult } from "shared/Result";
import { useNavigate, useParams, useRouteError } from "shared/Router";

import { getProductQuery } from "modules/products/infrastructure";
import { ProductDetails } from "modules/products/presentation";
import { ProductNotFoundResult } from "modules/products/presentation";

const ProductPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery(
    getProductQuery(productId as string)
  );

  if (isLoading) {
    return (
      <Page>
        <CircularProgress />
      </Page>
    );
  }

  if (isError || !data) {
    return (
      <Page>
        <ProductNotFoundResult />
      </Page>
    );
  }

  return (
    <Page spacing={6}>
      <Button
        leftIcon={<ArrowBackIcon />}
        variant="link"
        onClick={() => navigate("/products")}
      >
        {t("Back to products' list")}
      </Button>
      <Button
        leftIcon={<EditIcon />}
        variant="link"
        onClick={() => navigate(`/products/edit/${productId}`)}
      >
        {t("Edit Product")}
      </Button>
      <ProductDetails product={data} onBack={() => navigate("/products")} />
    </Page>
  );
};

export const Component = ProductPage;

export const ErrorBoundary = () => {
  const error = useRouteError();

  if (error instanceof ResourceNotFoundException) {
    return <ProductNotFoundResult />;
  }

  return <InternalErrorResult />;
};
