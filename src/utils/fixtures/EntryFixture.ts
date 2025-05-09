import { IEntryForm } from "modules/entries/types";
import { createFixture } from "./createFixture";

export const EntryFixture = createFixture<IEntryForm>({
  id: "1",
  supplierId: "supplier-1",
  docNumber: "DOC123456",
  transporterId: "John Doe",
  productId: "product-1",
  placeId: "place-1",
  lotId: "lot-1",
  expirityDate: "2025-12-31",
  palletNumber: "PAL123",
  unitsNumber: 100,
  looseUnitsNumber: 0,
  totalUnitsNumber: 110,
  heightCMs: 150,
  widthCMs: 100,
  description: "Sample entry description",
});
