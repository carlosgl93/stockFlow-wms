export interface IDispatch {
  id?: string;
  docType?: DocumentType;
  supplierId: string;
  docNumber: string;
  transporterId: string;
  productId: string;
  lotId: string;
  placeId?: string;
  stockId?: string;
  dispatchDate: string;
  deliveryDate: string;
  palletNumber: string;
  unitsNumber: number;
  looseUnitsNumber: number;
  totalUnitsNumber: number;
  heightCMs: number;
  widthCMs: number;
  description: string;
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
