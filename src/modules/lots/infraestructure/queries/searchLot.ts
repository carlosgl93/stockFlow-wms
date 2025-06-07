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
  orderBy,
  query,
} from "firebase/firestore";
import { IStock } from "modules/stock/types";
import { db } from "shared/firebase";
import { Logger } from "utils/logger";

export async function searchLot(name: string): Promise<IStock[]> {
  Logger.info("searchLot request received", { name });
  if (typeof name !== "string" || name.trim() === "") {
    Logger.warn("Invalid or empty lot name provided to searchLot", { name });
    return [];
  }

  const searchTerm = name.trim().toLowerCase();
  Logger.info(
    `Searching for lots where lotId contains '${searchTerm}' (case-insensitive)`
  );

  const collectionRef = collection(db, "stock");
  // To achieve a "contains" (ILIKE '%name%') style search, we fetch documents
  // and then filter them in the application code.
  // WARNING: This can be inefficient and costly for large datasets.
  // For better performance, consider data restructuring for search or a dedicated search service.
  const q = query(collectionRef, orderBy("createdAt")); // Retain ordering; adjust if not needed.

  try {
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      Logger.info(
        "No documents found in 'stock' collection (or matched base query)."
      );
      return [];
    }

    const allStockItems = querySnapshot.docs.map((doc) => {
      return { ...doc.data(), id: doc.id } as IStock;
    });

    const filteredLots = allStockItems.filter((item) => {
      // Ensure item.lotId exists and is a string before calling toLowerCase()
      if (item.lotId && typeof item.lotId === "string") {
        return item.lotId.toLowerCase().includes(searchTerm);
      }
      return false;
    });

    if (filteredLots.length === 0) {
      Logger.info(
        `No lots found containing '${searchTerm}' after filtering ${allStockItems.length} items.`
      );
    } else {
      Logger.info(
        `Found ${filteredLots.length} lot(s) containing '${searchTerm}' after filtering ${allStockItems.length} items.`
      );
    }

    return filteredLots;
  } catch (error) {
    const firestoreError = error as FirestoreError;
    Logger.error("Error during searchLot execution", {
      errorMessage: firestoreError.message,
      errorCode: firestoreError.code,
      details: firestoreError,
    });
    return []; // Return empty array on error
  }
}
