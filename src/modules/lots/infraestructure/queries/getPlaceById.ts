import { collection, doc, getDoc } from "firebase/firestore";
import { db } from "shared/firebase";
import { ValidationError, APIError } from "shared/Error";
import { IPlace } from "../types";
import { Logger } from "utils/logger";

/**
 * Retrieves a Place by its ID from Firestore.
 *
 * @param {string} placeId - The ID of the place to retrieve.
 * @returns {Promise<IPlace>} - A promise that resolves to the Place object.
 * @throws {ValidationError} - If the placeId is invalid.
 * @throws {APIError} - If there is an error retrieving the document.
 */
export const getPlaceById = async (placeId: string): Promise<IPlace> => {
  Logger.info(`getPlaceById called with placeId: ${placeId}`);

  if (!placeId) {
    Logger.error("Invalid placeId");
    throw new ValidationError("Invalid placeId");
  }

  const placeRef = doc(collection(db, "places"), placeId);

  try {
    Logger.info("Executing query to fetch place by ID");
    const placeDoc = await getDoc(placeRef);

    if (!placeDoc.exists()) {
      Logger.warn(`No document found with ID: ${placeId}`);
      throw new APIError("Place not found", "", 404);
    }

    Logger.info(`Query successful, fetched place with ID: ${placeDoc.id}`);
    return { id: placeDoc.id, ...placeDoc.data() } as IPlace;
  } catch (error) {
    Logger.error("Failed to retrieve Place", [error]);
    throw new APIError("Failed to retrieve Place", error);
  }
};
