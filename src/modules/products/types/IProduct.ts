import { Category } from "./Category";
import { IContainer } from "./IContainer";
import { IUnitOfMeasure } from "./IUnitOfMeasure";
import { RiskCategory } from "./RiskCategory";
import { PalletType } from "../utils";
import { IMaterialType } from "./IMaterialType";

export interface IProduct {
  id?: string;
  extCode: string;
  internalCode: string;
  name: string;
  price?: number;
  warehouseStock?: number;
  riskCategory: RiskCategory;
  qPerUnit?: number; // this is for the quantity per unit like 100ML per unit (bottle)
  category: Category;
  safetyDocument?: FileList | null;
  selectionType: "box" | "unit";
  boxDetails: IBoxDetails;
  lotId?: string;
  placeId?: string;
  expirityDate?: string;
  palletNumber?: string;
}

export type IBoxDetails = {
  units: number; // this is how many units (bidones, bolsas, etc) are inside the box
  quantity: number; // this is the quantity per unit like "100ML", "500GR", etc
  unitOfMeasure?: IUnitOfMeasure; // this is the unit of measure like GR, ML, KILO, etc
  container: IContainer; // this is the container type like "BIDON", "BOLSA", etc
  type: IMaterialType; // this is the type of the product like "BIDON", "BOLSA", etc
  kilos: number;
  height?: number;
  width?: number;
  depth?: number;
  unitsPerSurface?: number; // this is the units per surface like 4 units per surface
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
