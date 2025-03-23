import { IPlace } from "modules/lots/infraestructure";
import { IProduct } from "modules/products/types";
import { ISupplier } from "modules/suppliers";
import { ITransporter } from "modules/transporters/types";

export interface IStock {
  id: string;
  productId: string;
  lotId: string;
  unitsNumber: number;
  looseUnitsNumber: number;
  createdAt: string;
  updatedAt: string;
  placeId?: string;
  places?: IPlace[];
}

export interface IRenderStock extends IStock {
  product: IProduct;
}

export type ISuppsAndTrans = {
  entryId: string;
  supplier: ISupplier;
  transporter: ITransporter;
}[];
