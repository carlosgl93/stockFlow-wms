import * as XLSX from "xlsx";
import { IContainer, IProduct, IUnitOfMeasure } from "../types";
import {
  ExcelLongUnitType,
  ExcelProductType,
  ExcelShortUnitType,
} from "../types/IProduct";

export const loadProductsFromExcel = async (
  file: File
): Promise<IProduct[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      worksheet["!ref"] = "C1:Z1000";
      const jsonData = XLSX.utils.sheet_to_json<ExcelProductType>(worksheet);
      const uniqueProducts = Array.from(
        new Map(
          jsonData.map((product) => [product["Item Code"], product])
        ).values()
      );
      const rows: IProduct[] = uniqueProducts
        .map((product) => {
          if (!product["Item Code"]) return null;
          return {
            id: product["Item Code"],
            extCode: product["Item Code"],
            internalCode: product["Item Code"],
            name: product["Item Desc"],
            selectionType: "box",
            category: product["CATEGORIA PRODUCTO"],
            riskCategory: product[
              "CATEGORIA DE RIESGO"
            ] as IProduct["riskCategory"],
            boxDetails: {
              container: product.CONTENEDOR as IContainer,
              unitOfMeasure: mapUnitType(
                product["UNIDAD DE MEDIDA"]
                  ?.trim()
                  ?.split(" ")[1]
                  .trim() as ExcelLongUnitType
              ),
              units: product["CANTIDAD X UNIDAD"],
              quantity: parseFloat(
                product["UNIDAD DE MEDIDA"]
                  .trim()
                  ?.split(" ")[0]
                  .replace(",", ".")
              ),
              type: "Plastic",
              kilos:
                parseFloat(
                  product["UNIDAD DE MEDIDA"]
                    .trim()
                    ?.split(" ")[0]
                    .replace(",", ".")
                ) * product["CANTIDAD X UNIDAD"],
            },
          } as IProduct;
        })
        .filter((item) => item !== null) as IProduct[];
      resolve(rows);
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

const mapUnitType = (
  unitType: ExcelLongUnitType | ExcelShortUnitType
): IUnitOfMeasure => {
  if (
    unitType === ExcelLongUnitType.GRAM ||
    unitType === ExcelShortUnitType.GR
  ) {
    return IUnitOfMeasure.Gram;
  }
  if (
    unitType === ExcelLongUnitType.LITER ||
    unitType === ExcelShortUnitType.LTR ||
    unitType === ExcelLongUnitType.LITERS
  ) {
    return IUnitOfMeasure.Liter;
  }
  if (
    unitType === ExcelLongUnitType.KILOGRAM ||
    unitType === ExcelShortUnitType.KILO
  ) {
    return IUnitOfMeasure.Kilo;
  }
  return IUnitOfMeasure.CC;
};
