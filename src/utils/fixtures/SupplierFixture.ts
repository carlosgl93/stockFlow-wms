import { ISupplier } from "modules/suppliers/types";
import { createFixture } from "./createFixture";

export const SupplierFixture = createFixture<ISupplier>({
  company: "Sample Company",
  idNumber: "ID123456",
  businessCategory: "Retail",
  county: "Sample County",
  region: "Sample Region",
  fax: "123-456-7890",
  phone: "123-456-7890",
  website: "https://samplecompany.com",
  email: "info@samplecompany.com",
  address: "123 Sample Street, Sample City, Sample Country",
  contact: {
    name: "John Doe",
    email: "john.doe@samplecompany.com",
    phone: "123-456-7890",
  },
});
