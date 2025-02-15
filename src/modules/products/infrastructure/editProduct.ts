/**;
 *
 * @param id: product id
 * @params values: product values to edit
 * @returns  Returns
 *
 */

import { doc, updateDoc } from "firebase/firestore";
import { IProduct } from "../types";
import { db } from "shared/firebase";
import { ValidationError, APIError } from "shared/Error";

export async function editProduct({
  id,
  values,
}: {
  id: string;
  values: IProduct;
}): Promise<IProduct> {
  if (!id) {
    throw new ValidationError("Product ID is required");
  }
  if (!values || Object.keys(values).length === 0) {
    throw new ValidationError("Values to update are required");
  }

  try {
    const docRef = doc(db, "products", id);
    await updateDoc(docRef, { ...values });
    return { id, ...values } as IProduct;
  } catch (error) {
    console.error("Error updating product:", error);
    throw new APIError("Failed to update product", 500);
  }
}
