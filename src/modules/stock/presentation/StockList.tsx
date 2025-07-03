import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { Box, Text } from "@chakra-ui/react";
import { IRenderStock, IStock, ISuppsAndTrans } from "../types";
import { AppThemeProvider } from "theme/materialTheme";
import { capitalize, useTranslate } from "utils";
import { useEffect, useState, useCallback } from "react";
import { IEntry } from "modules/entries/types";
import { FlexBox } from "shared/Layout";
import { IPlace } from "modules/places/infra";
import { Logger } from "utils/logger";
import { IProduct } from "modules/products/types";
import dayjs from "dayjs";
import { ILotProductWithProduct } from "modules/lotProduct/infraestructure/queries/getLotProducts";

interface IProps {
  entries: IEntry[];
  stock: IStock[];
  productId: string;
  selectedLot: string;
  suppsAndTrans: ISuppsAndTrans;
  placesInfo: IPlace[];
  isLoading: boolean;
  stockData: IRenderStock[];
  lotProducts: ILotProductWithProduct[];
}

interface IRow {
  id: string;
  productName: string;
  lotId: string | undefined;
  placeId: string | undefined;
  totalUnits: string; // e.g., "500 Liters"
  unitsNumber: number | undefined; // Keep for individual calculation if needed elsewhere
  looseUnitsNumber: number | undefined; // Keep for individual calculation if needed elsewhere
  // Add other fields from stockData if they are needed directly in the row
  // For example, if expiryDate, supplier, transporter, palletNumber are still needed from stockData
  // expiryDate: string | undefined;
  // supplier: string;
  // transporter: string;
  // palletNumber: string | undefined;
  // docNumber: string; // If needed from stockData or related data
}

export const StockList = ({
  productId,
  selectedLot,
  placesInfo,
  isLoading,
  lotProducts,
}: IProps) => {
  const { t, dataGridLocaleText } = useTranslate();
  const [totalUnits, setTotalUnits] = useState<number>(0);
  const [totalBoxes, setTotalBoxes] = useState<number>(0);
  const [matchedProduct, setMatchedProduct] = useState<IProduct | null>(null);
  const [rows, setRows] = useState<IRow[]>([]);

  const columns: GridColDef[] = [
    { field: "productName", headerName: t("Product Name"), width: 200 },
    { field: "lotId", headerName: t("Lot"), width: 150 },
    {
      field: "placeId",
      headerName: t("Place"),
      width: 150,
      renderCell: (params) => {
        if (
          params.formattedValue === "NO ESPECIFICARÉ UN LUGAR" ||
          !params.formattedValue ||
          params.formattedValue === "N/A"
        ) {
          return <Text color="red.500">{t("No Place Specified")}</Text>;
        }
        return <Text>{params.formattedValue}</Text>;
      },
    },
    { field: "unitsNumber", headerName: t("Total Units"), width: 150 },
    {
      field: "expirityDate",
      headerName: t("Expiry Date"),
      width: 150,
      renderCell: (params) => {
        return <Text>{params.formattedValue || t("N/A")}</Text>;
      },
    },
    // { field: "docNumber", headerName: t("Doc Number"), width: 150 }, // Remove or adapt if not in stockData
    // { field: "palletNumber", headerName: t("Pallet Number"), width: 150 }, // Remove or adapt
    // { field: "unitsNumber", headerName: t("Units Number"), width: 150 }, // Remove or adapt
    // {
    //   field: "looseUnitsNumber",
    //   headerName: t("Loose Units Number"), // Remove or adapt
    //   width: 150,
    // },
    // { field: "expiryDate", headerName: t("Expiry Date"), width: 150 }, // Remove or adapt
    // { field: "documentType", headerName: t("Document Type"), width: 150 }, // Remove or adapt
    // { field: "supplier", headerName: t("Supplier"), width: 150 }, // Remove or adapt
    // { field: "transporter", headerName: t("Transporter"), width: 150 }, // Remove or adapt
  ];

  const generateRows = useCallback((): {
    rows: IRow[];
    stats: {
      totalUnits: number;
      totalBoxes: number;
      matchedProduct: IProduct | null;
    };
  } => {
    let calculatedTotalUnits = 0;
    let calculatedWholeUnitsTotal = 0;
    let calculatedLooseUnitsTotal = 0;

    const newRows = lotProducts
      ?.filter((item) => {
        const productMatch = !productId || item.productId === productId;
        const lotMatch = !selectedLot || item.lotId === selectedLot;
        return productMatch && lotMatch;
      })
      .map((item) => {
        Logger.info("Processing item in generateRows:", {
          item,
        });
        const units = item.unitsNumber || 0;
        const looseUnits = item.looseUnitsNumber || 0;
        const currentTotal = units + looseUnits;
        calculatedTotalUnits += currentTotal;
        calculatedWholeUnitsTotal += units;
        calculatedLooseUnitsTotal += looseUnits;
        const placeName =
          placesInfo.find((p) => p.id === item.placeId)?.name ||
          item.placeId ||
          t("N/A");
        const unitOfMeasure = item.product?.boxDetails?.unitOfMeasure || "";
        const quantityString = String(
          item.product?.boxDetails?.quantity || "0"
        );
        const quantityPerUnit = parseFloat(quantityString);
        const totalQuantity = currentTotal * quantityPerUnit;
        const expDate = item.expirationDate
          ? dayjs(item.expirationDate).format("DD/MM/YYYY")
          : t("N/A");

        return {
          id: item.id!,
          productName:
            item.product?.name.toLocaleUpperCase("es-CL") || t("N/A"),
          lotId: item.lotId,
          placeId: placeName,
          totalUnits: `${totalQuantity} ${unitOfMeasure}`,
          unitsNumber: units,
          looseUnitsNumber: looseUnits,
          expirityDate: expDate,
        };
      });

    const matchProduct = lotProducts?.find((i) => i.productId === productId);
    const unitsPerBox = matchProduct?.product?.boxDetails?.units;
    let calculatedTotalBoxes = 0;
    if (lotProducts && unitsPerBox && calculatedWholeUnitsTotal > 0) {
      calculatedTotalBoxes = calculatedWholeUnitsTotal / unitsPerBox;
    }

    return {
      rows: newRows,
      stats: {
        totalUnits: calculatedWholeUnitsTotal,
        totalBoxes: calculatedTotalBoxes,
        matchedProduct: matchProduct?.product || null,
      },
    };
  }, [lotProducts, productId, selectedLot, placesInfo, t]);

  useEffect(() => {
    if (lotProducts) {
      const { rows, stats } = generateRows();
      setRows(rows);
      setTotalUnits(stats.totalUnits);
      setTotalBoxes(stats.totalBoxes);
      setMatchedProduct(stats.matchedProduct);
    }
  }, [lotProducts, placesInfo]);

  return (
    <Box height={400} width="100%">
      <FlexBox mt={2} gap={2} justifyContent={"space-around"}>
        <Text>
          {!productId &&
            !selectedLot &&
            `${t("Grand Total Units:")} ${totalUnits}`}
          {productId &&
            !selectedLot &&
            `${t("Total Units for Product")} ${capitalize(
              matchedProduct?.name || ""
            )}: ${totalUnits}`}
          {!productId &&
            selectedLot &&
            `${t("Total Units for Lot")} ${selectedLot}: ${totalUnits}`}
          {productId &&
            selectedLot &&
            `${t("Total Units for Product")} ${capitalize(
              matchedProduct?.name || ""
            )} ${t("in Lot")} ${selectedLot}: ${totalUnits}`}
        </Text>
        <Text>
          {t("Total Boxes:")} {totalBoxes.toFixed(0)}
        </Text>
      </FlexBox>
      <AppThemeProvider>
        <DataGrid
          localeText={dataGridLocaleText}
          slotProps={{
            toolbar: {
              csvOptions: {
                fileName: `stock-${new Date().toISOString()}.csv`,
                utf8WithBom: true,
              },
              contentEditable: false,
            },
          }}
          slots={{
            toolbar: GridToolbar, // Add this line to enable the toolbar
            noRowsOverlay: () => (
              <FlexBox
                sx={{
                  width: "100%",
                  height: "100%",
                  alignContent: "center",
                  justifyContent: "center",
                }}
              >
                {productId || selectedLot ? (
                  <Text>
                    {t(
                      "There is no stock for this product or lot, try another search"
                    )}
                  </Text>
                ) : (
                  <Text>
                    {t(
                      "Start by searching for a product or lot on the top right corner"
                    )}
                  </Text>
                )}
              </FlexBox>
            ),
          }}
          rows={rows}
          columns={columns}
          rowCount={rows?.length}
          loading={isLoading}
        />
      </AppThemeProvider>
    </Box>
  );
};

function CustomNoRowsOverlay() {
  return (
    <Box>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        width={96}
        viewBox="0 0 452 257"
        aria-hidden
        focusable="false"
      >
        <path
          className="no-rows-primary"
          d="M348 69c-46.392 0-84 37.608-84 84s37.608 84 84 84 84-37.608 84-84-37.608-84-84-84Zm-104 84c0-57.438 46.562-104 104-104s104 46.562 104 104-46.562 104-104 104-104-46.562-104-104Z"
        />
        <path
          className="no-rows-primary"
          d="M308.929 113.929c3.905-3.905 10.237-3.905 14.142 0l63.64 63.64c3.905 3.905 3.905 10.236 0 14.142-3.906 3.905-10.237 3.905-14.142 0l-63.64-63.64c-3.905-3.905-3.905-10.237 0-14.142Z"
        />
        <path
          className="no-rows-primary"
          d="M308.929 191.711c-3.905-3.906-3.905-10.237 0-14.142l63.64-63.64c3.905-3.905 10.236-3.905 14.142 0 3.905 3.905 3.905 10.237 0 14.142l-63.64 63.64c-3.905 3.905-10.237 3.905-14.142 0Z"
        />
        <path
          className="no-rows-secondary"
          d="M0 10C0 4.477 4.477 0 10 0h380c5.523 0 10 4.477 10 10s-4.477 10-10 10H10C4.477 20 0 15.523 0 10ZM0 59c0-5.523 4.477-10 10-10h231c5.523 0 10 4.477 10 10s-4.477 10-10 10H10C4.477 69 0 64.523 0 59ZM0 106c0-5.523 4.477-10 10-10h203c5.523 0 10 4.477 10 10s-4.477 10-10 10H10c-5.523 0-10-4.477-10-10ZM0 153c0-5.523 4.477-10 10-10h195.5c5.523 0 10 4.477 10 10s-4.477 10-10 10H10c-5.523 0-10-4.477-10-10ZM0 200c0-5.523 4.477-10 10-10h203c5.523 0 10 4.477 10 10s-4.477 10-10 10H10c-5.523 0-10-4.477-10-10ZM0 247c0-5.523 4.477-10 10-10h231c5.523 0 10 4.477 10 10s-4.477 10-10 10H10c-5.523 0-10-4.477-10-10Z"
        />
      </svg>
      <Box sx={{ mt: 2 }}>No rows</Box>
    </Box>
  );
}
