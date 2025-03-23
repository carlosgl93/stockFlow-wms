import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "shared/firebase";
import { ValidationError, APIError } from "shared/Error";
import { IPlace } from "../types";
import { Logger } from "utils/logger";

/**
 * Retrieves all the places where the productId and lotId are found.
 *
 * @param {string} productId - The ID of the product selected.
 * @param {string} lotId - The ID of the lot selected.
 * @returns {Promise<IPlace[]>} - A promise that resolves to the Places array.
 * @throws {ValidationError} - If the p or lot id are invalid.
 * @throws {APIError} - If there is an error retrieving the document.
 */
export const getPlacesByProductIdAndLotId = async (
  productId: string,
  lotId: string
): Promise<IPlace[]> => {
  Logger.info(
    `getPlacesByProductIdAndLotId called with productId and lotId: ${productId} ${lotId}`
  );

  if (!productId || !lotId) {
    Logger.error("Invalid productId or lotId");
    throw new ValidationError("Invalid productId or lotId");
  }

  const placesRef = collection(db, "places");
  const q = query(
    placesRef,
    where("productId", "==", productId),
    where("lotId", "==", lotId)
  );

  try {
    Logger.info("Executing query to fetch places by productId and lotId");
    const snapshot = await getDocs(q);
    const places = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as IPlace)
    );

    Logger.info(`Query successful, fetched ${places.length} places`);
    return places;
  } catch (error) {
    Logger.error("Failed to retrieve places by productId and lotId", [error]);
    throw new APIError(
      "Failed to retrieve places by productId and lotId",
      error
    );
  }
};
