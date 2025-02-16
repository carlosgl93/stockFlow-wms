import {
  collection,
  query,
  where,
  getDocs,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "shared/firebase";
import { ILotProduct } from "../types";
import { ValidationError, APIError } from "shared/Error";

/**
 * Retrieves paginated LotProducts from Firestore.
 *
 * @param {string} lotId - The ID of the Lot to retrieve products for.
 * @param {number} pageSize - The number of documents to retrieve per page.
 * @param {string} [lastVisible] - The ID of the last visible document from the previous page.
 * @returns {Promise<{ lotProducts: ILotProduct[], lastVisible: string }>} - A promise that resolves to an array of LotProducts and the last visible document ID.
 * @throws {ValidationError} - If the lotId or pageSize is invalid.
 * @throws {APIError} - If there is an error retrieving the documents.
 */
export const getLotProducts = async (
  lotId: string,
  pageSize: number,
  lastVisible?: string
): Promise<{ lotProducts: ILotProduct[]; lastVisible: string }> => {
  if (!lotId) {
    throw new ValidationError("Invalid lotId");
  }

  if (!pageSize || pageSize <= 0) {
    throw new ValidationError("Invalid pageSize");
  }

  const lotProductRef = collection(db, "LotProducts");
  let q = query(lotProductRef, where("lotId", "==", lotId), limit(pageSize));

  if (lastVisible) {
    const lastVisibleDoc = await getDocs(
      query(lotProductRef, where("id", "==", lastVisible))
    );
    if (!lastVisibleDoc.empty) {
      q = query(
        lotProductRef,
        where("lotId", "==", lotId),
        startAfter(lastVisibleDoc.docs[0]),
        limit(pageSize)
      );
    }
  }

  try {
    const querySnapshot = await getDocs(q);
    const lotProducts: ILotProduct[] = [];
    querySnapshot.forEach((doc) => {
      lotProducts.push({ id: doc.id, ...doc.data() } as ILotProduct);
    });

    const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
    return { lotProducts, lastVisible: lastVisibleDoc.id };
  } catch (error) {
    throw new APIError("Failed to retrieve LotProducts", error);
  }
};
