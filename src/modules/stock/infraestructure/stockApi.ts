import { db } from "shared/firebase";
import { IRenderStock, IStock } from "../types";
import { APIError, ValidationError } from "shared/Error";
import { dateVO } from "utils/format";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  query,
  orderBy,
  limit,
  startAfter,
  runTransaction,
} from "firebase/firestore";
import { Logger } from "utils/logger";
import { IProduct } from "modules/products/types";

export const fetchStock = async (
  page: number,
  pageSize: number,
  lastVisible: string | null
): Promise<IRenderStock[]> => {
  Logger.info("fetchStock", { page, pageSize, lastVisible });
  try {
    const stockRef = collection(db, "stock");
    let q = query(stockRef, orderBy("createdAt"), limit(pageSize));
    if (lastVisible) {
      const lastVisibleDoc = await getDoc(doc(db, "stock", lastVisible));
      q = query(
        stockRef,
        orderBy("createdAt"),
        startAfter(lastVisibleDoc),
        limit(pageSize)
      );
    }
    const snapshot = await getDocs(q);
    const stockEntries = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as IStock)
    );

    // Fetch all product details in a single batch
    const productPromises = stockEntries.map((stock) =>
      getDoc(doc(db, "products", stock.productId))
    );
    const productDocs = await Promise.all(productPromises);

    // Map the product details to their respective stock entries
    const stockWithProducts = stockEntries.map((stock, index) => {
      const productDoc = productDocs[index];
      const productData = productDoc.exists()
        ? (productDoc.data() as IProduct)
        : null;
      return { ...stock, product: productData as IProduct };
    });

    return stockWithProducts;
  } catch (error) {
    throw new APIError("Failed to fetch stock", error);
  }
};
export const addStock = async (stock: IStock): Promise<IStock> => {
  try {
    const now = dateVO.now();
    return await runTransaction(db, async (transaction) => {
      const stockRef = collection(db, "stock");

      // Validate product
      const productRef = doc(db, "products", stock.productId);
      const productDoc = await transaction.get(productRef);
      if (!productDoc.exists()) {
        throw new ValidationError("Invalid productId.");
      }

      // Validate lot
      const lotRef = doc(db, "lots", stock.lotId);
      const lotDoc = await transaction.get(lotRef);
      if (!lotDoc.exists()) {
        throw new ValidationError("Invalid lotId.");
      }

      // Store the stock
      const stockDocRef = await addDoc(stockRef, {
        ...stock,
        createdAt: now,
        updatedAt: now,
      });
      stock.id = stockDocRef.id;

      return stock;
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new APIError("Failed to add stock", error);
  }
};

export const updateStock = async ({
  stockId,
  values,
}: {
  stockId: string;
  values: IStock;
}): Promise<IStock> => {
  try {
    return await runTransaction(db, async (transaction) => {
      const stockDocRef = doc(db, "stock", stockId);

      // Fetch documents
      const stockDoc = await transaction.get(stockDocRef);

      if (!stockDoc.exists()) {
        throw new ValidationError("Stock does not exist.");
      }

      // Update stock
      transaction.update(stockDocRef, {
        ...values,
        updatedAt: dateVO.now(),
      });

      return { ...values, id: stockDoc.id };
    });
  } catch (error) {
    throw new APIError("Failed to update stock", error);
  }
};

export const removeStock = async (stockId: string): Promise<void> => {
  try {
    return await runTransaction(db, async (transaction) => {
      const stockDocRef = doc(db, "stock", stockId);
      const stockDoc = await transaction.get(stockDocRef);

      if (!stockDoc.exists()) {
        throw new ValidationError("Stock does not exist.");
      }

      // Delete the stock
      transaction.delete(stockDocRef);
    });
  } catch (error) {
    throw new APIError("Failed to remove stock", error);
  }
};

export const getStockById = async (stockId: string): Promise<IStock> => {
  try {
    const stockDoc = await getDoc(doc(db, "stock", stockId));
    if (!stockDoc.exists()) {
      throw new ValidationError("Stock does not exist.");
    }
    return { id: stockDoc.id, ...stockDoc.data() } as IStock;
  } catch (error) {
    throw new APIError("Failed to fetch stock", error);
  }
};
