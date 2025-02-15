import { UseQueryOptions } from "@tanstack/react-query";

import { httpService, queryClient, useQuery } from "utils";

import { IProduct } from "../types";
import { IProductDto } from "./types";
import { doc, getDoc } from "firebase/firestore";
import { db } from "shared/firebase";

export const getProductQueryKey = (productId: string) => ["product", productId];

export const getProductQuery = (productId: string) => ({
  queryKey: getProductQueryKey(productId),
  queryFn: async () => {
    const prodRef = doc(db, "products", productId);
    const product = await getDoc(prodRef);
    const productDto = product.data() as IProductDto;
    return {
      ...productDto,
      id: product.id,
    };
  },
});

export const useProductQuery = (
  productId: string,
  options?: UseQueryOptions<IProduct>
) => {
  return useQuery({
    ...getProductQuery(productId),
    ...options,
  });
};

export const productLoader = async (productId: string) =>
  queryClient.ensureQueryData(getProductQuery(productId));
