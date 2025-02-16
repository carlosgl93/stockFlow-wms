/**;
 *
 * @param  lotProduct: ILotProduct
 * @returns  Returns void
 *
 */

import { addDoc, collection } from "firebase/firestore";
import { db } from "shared/firebase";
import { ValidationError, APIError } from "shared/Error";
import { ILot } from "../types";

export const addLot = async (lot: ILot): Promise<void> => {
  if (!lot) {
    throw new ValidationError("Invalid lot product data");
  }

  try {
    const lotProductRef = collection(db, "lotProducts");
    await addDoc(lotProductRef, lot);
  } catch (error) {
    throw new APIError("Failed to add lot product", error);
  }
};
