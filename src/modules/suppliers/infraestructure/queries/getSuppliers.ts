import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "shared/firebase";
import { APIError } from "shared/Error";
import { ISupplier } from "modules/suppliers";

export const getSuppliers = async (
  pageSize: number,
  lastVisible: string | null
) => {
  try {
    let suppliersQuery = query(
      collection(db, "suppliers"),
      orderBy("company"),
      limit(pageSize)
    );

    if (lastVisible) {
      const lastVisibleDoc = await getDoc(doc(db, "suppliers", lastVisible));
      suppliersQuery = query(suppliersQuery, startAfter(lastVisibleDoc));
    }

    const snapshot = await getDocs(suppliersQuery);
    const suppliers = snapshot.docs.map((doc) => ({
      ...(doc.data() as ISupplier),
      id: doc.id,
    }));
    const lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];
    const result: { suppliers: ISupplier[]; lastVisible: string | null } = {
      suppliers,
      lastVisible: lastVisibleDoc ? lastVisibleDoc.id : null,
    };
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new APIError("Failed to fetch suppliers", error.message);
    }
  }
};
