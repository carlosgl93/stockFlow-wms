import { IPlace } from "modules/lots/infraestructure";

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
