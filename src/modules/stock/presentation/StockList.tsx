import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Text } from "@chakra-ui/react";
import { IRenderStock, IStock, ISuppsAndTrans } from "../types";
import { AppThemeProvider } from "theme/materialTheme";
import { capitalize, useTranslate } from "utils";
import { useEffect, useState } from "react";
import { IEntry } from "modules/entries/types";
import { FlexBox } from "shared/Layout";
import { IPlace } from "modules/places/infra";
import { Logger } from "utils/logger";
import { IProduct } from "modules/products/types";
import { ILotProductWithProduct } from "modules/lotProduct/infraestructure/queries";

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
  entries, // This prop might become unused or be used for other purposes
  stock, // This prop might become unused or be used for other purposes
  productId,
  selectedLot,
  suppsAndTrans, // This prop might become unused or be used for other purposes
  placesInfo,
  isLoading,
  stockData,
  lotProducts,
}: IProps) => {
  Logger.info("StockList rendered with props:", {
    entries,
    stock,
    productId,
    selectedLot,
    suppsAndTrans,
    placesInfo,
    isLoading,
    stockData,
    lotProducts,
  });

  const { t } = useTranslate();
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

  const generateRows = (): IRow[] => {
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
        // Ensure quantity is treated as a string for parseFloat
        const quantityString = String(
          item.product?.boxDetails?.quantity || "0"
        );
        const quantityPerUnit = parseFloat(quantityString);
        const totalQuantity = currentTotal * quantityPerUnit;

        return {
          id: item.id!,
          productName: item.product?.name || t("N/A"),
          lotId: item.lotId,
          placeId: placeName,
          totalUnits: `${totalQuantity} ${unitOfMeasure}`,
          unitsNumber: units,
          looseUnitsNumber: looseUnits,
          expirityDate: item.expirationDate || t("N/A"),
        };
      });

    setTotalUnits(calculatedWholeUnitsTotal);
    const matchProduct = lotProducts?.find((i) => i.productId === productId);
    setMatchedProduct(matchProduct?.product || null);
    const unitsPerBox = matchProduct?.product?.boxDetails?.units;
    if (lotProducts && unitsPerBox && calculatedWholeUnitsTotal > 0) {
      setTotalBoxes(calculatedWholeUnitsTotal / unitsPerBox);
    }
    return newRows;
  };

  Logger.info("Generating rows with lotPRoducts:", {
    rows,
  });

  useEffect(() => {
    if (stockData) {
      // Ensure stockData is available
      const newRows = generateRows();
      setRows(newRows);
    }
  }, [stockData, productId, selectedLot, placesInfo, suppsAndTrans]);

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
          slotProps={{
            loadingOverlay: {
              variant: "skeleton",
              noRowsVariant: "skeleton",
            },
          }}
          rows={rows}
          columns={columns}
          rowCount={rows?.length}
          loading={isLoading}
          slots={{
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
