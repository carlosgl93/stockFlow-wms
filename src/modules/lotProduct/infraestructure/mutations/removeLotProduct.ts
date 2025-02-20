import { deleteDoc, doc } from "firebase/firestore";
import { db } from "shared/firebase";
import { ValidationError, APIError } from "shared/Error";

/**
 * Removes a LotProduct document from Firestore.
 *
 * @param {string} lotProductId - The ID of the LotProduct to remove.
 * @returns {Promise<void>} - A promise that resolves when the document is deleted.
 * @throws {ValidationError} - If the lotProductId is invalid.
 * @throws {APIError} - If there is an error deleting the document.
 */
export const removeLotProduct = async (lotProductId: string): Promise<void> => {
  if (!lotProductId) {
    throw new ValidationError("Invalid lotProductId");
  }

  const lotProductRef = doc(db, "lotProducts", lotProductId);

  try {
    await deleteDoc(lotProductRef);
  } catch (error) {
    throw new APIError("Failed to remove LotProduct", error);
  }
};
