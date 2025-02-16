import { ISupplier } from "../../types/ISupplier";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "shared/firebase";
import { APIError } from "shared/Error";

export const addSupplier = async (supplier: ISupplier) => {
  try {
    const supplierRef = doc(collection(db, "suppliers"));
    await setDoc(supplierRef, supplier);
    return supplierRef.id;
  } catch (error) {
    throw new APIError("Failed to add supplier", error);
  }
};
