import { db } from "shared/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  getDoc,
  doc,
  where,
} from "firebase/firestore";
import { APIError } from "shared/Error";
import { Logger } from "utils/logger";
import { IEntry } from "modules/entries/types";
import { IDispatch } from "modules/dispatches/types";

export interface IHistoricMovement {
  id: string;
  type: string;
  data: Array<IEntry | IDispatch>;
  createdAt: string;
}

export const fetchHistoricMovements = async (
  page: number,
  pageSize: number,
  lastVisible: string | null,
  productId: string | null = null,
  type: "entry" | "dispatch" | null = null
): Promise<IHistoricMovement[]> => {
  try {
    const historicMovementsRef = collection(db, "historicMovements");
    let q;
    Logger.info("Fetching historic movements", { productId, type });
    if (productId && type) {
      q = query(
        historicMovementsRef,
        where("productsIds", "array-contains", productId),
        where("type", "==", type),
        orderBy("createdAt"),
        limit(50)
      );
    } else if (productId) {
      q = query(
        historicMovementsRef,
        where("productsIds", "array-contains", productId),
        orderBy("createdAt"),
        limit(50)
      );
    } else if (type) {
      q = query(
        historicMovementsRef,
        where("type", "==", type),
        orderBy("createdAt"),
        limit(50)
      );
    } else {
      q = query(historicMovementsRef, orderBy("createdAt"), limit(50));
    }

    const snapshot = await getDocs(q);
    const result = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as IHistoricMovement)
    );
    Logger.info("Fetched historic movements", {
      result,
    });
    return result;
  } catch (error) {
    Logger.error("Failed to fetch historic movements", { error });
    throw new APIError("Failed to fetch historic movements", error);
  }
};

export const searchEntriesAndDispatchesByProductId = async (
  productId: string
) => {
  const dispatchesRef = collection(db, "dispatches");
  const entriesRef = collection(db, "entries");
  const q = query(
    dispatchesRef,
    where("products", "array-contains", productId),
    limit(10)
  );
  const q2 = query(
    entriesRef,
    where("products", "array-contains", productId),
    limit(10)
  );
  const dispatchesSnapshot = await getDocs(q);
  const entriesSnapshot = await getDocs(q2);
  const dispatches = dispatchesSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  const entries = entriesSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return [...dispatches, ...entries];
};

export const searchEntriesAndDispatchesByProductName = async (
  productName: string
) => {
  // dispatches and entries collection will always have a description field which contains a string with the products names and other stuff
  // maybe i can query by that field

  const dispatchesRef = collection(db, "dispatches");
  const entriesRef = collection(db, "entries");
  const q = query(
    dispatchesRef,
    where("description", ">=", productName),
    where("description", "<=", productName + "\uf8ff"),
    limit(10)
  );
  const q2 = query(
    entriesRef,
    where("description", ">=", productName),
    where("description", "<=", productName + "\uf8ff"),
    limit(10)
  );
  const dispatchesSnapshot = await getDocs(q);
  const entriesSnapshot = await getDocs(q2);
  const dispatches = dispatchesSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  const entries = entriesSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return [...dispatches, ...entries];
};
