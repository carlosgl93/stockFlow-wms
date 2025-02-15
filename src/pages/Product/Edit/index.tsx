import {
  CreateProductForm,
  ProductNotFoundResult,
} from "modules/products/presentation";
import { InternalErrorResult } from "shared/Result";
import { ResourceNotFoundException, useQuery } from "utils";
import { useNavigate, useParams, useRouteError } from "shared/Router";
import { getProductQuery } from "modules/products/infrastructure";
import { CircularProgress } from "@chakra-ui/react";

export const EditProductPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useQuery(
    getProductQuery(productId as string)
  );

  if (isError || !data) {
    return <ProductNotFoundResult />;
  }

  if (isLoading) {
    return <CircularProgress />;
  }

  return <CreateProductForm productToEdit={data} />;
};

export const Component = EditProductPage;

export const ErrorBoundary = () => {
  const error = useRouteError();

  if (error instanceof ResourceNotFoundException) {
    return <ProductNotFoundResult />;
  }

  return <InternalErrorResult />;
};
