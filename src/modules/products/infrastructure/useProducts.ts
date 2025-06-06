import { useState } from "react";
import { queryClient, useQuery, useRedirect, useTranslate } from "utils";
import { IProductsCollection } from "./productsQuery";
import {
  collection,
  query,
  startAfter,
  getDocs,
  getCountFromServer,
  limit as queryLimit,
  where,
  updateDoc,
  setDoc,
  doc,
} from "firebase/firestore";
import { db } from "shared/firebase";
import { IProduct } from "../types";
import { IQueryParams } from "types";
import { useMutation } from "@tanstack/react-query";
import { saveProduct } from "./saveProduct";
import { Logger } from "utils/logger";
import { APIError, ValidationError } from "shared/Error";
import { useToast } from "shared/Toast";
import { ExcelProductType } from "../types/IProduct";
import { addEntry } from "modules/entries/infraestructure";
import { EntryDTO, IProductEntry } from "modules/entries/types";
const defaultParams: IQueryParams = { limit: 50, sort: "asc" };

export const useProducts = (pageSize: number = 50, page: number = 1) => {
  const [params, setParams] = useState<IQueryParams>(defaultParams);
  const redirect = useRedirect();
  const toast = useToast();
  const { t } = useTranslate();

  const { data, isFetching } = useQuery({
    queryKey: ["products", page, pageSize],
    queryFn: async (): Promise<IProductsCollection> => {
      const productsRef = collection(db, "products");
      let productsQuery = query(productsRef, queryLimit(pageSize));

      if (page > 1) {
        const lastVisibleDoc = await getDocs(
          query(productsRef, queryLimit((page - 1) * pageSize))
        );
        const lastVisible = lastVisibleDoc.docs[lastVisibleDoc.docs.length - 1];
        productsQuery = query(
          productsRef,
          startAfter(lastVisible),
          queryLimit(pageSize)
        );
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

  const searchProducts = async (name: string) => {
    try {
      const productsRef = collection(db, "products");
      const q = query(productsRef, where("name", "==", name));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      Logger.error("Failed to search products", { error });
      throw new APIError("Failed to search products", error);
    }
  };

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

  const {
    mutate: saveMultipleProductsMutation,
    isLoading: saveMultipleProductsIsLoading,
    isError: saveMultipleProductsIsError,
    error: saveMultipleProductsError,
    isSuccess: saveMultipleProductsIsSuccess,
  } = useMutation(
    async (products: IProduct[]) => {
      const failedProducts: IProduct[] = [];

      for (const product of products) {
        try {
          const productCreated = await saveProduct(product, product.id);
          const stockQuery = query(
            collection(db, "stock"),
            where("productId", "==", productCreated.id)
          );
          const stockSnapshot = await getDocs(stockQuery);
          const unitsNumber =
            (product!.warehouseStock || 0) / (product!.qPerUnit || 0) || 0;
          const remainder =
            (product!.warehouseStock || 0) % (product!.qPerUnit || 0) || 0;

          let stockId = "";

          if (!stockSnapshot.empty) {
            const stockRef = stockSnapshot.docs[0].ref;
            await updateDoc(stockRef, {
              unitsNumber: unitsNumber,
              looseUnitsNumber: remainder,
              updatedAt: new Date(),
            });
            stockId = stockRef.id;
          } else {
            const stockRef = doc(collection(db, "stock"));
            await setDoc(stockRef, {
              id: stockRef.id,
              productId: product.id,
              unitsNumber: unitsNumber || 0,
              looseUnitsNumber: remainder || 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            stockId = stockRef.id;
          }
        } catch (error) {
          if (error instanceof ValidationError) {
            failedProducts.push(product);
          } else {
            throw error;
          }
        }
      }

      if (failedProducts.length > 0) {
        throw new ValidationError(
          `Some products could not be created: ${failedProducts
            .map((p) => p.name)
            .join(", ")}`
        );
      }

      // Create a big entry using addEntry
      const entryProducts: IProductEntry[] = await Promise.all(
        products.map(async (product) => {
          const stockQuery = query(
            collection(db, "stock"),
            where("productId", "==", product.id)
          );
          const stockSnapshot = await getDocs(stockQuery);

          let stockId;
          if (!stockSnapshot.empty) {
            stockId = stockSnapshot.docs[0].id;
          } else {
            const stockRef = doc(collection(db, "stock"));
            stockId = stockRef.id;
          }

          return {
            id: product.id!,
            unitsNumber: product.warehouseStock || 0,
            looseUnitsNumber: product.qPerUnit || 0,
            placeId: product.placeId || "",
            lotId: product.lotId || "",
            stockId: stockId, // Include the correct stockId
            expirityDate: product.expirityDate || "",
            totalUnitsNumber: product.warehouseStock || 0,
            palletNumber: product.palletNumber || "",
            unitOfMeasure: product?.boxDetails?.unitOfMeasure || "",
            qPerUnit: product?.boxDetails?.quantity || 1,
            unitsPerBox: product?.boxDetails?.units || 1,
          };
        })
      );

      const entry: EntryDTO = {
        supplierId: "defaultSupplierId", // Replace with actual supplierId
        docNumber: `DOC-${Date.now()}`,
        transporterId: "defaultTransporterId", // Replace with actual transporterId
        description: "Bulk entry for multiple products",
        products: entryProducts,
        entryDate: new Date().toISOString(),
      };

      await addEntry(entry);
    },
    {
      onSuccess: () => {
        toast({
          title: t("Products created"),
          description: t("All products were created successfully"),
          status: "success",
        });
        queryClient.invalidateQueries(["products"]);
      },
      onError: (error: ValidationError) => {
        Logger.error("Error creating multiple products", [error]);
        toast({
          title: t("Error"),
          description: `${t("Error creating some products")}: ${t(
            error.message
          )}`,
          status: "error",
        });
      },
    }
  );

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
    searchProducts,
    saveMultipleProductsMutation,
    saveMultipleProductsIsLoading,
    saveMultipleProductsIsError,
    saveMultipleProductsError,
    saveMultipleProductsIsSuccess,
  };
};
