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
 * @returns {Promise<{ lots: ILot[], lastVisible: string }>} - A promise that resolves to an array of LotProducts and the last visible document ID.
 * @throws {ValidationError} - If the pageSize is invalid.
 * @throws {APIError} - If there is an error retrieving the documents.
 */
export const getLots = async (): Promise<{
  lots: ILot[];
  lastVisible: string;
}> => {
  const lotProductRef = collection(db, "lots");
  let q = query(lotProductRef);

  try {
    const querySnapshot = await getDocs(q);
    const lots: ILot[] = [];
    querySnapshot.forEach((doc) => {
      lots.push({ id: doc?.id, ...doc?.data() } as ILot);
    });

    const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
    return { lots, lastVisible: lastVisibleDoc?.id };
  } catch (error) {
    Logger.error("Failed to retrieve LotProducts", [error]);
    throw new APIError("Failed to retrieve LotProducts", error);
  }
};
