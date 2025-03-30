import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "shared/firebase";
import { ILotProduct } from "../types";
import { ValidationError, APIError } from "shared/Error";
import { Logger } from "utils/logger";

/**
 * Retrieves the total stock of a product by Lot ID from Firestore.
 *
 * @param {string} productId - The ID of the product.
 * @param {string} lotId - The ID of the Lot to retrieve products for.
 * @returns {Promise<ILotProduct>} - A promise that resolves to a single LotProduct with reduced totals.
 * @throws {ValidationError} - If the lotId is invalid.
 * @throws {APIError} - If there is an error retrieving the documents.
 */
export const getTotalStockByProductIdAndLotId = async (
  productId: string,
  lotId: string
): Promise<ILotProduct> => {
  if (!lotId || !productId) {
    throw new ValidationError("Invalid lotId or productId");
  }

  const lotProductRef = collection(db, "lotProducts");
  const q = query(
    lotProductRef,
    where("lotId", "==", lotId),
    where("productId", "==", productId)
  );

  try {
    const querySnapshot = await getDocs(q);
    const lotProducts: ILotProduct[] = [];
    querySnapshot.forEach((doc) => {
      lotProducts.push({ id: doc.id, ...doc.data() } as ILotProduct);
    });
    Logger.info("lot products", lotProducts);
    const reducedLotProduct = lotProducts.reduce(
      (acc, curr) => {
        if (acc.placesIds && curr.placeId) {
          acc.placesIds.push(curr?.placeId);
        }
        Logger.info("type of", [
          typeof acc.unitsNumber,
          typeof curr.unitsNumber,
        ]);
        acc.unitsNumber += curr.unitsNumber || 0;
        acc.looseUnitsNumber += curr.looseUnitsNumber || 0;
        acc.totalUnits += curr.unitsNumber + curr.looseUnitsNumber || 0;
        return acc;
      },
      {
        id: "",
        lotId,
        productId,
        unitsNumber: 0,
        looseUnitsNumber: 0,
        expirationDate: "",
        totalUnits: 0,
        createdAt: "",
        updatedAt: "",
        placeId: "",
        placesIds: [],
      } as ILotProduct
    );

    return reducedLotProduct;
  } catch (error) {
    throw new APIError("Failed to retrieve LotProducts", error);
  }
};
