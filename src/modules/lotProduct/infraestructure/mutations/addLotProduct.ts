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
import { dateVO } from "utils";

export const addLotProduct = async (lotProduct: ILotProduct): Promise<void> => {
  if (
    !lotProduct ||
    !lotProduct.productId ||
    !lotProduct.lotId ||
    !lotProduct.unitsNumber ||
    !lotProduct.looseUnitsNumber ||
    !lotProduct.expirationDate
  ) {
    throw new ValidationError("Invalid lot product data");
  }

  lotProduct.totalUnits = lotProduct.unitsNumber + lotProduct.looseUnitsNumber;
  try {
    const lotProductRef = collection(db, "lotProducts");
    lotProduct.createdAt = dateVO.now();
    await addDoc(lotProductRef, lotProduct);
  } catch (error) {
    throw new APIError("Failed to add lot product", error);
  }
};
