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
import { IPlace } from "../types";
import { Logger } from "utils/logger";

/**
 * Retrieves paginated PlaceProducts from Firestore.
 *
 * @param {number} pageSize - The number of documents to retrieve per page.
 * @param {string} [lastVisible] - The ID of the last visible document from the previous page.
 * @returns {Promise<{ places: IPlace[], lastVisible: string }>} - A promise that resolves to an array of PlaceProducts and the last visible document ID.
 * @throws {ValidationError} - If the pageSize is invalid.
 * @throws {APIError} - If there is an error retrieving the documents.
 */
export const getPlaces = async (
  pageSize: number,
  lastVisible?: string | null
): Promise<{ places: IPlace[]; lastVisible: string }> => {
  Logger.info(
    `getPlaces called with pageSize: ${pageSize}, lastVisible: ${lastVisible}`
  );

  if (!pageSize || pageSize <= 0) {
    Logger.error("Invalid pageSize");
    throw new ValidationError("Invalid pageSize");
  }

  const placeProductRef = collection(db, "places");
  let q = query(placeProductRef, limit(pageSize));

  if (lastVisible) {
    Logger.info(`Fetching last visible document with ID: ${lastVisible}`);
    const lastVisibleDoc = await getDocs(
      query(placeProductRef, where("id", "==", lastVisible))
    );
    if (!lastVisibleDoc.empty) {
      Logger.info(`Last visible document found: ${lastVisibleDoc.docs[0].id}`);
      q = query(
        placeProductRef,
        startAfter(lastVisibleDoc.docs[0]),
        limit(pageSize)
      );
    } else {
      Logger.warn(`No document found with ID: ${lastVisible}`);
    }
  }

  try {
    Logger.info("Executing query to fetch places");
    const querySnapshot = await getDocs(q);
    const places: IPlace[] = [];
    querySnapshot.forEach((doc) => {
      places.push({ id: doc?.id, ...doc?.data() } as IPlace);
    });

    const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
    Logger.info(
      `Query successful, fetched ${places.length} places, lastVisible: ${lastVisibleDoc?.id}`
    );
    return { places, lastVisible: lastVisibleDoc?.id };
  } catch (error) {
    Logger.error("Failed to retrieve PlaceProducts", [error]);
    throw new APIError("Failed to retrieve PlaceProducts", error);
  }
};
