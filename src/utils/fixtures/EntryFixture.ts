import { IEntry } from "modules/entries/types";
import { createFixture } from "./createFixture";

export const EntryFixture = createFixture<IEntry>({
  id: "1",
  supplierId: "supplier-1",
  docNumber: "DOC123456",
  transporter: "John Doe",
  productId: "product-1",
  lotId: "lot-1",
  expirityDate: "2025-12-31",
  palletNumber: "PAL123",
  unitsNumber: 100,
  looseUnitsNumber: 10,
  totalUnitsNumber: 110,
  heightCMs: 150,
  widthCMs: 100,
  description: "Sample entry description",
});
