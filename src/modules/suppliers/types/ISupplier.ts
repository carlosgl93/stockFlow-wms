import { IContact } from "./IContact";

export interface ISupplier {
  id?: string;
  company: string;
  idNumber: string;
  businessCategory: string;
  county: string;
  region: string;
  fax: string;
  phone: string;
  website: string;
  email: string;
  address: string;
  contact: IContact;
}
