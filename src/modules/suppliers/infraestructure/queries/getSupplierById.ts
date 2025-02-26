/**;
 *
 * @param  id: string
 * @returns  Returns
 *
 */

import { doc, getDoc } from "firebase/firestore";
import { ISupplier } from "modules/suppliers/types";
import { APIError, ValidationError } from "shared/Error";
import { db } from "shared/firebase";

export async function getSupplierById(id: string) {
  if (!id) {
    throw new ValidationError("No supp id provided", "400");
  }

  const supplierRef = doc(db, "suppliers", id);
  try {
    const supplierSnap = await getDoc(supplierRef);
    const data = supplierSnap.data();
    return data as ISupplier;
  } catch (error) {
    throw new APIError("Error fetching supplier by id", error);
  }
}
