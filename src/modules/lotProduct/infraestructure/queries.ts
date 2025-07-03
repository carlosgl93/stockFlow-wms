import { db } from "shared/firebase";
import { Logger } from "utils/logger";
import { getHumanReadableError } from "shared/Error";
import { dateVO } from "utils/format";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  query,
  orderBy,
  where,
  runTransaction,
  DocumentReference,
} from "firebase/firestore";
import { IStock } from "modules/stock/types";

export const getTotalStockByProductIdAndLotId = async (
  productId: string,
  lotId: string
): Promise<IStock | null> => {
  try {
    const stockQuery = query(
      collection(db, "lotProducts"),
      where("productId", "==", productId),
      where("lotId", "==", lotId)
    );
    const stockSnapshot = await getDocs(stockQuery);
    if (stockSnapshot.empty) {
      return null;
    }
    const stockData = stockSnapshot.docs[0].data() as IStock;
    return {
      ...stockData,
      id: stockSnapshot.docs[0].id,
    };
  } catch (error) {
    Logger.error("Error fetching total stock by product and lot", {
      error,
      productId,
      lotId,
    });
    const t = (key: string) => key; // Fallback translation function
    const humanError = getHumanReadableError(error, t);
    throw new Error(humanError);
  }
};
