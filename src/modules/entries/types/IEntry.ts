export interface IEntry {
  id: string;
  supplierId: string;
  docNumber: string;
  transporter: string; // name of the driver
  productId: string;
  lotId: string;
  expirityDate: string;
  palletNumber: string;
  unitsNumber: number;
  looseUnitsNumber: number;
  totalUnitsNumber: number;
  heightCMs: number;
  widthCMs: number;
  description: string; // equivalent to nota
}
