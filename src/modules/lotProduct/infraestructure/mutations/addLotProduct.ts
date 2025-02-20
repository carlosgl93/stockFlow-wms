/**;
 *
 * @param  lotProduct: ILotProduct
 * @returns  Returns void
 *
 */

import { addDoc, collection } from "firebase/firestore";
import { db } from "shared/firebase";
import { ILotProduct } from "../types";
import { ValidationError, APIError } from "shared/Error";

export const addLotProduct = async (lotProduct: ILotProduct): Promise<void> => {
  if (
    !lotProduct ||
    !lotProduct.productId ||
    !lotProduct.lotId ||
    !lotProduct.quantity
  ) {
    throw new ValidationError("Invalid lot product data");
  }

  try {
    const lotProductRef = collection(db, "lotProducts");
    await addDoc(lotProductRef, lotProduct);
  } catch (error) {
    throw new APIError("Failed to add lot product", error);
  }
};
