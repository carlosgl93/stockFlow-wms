/**;
 *
 * @param name: string
 * @returns  Returns
 *
 */

import {
  FirestoreError,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { IStock } from "modules/stock/types";
import { db } from "shared/firebase";
import { Logger } from "utils/logger";

export async function searchLot(name: string) {
  Logger.info("searchLot", { name });
  if (typeof name !== "string" || name.trim() === "") {
    Logger.error("Invalid lot name provided");
    return [];
  }

  name = name.trim().toLowerCase(); // Trim the name parameter

  const collectionRef = collection(db, "stock");
  const q = query(
    collectionRef,
    where("lotId", ">=", name),
    where("lotId", "<=", name + "\uf8ff"),
    orderBy("createdAt")
  );

  try {
    const docs = await getDocs(q);
    if (docs.empty) {
      Logger.info("No matching lots found");
      return [];
    }
    return docs.docs.map((doc) => {
      return { ...doc.data(), id: doc.id };
    }) as IStock[];
  } catch (error) {
    Logger.error("Error searching lots: ", error as FirestoreError);
    return [];
  }
}
