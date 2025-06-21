import { collection, query, getDocs } from "firebase/firestore";
import { db } from "shared/firebase";
import { APIError } from "shared/Error";
import { IPlace } from "../types";
import { Logger } from "utils/logger";

/**
 * Retrieves paginated PlaceProducts from Firestore.
 *
 * @returns {Promise<{ places: IPlace[], lastVisible: string }>} - A promise that resolves to an array of PlaceProducts and the last visible document ID.
 * @throws {ValidationError} - If the pageSize is invalid.
 * @throws {APIError} - If there is an error retrieving the documents.
 */
export const getPlaces = async (): Promise<{
  places: IPlace[];
}> => {
  const placeProductRef = collection(db, "places");
  let q = query(placeProductRef);

  try {
    const querySnapshot = await getDocs(q);
    const places: IPlace[] = [];
    querySnapshot.forEach((doc) => {
      places.push({ id: doc?.id, ...doc?.data() } as IPlace);
    });

    return { places };
  } catch (error) {
    Logger.error("Failed to retrieve PlaceProducts", [error]);
    throw new APIError("Failed to retrieve PlaceProducts", error);
  }
};
