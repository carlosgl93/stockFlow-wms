/**;
 *
 * @param  lotProductId: string
 * @returns  Returns void
 *
 */

import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "shared/firebase";

export type UpdateLotProductQuantityParams = {
  lotProductId: string;
  quantity: number;
};

export const updateLotProductQuantity = async (
  lotProductId: string,
  quantity: number
) => {
  const lotProductRef = doc(db, "lotProducts", lotProductId);
  try {
    if (quantity < 0) {
      // delete the lotProduct entry
      await deleteDoc(lotProductRef);
      return;
    }
    await updateDoc(lotProductRef, { quantity });
  } catch (error) {}
};
