import { IProductEntry } from "modules/entries/types";

export interface IDispatch {
  id?: string;
  docType?: DocumentType;
  supplierId: string;
  docNumber: string;
  transporterId: string;
  products: IProductEntry[];
  dispatchDate: string;
  deliveryDate: string;
  createdAt?: string;
  updatedAt?: string;
  dispatchedStatus?: DispatchedStatus;
  description?: string;
}

export interface IDispatchForm {
  id?: string;
  docType?: DocumentType;
  supplierId: string;
  docNumber: string;
  productId: string;
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
  transporterId: string;
  dispatchDate: string;
  deliveryDate: string;
  createdAt?: string;
  updatedAt?: string;
  dispatchedStatus?: DispatchedStatus;
}

export enum DocumentType {
  Dispatch = "Dispatch",
  Credit = "Credit",
  Invoice = "Invoice",
  Pending = "Pending",
}

export enum DispatchedStatus {
  Pending = "Pending",
  Dispatched = "Dispatched",
  Delivered = "Delivered",
  Cancelled = "Cancelled",
}
