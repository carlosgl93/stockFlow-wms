/**;
 *
 * @param  id: string
 * @returns  Returns
 *
 */

import { doc, getDoc } from "firebase/firestore";
import { ITransporter } from "modules/transporters/types";
import { APIError, ValidationError } from "shared/Error";
import { db } from "shared/firebase";

export async function getTransporterById(id: string) {
  if (!id) {
    throw new ValidationError("No transporter id provided", "400");
  }

  const transporterRef = doc(db, "transporters", id);
  try {
    const transporterSnap = await getDoc(transporterRef);
    const data = transporterSnap.data();
    return {
      ...data,
      id: transporterSnap.id,
    } as ITransporter;
  } catch (error) {
    throw new APIError("Error fetching transporters by id", error);
  }
}
