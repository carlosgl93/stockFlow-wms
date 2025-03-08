/**;
 *
 * @param  lotId: string
 * @returns  Returns void
 *
 */

import { doc, updateDoc } from "firebase/firestore";
import { db } from "shared/firebase";
import { ILot } from "../types";

export type UpdateLotParams = {
  lotId: string;
  values: ILot;
};

export const updateLot = async ({ lotId, values }: UpdateLotParams) => {
  const lotProductRef = doc(db, "lotProducts", lotId);
  try {
    await updateDoc(lotProductRef, { ...values });
  } catch (error) {}
};
