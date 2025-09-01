import {
  collection,
  query,
  where,
  getDocs,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "shared/firebase";
import { ValidationError, APIError } from "shared/Error";
import { Logger } from "utils/logger";
import { IStock } from "modules/stock/types";

/**
 * Retrieves paginated LotProducts from Firestore filtered by productId.
 *
 * @param {string} productId - The ID of the product to filter by.
 * @returns {Promise<{ lots: IStock[], lastVisible: string }>} - A promise that resolves to an array of LotProducts and the last visible document ID.
 * @throws {ValidationError} - If the pageSize is invalid.
 * @throws {APIError} - If there is an error retrieving the documents.
 */
export const getProductLots = async ({
  productId,
}: {
  productId?: string;
}): Promise<{ lots: IStock[]; lastVisible: string }> => {
  const stockRef = collection(db, "stock");
  let q = query(stockRef, where("productId", "==", productId));

  try {
    const querySnapshot = await getDocs(q);
    const lots: IStock[] = [];
    querySnapshot.forEach((doc) => {
      lots.push({ id: doc?.id, ...doc?.data() } as IStock);
    });

    const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
    return { lots, lastVisible: lastVisibleDoc?.id };
  } catch (error) {
    Logger.error("Failed to retrieve Stock", [error]);
    throw new APIError("Failed to retrieve Stock", error);
  }
};
