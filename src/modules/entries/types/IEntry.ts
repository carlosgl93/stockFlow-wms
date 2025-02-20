export interface IEntry {
  id?: string;
  supplierId: string;
  docNumber: string;
  transporterId: string; // name of the driver
  productId: string;
  lotId: string;
  placeId?: string;
  stockId?: string;
  expirityDate: string;
  palletNumber: string;
  unitsNumber: number;
  looseUnitsNumber: number;
  totalUnitsNumber: number;
  heightCMs: number;
  widthCMs: number;
  description: string; // equivalent to nota
  createdAt?: string;
  updatedAt?: string;
}
