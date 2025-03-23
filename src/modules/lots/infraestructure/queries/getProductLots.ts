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
 * @param {number} pageSize - The number of documents to retrieve per page.
 * @param {number} [page=1] - The page number to retrieve.
 * @returns {Promise<{ lots: IStock[], lastVisible: string }>} - A promise that resolves to an array of LotProducts and the last visible document ID.
 * @throws {ValidationError} - If the pageSize is invalid.
 * @throws {APIError} - If there is an error retrieving the documents.
 */
export const getProductLots = async ({
  productId,
  pageSize = 10,
  page = 1,
}: {
  productId?: string;
  pageSize?: number;
  page?: number;
}): Promise<{ lots: IStock[]; lastVisible: string }> => {
  if (!pageSize || pageSize <= 0) {
    Logger.error("Invalid pageSize");
    throw new ValidationError("Invalid pageSize");
  }

  const lotProductRef = collection(db, "lotProducts");
  let q = query(
    lotProductRef,
    where("productId", "==", productId),
    limit(pageSize)
  );

  if (page > 1) {
    const lastVisibleDoc = await getDocs(
      query(
        lotProductRef,
        where("productId", "==", productId),
        limit((page - 1) * pageSize)
      )
    );
    const lastVisible = lastVisibleDoc.docs[lastVisibleDoc.docs.length - 1];
    q = query(
      lotProductRef,
      where("productId", "==", productId),
      startAfter(lastVisible),
      limit(pageSize)
    );
  }

  try {
    const querySnapshot = await getDocs(q);
    const lots: IStock[] = [];
    querySnapshot.forEach((doc) => {
      lots.push({ id: doc?.id, ...doc?.data() } as IStock);
    });

    const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
    return { lots, lastVisible: lastVisibleDoc?.id };
  } catch (error) {
    Logger.error("Failed to retrieve LotProducts", [error]);
    throw new APIError("Failed to retrieve LotProducts", error);
  }
};
