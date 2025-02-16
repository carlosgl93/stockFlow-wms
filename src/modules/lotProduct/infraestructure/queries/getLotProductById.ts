import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "shared/firebase";
import { ILotProduct } from "../types";
import { ValidationError, APIError } from "shared/Error";

/**
 * Retrieves LotProducts by Lot ID from Firestore.
 *
 * @param {string} lotId - The ID of the Lot to retrieve products for.
 * @returns {Promise<ILotProduct[]>} - A promise that resolves to an array of LotProducts.
 * @throws {ValidationError} - If the lotId is invalid.
 * @throws {APIError} - If there is an error retrieving the documents.
 */
export const getLotProductsByLotId = async (
  lotId: string
): Promise<ILotProduct[]> => {
  if (!lotId) {
    throw new ValidationError("Invalid lotId");
  }

  const lotProductRef = collection(db, "LotProducts");
  const q = query(lotProductRef, where("lotId", "==", lotId));

  try {
    const querySnapshot = await getDocs(q);
    const lotProducts: ILotProduct[] = [];
    querySnapshot.forEach((doc) => {
      lotProducts.push({ id: doc.id, ...doc.data() } as ILotProduct);
    });
    return lotProducts;
  } catch (error) {
    throw new APIError("Failed to retrieve LotProducts", error);
  }
};
