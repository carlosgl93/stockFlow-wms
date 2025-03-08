import { IProductEntry } from "./IEntry";

export interface EntryDTO {
  id?: string;
  supplierId: string;
  docNumber: string;
  transporterId: string;
  description: string;
  productsToEnter: IProductEntry[];
}
