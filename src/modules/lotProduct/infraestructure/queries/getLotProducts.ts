import {
  collection,
  query,
  where,
  getDocs,
  limit,
  startAfter,
  QueryConstraint,
  doc, // Added doc
  getDoc, // Added getDoc
  documentId, // Added documentId for potential use if product IDs are document IDs
} from "firebase/firestore";
import { db } from "shared/firebase";
import { ILotProduct } from "../types";
import { APIError } from "shared/Error";
import { Logger } from "utils/logger";
import { FirebaseError } from "firebase/app";
import { IProduct } from "modules/products/types";

// Interface for LotProduct combined with its Product details
export interface ILotProductWithProduct extends ILotProduct {
  product?: IProduct;
}

/**
 * Retrieves paginated LotProducts from Firestore, joined with product information.
 *
 * @param {string} [lotId] - The ID of the Lot to retrieve products for.
 * @param {string} [productId] - The ID of the Product to retrieve products for. (Note: this filters lotProducts by productId, not the product itself)
 * @param {number} [pageSize] - The number of documents to retrieve per page.
 * @param {string} [lastVisible] - The Firestore document ID of the last visible LotProduct from the previous page.
 * @returns {Promise<{ lotProducts: ILotProductWithProduct[], lastVisible: string }>} - A promise that resolves to an array of LotProducts with product details and the last visible document ID.
 * @throws {APIError} - If there is an error retrieving the documents.
 */
export const getLotProducts = async (
  lotId?: string,
  productId?: string, // This refers to lotProduct.productId for filtering
  pageSize?: number,
  lastVisible?: string
): Promise<{ lotProducts: ILotProductWithProduct[]; lastVisible: string }> => {
  Logger.info("getLotProducts called with:", {
    lotId,
    productId,
    pageSize,
    lastVisible,
  });

  const pageLimit = pageSize || 25;
  const lotProductRef = collection(db, "lotProducts");
  const queryConstraints: QueryConstraint[] = [];

  // Determine filter type for switch case
  let filterType = "NONE";
  if (lotId && productId) {
    filterType = "BOTH";
  } else if (lotId) {
    filterType = "LOT_ONLY";
  } else if (productId) {
    // This productId is for filtering lotProduct records by their productId field
    filterType = "PRODUCT_ONLY";
  }

  switch (filterType) {
    case "LOT_ONLY":
      queryConstraints.push(where("lotId", "==", lotId!));
      break;
    case "PRODUCT_ONLY":
      queryConstraints.push(where("productId", "==", productId!));
      break;
    case "BOTH":
      queryConstraints.push(where("lotId", "==", lotId!));
      queryConstraints.push(where("productId", "==", productId!));
      break;
    case "NONE":
      break;
  }

  if (lastVisible) {
    const lastDocRef = doc(db, "lotProducts", lastVisible);
    const lastDocSnap = await getDoc(lastDocRef);
    if (lastDocSnap.exists()) {
      queryConstraints.push(startAfter(lastDocSnap));
    } else {
      Logger.warn(
        `Last visible LotProduct document with ID ${lastVisible} not found. Pagination may restart or be incorrect.`
      );
      // Depending on desired behavior, you might throw an error or clear lastVisible
    }
  }

  queryConstraints.push(limit(pageLimit));

  const finalQuery = query(lotProductRef, ...queryConstraints);

  try {
    const querySnapshot = await getDocs(finalQuery);
    const fetchedLotProducts: ILotProduct[] = [];
    querySnapshot.forEach((doc) => {
      fetchedLotProducts.push({ id: doc.id, ...doc.data() } as ILotProduct);
    });

    let newLastVisibleId = "";
    if (querySnapshot.docs.length > 0) {
      newLastVisibleId = querySnapshot.docs[querySnapshot.docs.length - 1].id;
    }

    if (fetchedLotProducts.length === 0) {
      return { lotProducts: [], lastVisible: newLastVisibleId };
    }

    // Extract all unique product IDs from the fetched lotProducts
    const uniqueProductIds = Array.from(
      new Set(fetchedLotProducts.map((lp) => lp.productId).filter(Boolean))
    ) as string[];

    const lotProductsWithDetails: ILotProductWithProduct[] = [
      ...fetchedLotProducts,
    ]; // Initialize with fetched lot products

    if (uniqueProductIds.length > 0) {
      // Fetch corresponding products
      // Assuming 'products' collection and lotProduct.productId matches a field 'id' in product documents.
      // If lotProduct.productId is the Firestore Document ID of a product, use:
      // where(documentId(), "in", uniqueProductIds)
      const productsQuery = query(
        collection(db, "products"),
        where(documentId(), "in", uniqueProductIds) // Assuming product documents have a field 'id'
        // If lotProduct.productId IS the document ID of a product, use:
        // where(documentId(), "in", uniqueProductIds)
        // Ensure your 'products' collection and field name are correct.
      );
      const productsSnapshot = await getDocs(productsQuery);
      const productsMap = new Map<string, IProduct>();
      productsSnapshot.forEach((productDoc) => {
        const productData = {
          id: productDoc.id, // If 'id' is a field. If using documentId(), this is productDoc.id
          ...productDoc.data(),
        } as IProduct;
        // The key for the map should be the field that lotProduct.productId refers to.
        // If lotProduct.productId refers to product document's 'id' field:
        productsMap.set(productData.id || "", productData);
        // If lotProduct.productId refers to product document's Firestore ID:
        // productsMap.set(productDoc.id, productData);
      });

      // Merge product details into lotProducts
      for (let i = 0; i < lotProductsWithDetails.length; i++) {
        const lotProduct = lotProductsWithDetails[i];
        if (lotProduct.productId) {
          // The key used here must match how productsMap was populated.
          lotProductsWithDetails[i].product = productsMap.get(
            lotProduct.productId
          );
        }
      }
    }

    return {
      lotProducts: lotProductsWithDetails,
      lastVisible: newLastVisibleId,
    };
  } catch (error) {
    if (error instanceof FirebaseError) {
      Logger.error("Firebase error while retrieving LotProducts", [
        error.message,
      ]);
      throw new APIError(
        "Firebase error while retrieving LotProducts",
        error.message
      );
    }
    Logger.error(
      "Failed to retrieve LotProducts or associated Product details",
      [error]
    );
    throw new APIError(
      "Failed to retrieve LotProducts or associated Product details",
      error
    );
  }
};
