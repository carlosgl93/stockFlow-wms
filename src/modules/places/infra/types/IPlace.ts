export interface IPlace {
  id: string;
  name: string;
  entryDate?: string;
  departureDate?: string;
  movementHistory?: IMovement[];
}

export interface IMovement {
  id: string;
  productId: string;
  fromPlaceId: string;
  toPlaceId: string;
  date: string;
  quantity?: number;
}
