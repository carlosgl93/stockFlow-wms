import {
  collection,
  where,
  getDocs,
  query,
  FirestoreError,
} from "firebase/firestore";
import { ISupplier } from "modules/suppliers/types";
import { db } from "shared/firebase";
import { Logger } from "utils/logger";

/**
 * Searches for suppliers by company name.
 *
 * @param name - The name of the supplier to search for.
 * @returns A list of documents of type ISupplier.
 */
export async function searchSupplier(name: string): Promise<ISupplier[]> {
  if (typeof name !== "string" || name.trim() === "") {
    Logger.error("Invalid supplier name provided");
    return [];
  }

  name = name.toLowerCase().trim(); // Trim the name parameter

  const collectionRef = collection(db, "suppliers");
  const q = query(
    collectionRef,
    where("company", ">=", name),
    where("company", "<=", name + "\uf8ff")
  );

  try {
    const docs = await getDocs(q);
    if (docs.empty) {
      Logger.info("No matching suppliers found");
      return [];
    }
    return docs.docs.map((doc) => {
      return { ...doc.data(), id: doc.id };
    }) as ISupplier[];
  } catch (error) {
    Logger.error("Error searching suppliers: ", error as FirestoreError);
    return [];
  }
}
