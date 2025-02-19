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
import { ITransporter } from "modules/transporters/types";

export const getTransporters = async (
  pageSize: number,
  lastVisible: string | null
) => {
  try {
    let transportersQuery = query(
      collection(db, "transporters"),
      orderBy("name"),
      limit(pageSize)
    );

    if (lastVisible) {
      const lastVisibleDoc = await getDoc(doc(db, "transporters", lastVisible));
      transportersQuery = query(transportersQuery, startAfter(lastVisibleDoc));
    }

    const snapshot = await getDocs(transportersQuery);
    const transporters = snapshot.docs.map((doc) => ({
      ...(doc.data() as ITransporter),
      id: doc.id,
    }));
    const lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];
    const result: { transporters: ITransporter[]; lastVisible: string | null } =
      {
        transporters,
        lastVisible: lastVisibleDoc ? lastVisibleDoc.id : null,
      };
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new APIError("Failed to fetch transporters", error.message);
    }
  }
};
