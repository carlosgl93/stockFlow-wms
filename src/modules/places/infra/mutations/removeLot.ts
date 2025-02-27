import { deleteDoc, doc } from "firebase/firestore";
import { db } from "shared/firebase";
import { ValidationError, APIError } from "shared/Error";

/**
 * Removes a Lot document from Firestore.
 *
 * @param {string} lotId - The ID of the Lot to remove.
 * @returns {Promise<void>} - A promise that resolves when the document is deleted.
 * @throws {ValidationError} - If the LotId is invalid.
 * @throws {APIError} - If there is an error deleting the document.
 */
export const removeLot = async (lotId: string): Promise<void> => {
  if (!lotId) {
    throw new ValidationError("Invalid lotId");
  }

  const lotRef = doc(db, "lots", lotId);

  try {
    await deleteDoc(lotRef);
  } catch (error) {
    throw new APIError("Failed to remove lot", error);
  }
};
