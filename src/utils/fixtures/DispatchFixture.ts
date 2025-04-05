import { IDispatchForm } from "modules/dispatches/types";
import { createFixture } from "./createFixture";

export const DispatchFixture = createFixture<IDispatchForm>({
  id: "1",
  supplierId: "supplier-1",
  docNumber: "DOC12345",
  transporterId: "transporter-1",
  productId: "product-1",
  lotId: "lot-1",
  placeId: "place-1",
  stockId: "stock-1",
  dispatchDate: "2023-10-01",
  deliveryDate: "2023-10-11",
  palletNumber: "PALLET123",
  unitsNumber: 100,
  looseUnitsNumber: 10,
  totalUnitsNumber: 110,
  heightCMs: 150,
  widthCMs: 100,
  description: "Sample dispatch description",
  createdAt: "2023-10-01T00:00:00Z",
  updatedAt: "2023-10-01T00:00:00Z",
});
