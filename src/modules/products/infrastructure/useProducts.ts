import { useState } from "react";
import { useQuery, useRedirect, useTranslate } from "utils";
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
  getDoc,
} from "firebase/firestore";
import { db } from "shared/firebase";
import {
  Category,
  IBoxDetails,
  IContainer,
  IMaterialType,
  IProduct,
  IUnitOfMeasure,
  RiskCategory,
} from "../types";
import { IQueryParams } from "types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveProduct } from "./saveProduct";
import { Logger } from "utils/logger";
import { APIError, ValidationError } from "shared/Error";
import { useToast } from "shared/Toast";
import { addEntry } from "modules/entries/infraestructure";
import { EntryDTO, IProductEntry } from "modules/entries/types";
import { useParams } from "react-router-dom";
import { getProductById } from "./getProductById";
import { editProduct } from "./editProduct";
import { useForm } from "react-hook-form";

const defaultParams: IQueryParams = { limit: 50, sort: "asc", id: "" };

export const useProducts = () => {
  const [params, setParams] = useState<IQueryParams>(defaultParams);
  const redirect = useRedirect();
  const toast = useToast();
  const { t } = useTranslate();
  const { productId } = useParams<{ productId: string }>();
  const queryClient = useQueryClient();

  const { data, isFetching } = useQuery({
    queryKey: ["products"],
    queryFn: async (): Promise<IProductsCollection> => {
      const productsRef = collection(db, "products");
      let productsQuery = query(productsRef);

      const querySnapshot = await getDocs(productsQuery);
      const products: IProduct[] = [];
      querySnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() } as IProduct);
      });

      const countSnapshot = await getCountFromServer(productsRef);

      return {
        products,
        meta: {
          ...params,
          total: countSnapshot.data().count,
        },
      };
    },
  });

  const { data: productData, isFetching: isProductLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProductById(productId!),
    enabled: !!productId,
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
  const {
    mutate: editProductMutation,
    isLoading: editIsLoading,
    isError: editIsError,
    error: editError,
    isSuccess: editIsSuccess,
  } = useMutation(editProduct, {
    onSuccess: async (data) => {
      toast({
        title: t("Product updated"),
        description: t("Product updated successfully"),
        status: "success",
      });
      reset();
      Logger.info("setting query data", [data]);
      await queryClient.invalidateQueries(["products"]);
      redirect("/products");
    },
    onError: (error: ValidationError) => {
      Logger.error("Error updating product", [error]);
      toast({
        title: "Error",
        description: `${t("Error updating product")}, ${t(error.message)}`,
        status: "error",
      });
    },
  });

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors, defaultValues },
    reset,
    trigger,
    watch,
  } = useForm<IProduct>({
    defaultValues: productData
      ? {
          ...productData,
        }
      : {
          extCode: "",
          internalCode: "",
          name: "",
          warehouseStock: 0,
          riskCategory: RiskCategory.Toxic,
          category: Category.Herbicide,
          selectionType: "unit",
          boxDetails: {
            unitOfMeasure: IUnitOfMeasure.CC,
            type: IMaterialType.Plastic,
            units: 0,
            quantity: 0,
            unitsPerSurface: 0,
            container: IContainer.Bidon,
            kilos: 0,
          } as IBoxDetails,
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
    searchProducts,
    saveMultipleProductsMutation,
    saveMultipleProductsIsLoading,
    saveMultipleProductsIsError,
    saveMultipleProductsError,
    saveMultipleProductsIsSuccess,
    productData,
    isProductLoading,
    editProductMutation,
    editIsLoading,
    editIsError,
    editError,
    editIsSuccess,
    handleSubmit,
    control,
    setValue,
    formState: { errors, defaultValues },
    reset,
    trigger,
    watch,
    errors,
  };
};
