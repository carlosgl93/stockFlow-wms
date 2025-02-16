export interface ILot {
  id: string;
  name: string;
  entryDate?: string;
  departureDate?: string;
  movementHistory?: IMovement[];
}

export interface IMovement {
  id: string;
  productId: string;
  fromLotId: string;
  toLotId: string;
  date: string;
  quantity?: number;
}
