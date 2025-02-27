/**;
 *
 * @param  placeId: string
 * @returns  Returns void
 *
 */

import { doc, updateDoc } from "firebase/firestore";
import { db } from "shared/firebase";
import { IPlace } from "../types";

export type UpdatePlaceParams = {
  placeId: string;
  values: IPlace;
};

export const updatePlace = async ({ placeId, values }: UpdatePlaceParams) => {
  const placeProductRef = doc(db, "placeProducts", placeId);
  try {
    await updateDoc(placeProductRef, { ...values });
  } catch (error) {}
};
