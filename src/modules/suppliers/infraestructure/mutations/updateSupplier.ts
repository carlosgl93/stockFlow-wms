import { ISupplier } from "../../types/ISupplier";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "shared/firebase";
import { APIError } from "shared/Error";

export const updateSupplier = async ({
  supplierId,
  values,
}: {
  supplierId: string;
  values: ISupplier;
}) => {
  try {
    const supplierRef = doc(db, "suppliers", supplierId);
    await updateDoc(supplierRef, { ...values });
  } catch (error) {
    throw new APIError("Failed to update supplier", error);
  }
};
