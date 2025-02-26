import { IMovement } from "./IPlace";

export interface ILot {
  id: string;
  name: string;
  entryDate?: string;
  departureDate?: string;
  movementHistory?: IMovement[];
}
