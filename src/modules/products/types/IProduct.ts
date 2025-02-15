import { Category } from "./Category";
import { IContainer } from "./IContainer";
import { IUnitOfMeasure } from "./IUnitOfMeasure";
import { RiskCategory } from "./RiskCategory";

export interface IProduct {
  id?: string;
  extCode: string;
  internalCode: string;
  name: string;
  price: number;
  riskCategory: RiskCategory;
  category: Category;
  safetyDocument?: FileList | null;
  selectionType: string;
  boxDetails?: {
    units: number;
    quantity: number;
    unitOfMeasure: IUnitOfMeasure;
    container: IContainer;
    type: string;
    kilos: number;
    height: number;
    width: number;
    depth: number;
    unitsPerSurface: number;
    palletType: IPallet;
  };
}

export enum IPallet {
  Chinese = "Chinese",
  European = "European",
}
