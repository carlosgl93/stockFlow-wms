import React, { useState } from "react";
import { queryClient, useQuery, useRedirect, useTranslate } from "utils";
import {
  IProductsCollection,
  getProductsQuery,
  getProductsQueryKey,
} from "./productsQuery";
import {
  collection,
  query,
  startAfter,
  getDocs,
  getCountFromServer,
  limit as queryLimit,
} from "firebase/firestore";
import { db } from "shared/firebase";
import { IProduct } from "../types";
import { IQueryParams } from "types";
import { useMutation } from "@tanstack/react-query";
import { saveProduct } from "./saveProduct";
import { Logger } from "utils/logger";
import { ValidationError } from "shared/Error";
import { useToast } from "shared/Toast";
const defaultParams: IQueryParams = { limit: 50, sort: "asc" };

export const useProducts = (limit?: number | undefined) => {
  const [params, setParams] = useState<IQueryParams>(defaultParams);
  const redirect = useRedirect();
  const toast = useToast();
  const { t } = useTranslate();

  const { data, isFetching } = useQuery({
    queryKey: ["products"],
    queryFn: async (): Promise<IProductsCollection> => {
      const productsRef = collection(db, "products");
      let productsQuery = query(productsRef, queryLimit(limit || params.limit));

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

  const {
    mutate: saveProductMutation,
    isLoading: saveProductIsLoading,
    isError,
    error,
    isSuccess: saveProductIsSuccess,
  } = useMutation(saveProduct, {
    onSuccess: async (data) => {
      toast({
        title: t("Product created"),
        description: t("Product created successfully"),
        status: "success",
      });
      Logger.info("setting query data", [data]);
      // queryClient.setQueryData(["products"], (old: IProduct[] | undefined) => {
      //   if (old) {
      //     return [...old, data];
      //   }
      //   return [data];
      // });
      queryClient.invalidateQueries(["products"]);
      if (location.pathname.includes("products")) {
        redirect("/products");
      }
    },
    onError: (error: ValidationError) => {
      Logger.error("Error creating product", [error]);
      toast({
        title: "Error",
        description: `${t("Error creating product")}, ${t(error.message)}`,
        status: "error",
      });
    },
  });

  return {
    products: data?.products,
    isFetching,
    meta: data?.meta,
    params,
    setParams,
    saveProductMutation,
    saveProductIsLoading,
    isError,
    error,
    saveProductIsSuccess,
  };
};
