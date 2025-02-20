import { ISupplier } from "../../types/ISupplier";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  addDoc,
} from "firebase/firestore";
import { db } from "shared/firebase";
import { APIError, ValidationError } from "shared/Error";
import { Logger } from "utils/logger";

export const addSupplier = async (supplier: ISupplier) => {
  try {
    const supplierCompany = supplier.company.toLowerCase().trim();
    const supplierIdNumber = supplier.idNumber.trim();

    // Check if a supplier with the same company name or ID number already exists
    const suppliersCollection = collection(db, "suppliers");
    const q = query(
      suppliersCollection,
      where("company", "==", supplierCompany),
      where("idNumber", "==", supplierIdNumber)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      throw new ValidationError(
        "A supplier with that company name or ID number already exists"
      );
    }

    const supplierRef = doc(suppliersCollection);
    await setDoc(supplierRef, { ...supplier, company: supplierCompany });
    const newSupp = await addDoc(suppliersCollection, supplier);
    supplier.id = newSupp.id;
    return supplier;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new APIError("Failed to add supplier", error);
  }
};
