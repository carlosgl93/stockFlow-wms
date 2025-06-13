/**;
 *
 * @param  Params
 * @returns  Returns
 *
 */

import { doc, getDoc } from "firebase/firestore";
import { APIError } from "shared/Error";
import { db } from "shared/firebase";
import { IProduct } from "../types";
import { Logger } from "utils/logger";

export async function getProductById(id: string) {
  Logger.info("Fetching product by ID:", [id]);
  const prodRef = doc(db, "products", id);
  const product = await getDoc(prodRef);
  if (!product.exists()) {
    throw new APIError("Product not found", { productId: id });
  }
  const productDto = product.data() as IProduct;
  return productDto;
}
