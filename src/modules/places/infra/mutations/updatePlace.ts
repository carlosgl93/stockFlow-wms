/**;
 *
 * @param  placeId: string
 * @returns  Returns void
 *
 */

import { doc, updateDoc } from "firebase/firestore";
import { db } from "shared/firebase";
import { IPlace } from "../types";
import { FirebaseError } from "firebase/app";

export type UpdatePlaceParams = {
  placeId: string;
  values: IPlace;
};

export const updatePlace = async ({ placeId, values }: UpdatePlaceParams) => {
  const placeProductRef = doc(db, "places", placeId);
  try {
    await updateDoc(placeProductRef, { ...values });
  } catch (error) {
    console.error("Error updating place:", error);
    if (error instanceof FirebaseError) {
      throw new Error(`Firebase error: ${error.message}`);
    }
    throw new Error("An unexpected error occurred while updating the place");
  }
};
