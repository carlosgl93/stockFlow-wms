import { IPlace } from "modules/lots/infraestructure";

export interface IStock {
  id: string;
  productId: string;
  lotId: string;
  unitsNumber: number;
  looseUnitsNumber: number;
  created_at: Date;
  updated_at: Date;
  places?: IPlace[];
}
