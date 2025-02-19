import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { ITransporter } from "modules/transporters/types";
import { APIError, ValidationError } from "shared/Error";
import { db } from "shared/firebase";

export const saveTransporter = async (transporter: ITransporter) => {
  try {
    const transporterName = transporter.name.toLowerCase().trim();

    // Check if a transporter with the same name already exists
    const transportersCollection = collection(db, "transporters");
    const q = query(
      transportersCollection,
      where("name", "==", transporterName)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      throw new ValidationError("A transporter with that name already exists");
    }

    const transporterRef = doc(transportersCollection);
    await setDoc(transporterRef, { ...transporter, name: transporterName });
    return transporter;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new APIError("Failed to add transporter", error);
  }
};
