import { deleteDoc, doc } from "firebase/firestore";
import { db } from "shared/firebase";
import { ValidationError, APIError } from "shared/Error";

/**
 * Removes a Place document from Firestore.
 *
 * @param {string} placeId - The ID of the Place to remove.
 * @returns {Promise<void>} - A promise that resolves when the document is deleted.
 * @throws {ValidationError} - If the PlaceId is invalid.
 * @throws {APIError} - If there is an error deleting the document.
 */
export const removePlace = async (placeId: string): Promise<void> => {
  if (!placeId) {
    throw new ValidationError("Invalid placeId");
  }

  const placeRef = doc(db, "places", placeId);

  try {
    await deleteDoc(placeRef);
  } catch (error) {
    throw new APIError("Failed to remove place", error);
  }
};
