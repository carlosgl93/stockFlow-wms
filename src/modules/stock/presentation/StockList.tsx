import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Text } from "@chakra-ui/react";
import { IStock, ISuppsAndTrans } from "../types";
import { AppThemeProvider } from "theme/materialTheme";
import { useRedirect, useTranslate } from "utils";
import { useStock } from "../infraestructure";
import { useEffect, useState } from "react";
import { useProducts } from "modules/products/infrastructure";
import { useLots } from "modules/lots/infraestructure";
import { IEntry } from "modules/entries/types";
import { FlexBox } from "shared/Layout";
import { IPlace } from "modules/places/infra";

interface IProps {
  entries: IEntry[];
  stock: IStock[];
  productId: string;
  selectedLot: string;
  suppsAndTrans: ISuppsAndTrans;
  placesInfo: IPlace[];
}

interface IRow {
  id: string;
  docNumber: string;
  lotId: string | undefined;
  expiryDate: string | undefined;
  supplier: string;
  transporter: string;
  palletNumber: string | undefined;
  unitsNumber: number | undefined;
  looseUnitsNumber: number | undefined;
}

export const StockList = ({
  entries,
  stock,
  productId,
  selectedLot,
  suppsAndTrans,
  placesInfo,
}: IProps) => {
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

  const { removeStockMutation, isLoadingRemoveStock } = useStock();
  const { t } = useTranslate();
  const { products, isFetching } = useProducts();
  const { getLotsData, isLoadingGetLots } = useLots({
    productId,
    pageSize: 10,
  });
  const [productNames, setProductNames] = useState<{ [key: string]: string }>(
    {}
  );
  const [lotNames, setLotNames] = useState<{ [key: string]: string }>({});
  const [totalUnits, setTotalUnits] = useState<number>(0);
  const [wholeUnitsTotal, setWholeUnitsTotal] = useState<number>(0);
  const [looseUnitsTotal, setLooseUnitsTotal] = useState<number>(0);

  const columns: GridColDef[] = [
    // {
    //   field: "actions",
    //   headerName: t("Actions"),
    //   width: 100,
    //   renderCell: (params: GridRenderCellParams<IStock>) => (
    //     <Box
    //       display="flex"
    //       gap={2}
    //       justifyContent={"center"}
    //       alignContent={"center"}
    //       h={"100%"}
    //     >
    //       <IconButton
    //         aria-label="Edit Stock"
    //         icon={<EditIcon />}
    //         onClick={() => redirect(`/stock/edit/${params.row.id}`)}
    //       />
    //       {!isLoadingRemoveStock ? (
    //         <IconButton
    //           aria-label="Remove Stock"
    //           icon={<DeleteIcon />}
    //           onClick={() => removeStockMutation(params.row.id || "")}
    //         />
    //       ) : (
    //         <IconButton
    //           aria-label="Remove Stock"
    //           icon={<TimeIcon />}
    //           onClick={() => removeStockMutation(params.row.id || "")}
    //         />
    //       )}
    //     </Box>
    //   ),
    // },
    { field: "docNumber", headerName: t("Doc Number"), width: 150 },
    { field: "lotId", headerName: t("Lot"), width: 150 },
    { field: "palletNumber", headerName: t("Pallet Number"), width: 150 },
    { field: "placeId", headerName: t("Place"), width: 150 },

    { field: "unitsNumber", headerName: t("Units Number"), width: 150 },
    {
      field: "looseUnitsNumber",
      headerName: t("Loose Units Number"),
      width: 150,
    },
    { field: "expiryDate", headerName: t("Expiry Date"), width: 150 },
    { field: "documentType", headerName: t("Document Type"), width: 150 },
    { field: "supplier", headerName: t("Supplier"), width: 150 },
    { field: "transporter", headerName: t("Transporter"), width: 150 },
  ];

  const [rows, setRows] = useState<IRow[]>([]);

  const generateRows = (): IRow[] => {
    let total = 0;
    let wholeUnitsTotal = 0;
    let looseUnitsTotal = 0;
    const rows = entries
      .filter((entry) =>
        entry.productsToEnter.some(
          (product) =>
            (!productId || product.id === productId) &&
            (!selectedLot || product.lotId === selectedLot)
        )
      )
      .map((entry) => {
        const product = entry.productsToEnter.find(
          (product) =>
            (!productId || product.id === productId) &&
            (!selectedLot || product.lotId === selectedLot)
        );
        total += product?.totalUnitsNumber || 0;
        wholeUnitsTotal += product?.unitsNumber || 0;
        looseUnitsTotal += product?.looseUnitsNumber || 0;
        const suppAndTransData = suppsAndTrans.find(
          (s) => s.entryId === entry.id
        );
        return {
          id: entry.id!,
          docNumber: entry.docNumber,
          lotId: product?.lotId,
          placeId: placesInfo.find((place) => place.id === product?.placeId)
            ?.name,
          expiryDate: product?.expirityDate,
          supplier: suppAndTransData?.supplier.company || "",
          transporter: suppAndTransData?.transporter.name || "",
          palletNumber: product?.palletNumber,
          unitsNumber: product?.unitsNumber,
          looseUnitsNumber: product?.looseUnitsNumber,
        };
      });
    setTotalUnits(total);
    setWholeUnitsTotal(wholeUnitsTotal);
    setLooseUnitsTotal(looseUnitsTotal);
    return rows;
  };

  useEffect(() => {
    const rows = generateRows();
    setRows(rows);
  }, [entries, stock, selectedLot, productId, suppsAndTrans]);

  return (
    <Box height={400} width="100%">
      <FlexBox mt={2} gap={2} justifyContent={"space-around"}>
        <Text>
          {t("Total Units:")} {totalUnits}
        </Text>
        <Text>
          {t("Whole Units:")} {wholeUnitsTotal}
        </Text>
        <Text>
          {t("Loose Units:")} {looseUnitsTotal}
        </Text>
      </FlexBox>
      <AppThemeProvider>
        <DataGrid
          loading={isFetching || isLoadingGetLots}
          slotProps={{
            loadingOverlay: {
              variant: "skeleton",
              noRowsVariant: "skeleton",
            },
          }}
          rows={rows}
          columns={columns}
          rowCount={rows.length}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
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
