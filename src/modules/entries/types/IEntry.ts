export interface IEntry {
  id?: string;
  supplierId: string;
  docNumber: string;
  transporterId: string;
  productsIds?: string[];
  products: IProductEntry[];
  description: string; // equivalent to nota
  createdAt?: string;
  updatedAt?: string;
  entryDate: string;
  productsToEnter?: IProductEntry[];
}

export interface IProductEntry {
  id: string;
  unitsNumber: number;
  looseUnitsNumber: number;
  totalUnitsNumber: number;
  lotId: string;
  stockId?: string;
  placeId?: string;
  expirityDate?: string;
  palletNumber: string;
  description?: string;
  unitOfMeasure?: string; // e.g., "kg", "liters", etc.
  qPerUnit: number; // Quantity per unit, e.g., 500 ml or 1 kg or 2.5 Grams
  unitsPerBox?: number; // Optional, used for bulk entries
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
  entryDate: string;
  productsToEnter?: IProductEntry[];
  productsIds?: string[]; // Optional, used for bulk entries
}
