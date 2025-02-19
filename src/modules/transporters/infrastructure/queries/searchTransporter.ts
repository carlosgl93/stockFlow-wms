import {
  collection,
  where,
  getDocs,
  query,
  FirestoreError,
} from "firebase/firestore";
import { ITransporter } from "modules/transporters/types";
import { db } from "shared/firebase";
import { Logger } from "utils/logger";

/**
 * Searches for transporter by company name.
 *
 * @param name - The name of the transporter to search for.
 * @returns A list of documents of type ITransporter.
 */
export async function searchTransporter(name: string): Promise<ITransporter[]> {
  if (typeof name !== "string" || name.trim() === "") {
    Logger.error("Invalid transporter name provided");
    return [];
  }

  name = name.toLowerCase().trim();

  const collectionRef = collection(db, "transporters");
  const q = query(
    collectionRef,
    where("company", ">=", name),
    where("company", "<=", name + "\uf8ff")
  );

  try {
    const docs = await getDocs(q);
    if (docs.empty) {
      Logger.info("No matching transporters found");
      return [];
    }
    return docs.docs.map((doc) => {
      return { ...doc.data(), id: doc.id };
    }) as ITransporter[];
  } catch (error) {
    Logger.error("Error searching transporters: ", error as FirestoreError);
    return [];
  }
}
