import { doc, deleteDoc } from "firebase/firestore";
import { db } from "shared/firebase";
import { APIError } from "shared/Error";

export const removeSupplier = async (supplierId: string) => {
  try {
    const supplierRef = doc(db, "suppliers", supplierId);
    await deleteDoc(supplierRef);
  } catch (error) {
    throw new APIError("Failed to remove supplier", error);
  }
};
