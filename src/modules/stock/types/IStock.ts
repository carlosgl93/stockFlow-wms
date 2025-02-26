import { IPlace } from "modules/lots/infraestructure";
import { IProduct } from "modules/products/types";

export interface IStock {
  id: string;
  productId: string;
  lotId: string;
  unitsNumber: number;
  looseUnitsNumber: number;
  createdAt: string;
  updatedAt: string;
  places?: IPlace[];
}

export interface IRenderStock extends IStock {
  product: IProduct;
}
