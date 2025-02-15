/**;
 *
 * @param id: product id
 * @params values: product values to edit
 * @returns  Returns
 *
 */

import { doc, deleteDoc } from "firebase/firestore";
import { IProduct } from "../types";
import { db } from "shared/firebase";
import { ValidationError, APIError } from "shared/Error";

export async function removeProduct(id: string): Promise<void> {
  if (!id) {
    throw new ValidationError("Product ID is required");
  }

  try {
    const docRef = doc(db, "products", id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error updating product:", error);
    throw new APIError("Failed to update product", 500);
  }
}
