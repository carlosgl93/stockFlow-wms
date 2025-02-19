import { doc, updateDoc } from "firebase/firestore";
import { ITransporter } from "modules/transporters/types";
import { APIError } from "shared/Error";
import { db } from "shared/firebase";

type updateTransporterParams = {
  transId: string;
  transporter: ITransporter;
};

export const updateTransporter = async ({
  transId,
  transporter,
}: updateTransporterParams) => {
  try {
    const transporterRef = doc(db, "transporters", transId);
    transporter.name = transporter.name.toLowerCase().trim();
    await updateDoc(transporterRef, { ...transporter });
    return transporterRef.id;
  } catch (error) {
    throw new APIError("Failed to update transporter", error);
  }
};
