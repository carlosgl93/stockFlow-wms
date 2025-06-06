import { Category } from "./Category";
import { IContainer } from "./IContainer";
import { IUnitOfMeasure } from "./IUnitOfMeasure";
import { RiskCategory } from "./RiskCategory";
import { PalletType } from "../utils";

export interface IProduct {
  id?: string;
  extCode: string;
  internalCode: string;
  name: string;
  price?: number;
  warehouseStock?: number;
  riskCategory: RiskCategory;
  qPerUnit?: number;
  category: Category;
  safetyDocument?: FileList | null;
  selectionType: "box" | "unit";
  boxDetails?: IBoxDetails;
  lotId?: string;
  placeId?: string;
  expirityDate?: string;
  palletNumber?: string;
}

export type IBoxDetails = {
  units: number;
  quantity: number;
  unitOfMeasure: IUnitOfMeasure;
  container: IContainer;
  type: string;
  kilos: number;
  height?: number;
  width?: number;
  depth?: number;
  unitsPerSurface?: number;
  palletType?: PalletType;
};

export { PalletType as IPallet };

export type ExcelProductType = {
  "Item Code": string; // product id / code
  "CANTIDAD X UNIDAD": number;
  "CATEGORIA DE RIESGO": "PELIGROSO" | "NO PELIGROSO";
  "CATEGORIA PRODUCTO": Category;
  CONTENEDOR: IContainer;
  "Item Desc": string; // product name
  "Lot Expiration Date": string; // date in dd/mm/yyyy format
  "Lot Number": string;
  "MENSAJE DIFERENCIAS": string;
  PALLET: number;
  "STOCK BODEGA": number;
  "STOCK SISTEMA": number;
  "TIPO DE UNIDAD": ExcelLongUnitType;
  "Uom Code": ExcelShortUnitType;
  "UNIDAD DE MEDIDA": string; // 2.5 GR / 500 ML / 10 Litros
  "Unidad Negocio": "PreHarvest" | "PostHarvest";
};
export enum ExcelShortUnitType {
  GR = "GR",
  ML = "ML",
  KILO = "KILO",
  UNI = "UNI",
  KGR = "KGR",
  LTR = "LTR",
}

export enum ExcelLongUnitType {
  GRAM = "GRAMOS",
  KILOGRAM = "KILOGRAMOS",
  LITERS = "LITROS",
  LITER = "LITRO",
}
