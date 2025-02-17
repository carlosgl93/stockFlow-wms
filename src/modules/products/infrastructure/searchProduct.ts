import {
  collection,
  where,
  getDocs,
  query,
  FirestoreError,
} from "firebase/firestore";
import { db } from "shared/firebase";
import { Logger } from "utils/logger";
import { IProduct } from "../types";

/**
 * Searches for products by name.
 *
 * @param name - The name of the product to search for.
 * @returns A list of documents of type IProduct.
 */
export async function searchProduct(name: string): Promise<IProduct[]> {
  if (typeof name !== "string" || name.trim() === "") {
    Logger.error("Invalid product name provided");
    return [];
  }

  name = name.trim(); // Trim the name parameter

  const collectionRef = collection(db, "products");
  const q = query(
    collectionRef,
    where("name", ">=", name),
    where("name", "<=", name + "\uf8ff")
  );

  try {
    const docs = await getDocs(q);
    if (docs.empty) {
      Logger.info("No matching products found");
      return [];
    }
    return docs.docs.map((doc) => {
      return { ...doc.data(), id: doc.id };
    }) as IProduct[];
  } catch (error) {
    Logger.error("Error searching products: ", error as FirestoreError);
    return [];
  }
}
