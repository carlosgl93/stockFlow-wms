import {
  Category,
  IProduct,
  RiskCategory,
  IContainer,
  IUnitOfMeasure,
  IPallet,
} from "modules/products/types";
import { createFixture } from "./createFixture";

export const ProductFixture = createFixture<IProduct>({
  extCode: "EXT123",
  internalCode: "INT123",
  name: "Valor 4%",
  price: 129.99,
  riskCategory: RiskCategory.Toxic,
  category: Category.Acaricide,
  safetyDocument: null,
  selectionType: "box",
  boxDetails: {
    units: 10,
    quantity: 100,
    unitOfMeasure: IUnitOfMeasure.Liter,
    container: IContainer.Bidon,
    type: "Plastic",
    kilos: 5,
    height: 30,
    width: 20,
    depth: 10,
    unitsPerSurface: 50,
    palletType: IPallet.European,
  },
});
