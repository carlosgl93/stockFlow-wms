export interface IEntry {
  id?: string;
  supplierId: string;
  docNumber: string;
  transporterId: string; // name of the driver
  productsToEnter: IProductEntry[];
  description: string; // equivalent to nota
  createdAt?: string;
  updatedAt?: string;
}

export interface IProductEntry {
  id: string; // productId
  unitsNumber: number;
  looseUnitsNumber: number;
  totalUnitsNumber: number;
  lotId: string;
  stockId?: string;
  placeId?: string;
  expirityDate?: string;
  palletNumber: string;
  heightCMs: number;
  widthCMs: number;
  description?: string;
}

export interface IEntryForm {
  id?: string;
  supplierId: string;
  docNumber: string;
  productId: string;
  unitsNumber: number;
  looseUnitsNumber: number;
  totalUnitsNumber: number;
  lotId: string;
  placeId: string;
  expirityDate: string;
  stockId?: string;
  palletNumber: string;
  heightCMs: number;
  widthCMs: number;
  transporterId: string; // name of the driver
  description: string; // equivalent to nota
  createdAt?: string;
  updatedAt?: string;
}
