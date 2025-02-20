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
import { ILot } from "../types";
import { Logger } from "utils/logger";

/**
 * Retrieves paginated LotProducts from Firestore.
 *
 * @param {number} pageSize - The number of documents to retrieve per page.
 * @param {number} [page=1] - The page number to retrieve.
 * @returns {Promise<{ lots: ILot[], lastVisible: string }>} - A promise that resolves to an array of LotProducts and the last visible document ID.
 * @throws {ValidationError} - If the pageSize is invalid.
 * @throws {APIError} - If there is an error retrieving the documents.
 */
export const getLots = async (
  pageSize: number,
  page: number = 1
): Promise<{ lots: ILot[]; lastVisible: string }> => {
  Logger.info(`getLots called with pageSize: ${pageSize}, page: ${page}`);

  if (!pageSize || pageSize <= 0) {
    Logger.error("Invalid pageSize");
    throw new ValidationError("Invalid pageSize");
  }

  const lotProductRef = collection(db, "lots");
  let q = query(lotProductRef, limit(pageSize));

  if (page > 1) {
    Logger.info(`Fetching documents for page: ${page}`);
    const lastVisibleDoc = await getDocs(
      query(lotProductRef, limit((page - 1) * pageSize))
    );
    const lastVisible = lastVisibleDoc.docs[lastVisibleDoc.docs.length - 1];
    q = query(lotProductRef, startAfter(lastVisible), limit(pageSize));
  }

  try {
    Logger.info("Executing query to fetch lots");
    const querySnapshot = await getDocs(q);
    const lots: ILot[] = [];
    querySnapshot.forEach((doc) => {
      lots.push({ id: doc?.id, ...doc?.data() } as ILot);
    });

    const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
    Logger.info(
      `Query successful, fetched ${lots.length} lots, lastVisible: ${lastVisibleDoc?.id}`
    );
    return { lots, lastVisible: lastVisibleDoc?.id };
  } catch (error) {
    Logger.error("Failed to retrieve LotProducts", [error]);
    throw new APIError("Failed to retrieve LotProducts", error);
  }
};
