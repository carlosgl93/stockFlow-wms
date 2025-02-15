import { UseQueryOptions } from "@tanstack/react-query";

import { IQueryParams, IMeta } from "types";

import { queryClient, useQuery } from "utils";

import { IProduct } from "../types";
import { IProductDto } from "./types";
import {
  collection,
  getDocs,
  limit,
  query,
  startAfter,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "shared/firebase";
import { Logger } from "utils/logger";

const defaultParams = { limit: 10, sort: "asc" };

export interface IProductsCollection {
  products: IProduct[];
  meta: IMeta;
}

export const getProductsQueryKey = (params: IQueryParams = defaultParams) => [
  "products",
  params,
];

export const getProductsQuery = (params: IQueryParams = defaultParams) => ({
  queryKey: getProductsQueryKey(params),
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

export const useProductsQuery = (
  params: IQueryParams = defaultParams,
  options?: UseQueryOptions<IProductsCollection>
) => {
  return useQuery({
    ...getProductsQuery(params),
    ...options,
  });
};

export const productsLoader = async (params: IQueryParams = defaultParams) => {
  return queryClient.ensureQueryData(getProductsQuery(params));
};
