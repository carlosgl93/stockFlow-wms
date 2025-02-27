/**;
 *
 * @param  placeProduct: IPlaceProduct
 * @returns  Returns void
 *
 */

import { addDoc, collection } from "firebase/firestore";
import { db } from "shared/firebase";
import { ValidationError, APIError } from "shared/Error";
import { IPlace } from "../types";

export const addPlace = async (place: IPlace): Promise<void> => {
  if (!place) {
    throw new ValidationError("Invalid place product data");
  }

  try {
    const placeProductRef = collection(db, "places");
    await addDoc(placeProductRef, place);
  } catch (error) {
    throw new APIError("Failed to add place product", error);
  }
};
