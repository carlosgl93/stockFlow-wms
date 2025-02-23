export interface ILotProduct {
  id: string;
  lotId: string;
  productId: string;
  unitsNumber: number;
  looseUnitsNumber: number;
  expirationDate: string;
  totalUnits: number;
  createdAt: string;
  updatedAt?: string;
}
