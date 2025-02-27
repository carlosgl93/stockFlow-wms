import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Box, IconButton } from "@chakra-ui/react";
import { SearchIcon, DeleteIcon, EditIcon, TimeIcon } from "@chakra-ui/icons";
import { EmptyStateResult } from "shared/Result";
import { IRenderStock, IStock, ISuppsAndTrans } from "../types";
import { AppThemeProvider } from "theme/materialTheme";
import { dateVO, useRedirect, useTranslate } from "utils";
import { useStock } from "../infraestructure";
import { useEffect, useState } from "react";
import { useProducts } from "modules/products/infrastructure";
import { useLots } from "modules/lots/infraestructure";
import { IEntry } from "modules/entries/types";
import { Logger } from "utils/logger";

interface IProps {
  stock: IEntry[];
  productId: string;
  selectedLot: string;
  suppsAndTrans: ISuppsAndTrans;
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
  stock,
  productId,
  selectedLot,
  suppsAndTrans,
}: IProps) => {
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

  const redirect = useRedirect();
  const { removeStockMutation, isLoadingRemoveStock } = useStock();
  const { t } = useTranslate();
  const { products, isFetching } = useProducts();
  const { getLotsData, isLoadingGetLots } = useLots();
  const [productNames, setProductNames] = useState<{ [key: string]: string }>(
    {}
  );
  const [lotNames, setLotNames] = useState<{ [key: string]: string }>({});
  const [totalUnits, setTotalUnits] = useState<number>(0);

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
    { field: "expiryDate", headerName: t("Expiry Date"), width: 150 },
    { field: "documentType", headerName: t("Document Type"), width: 150 },
    { field: "supplier", headerName: t("Supplier"), width: 150 },
    { field: "transporter", headerName: t("Transporter"), width: 150 },
    { field: "palletNumber", headerName: t("Pallet Number"), width: 150 },
    { field: "unitsNumber", headerName: t("Units Number"), width: 150 },
    {
      field: "looseUnitsNumber",
      headerName: t("Loose Units Number"),
      width: 150,
    },
  ];

  const [rows, setRows] = useState<IRow[]>([]);

  const generateRows = (): IRow[] => {
    let total = 0;
    const rows = selectedLot
      ? stock
          .filter((i) =>
            i.productsToEnter.find(
              (p) => p.id === productId && p.lotId === selectedLot
            )
          )
          .map((item) => {
            Logger.info("item", { item });
            const product = item.productsToEnter[0];
            total += product?.totalUnitsNumber || 0;
            const suppAndTransData = suppsAndTrans.find(
              (s) => s.entryId === item.id
            );
            return {
              id: item.id!,
              docNumber: item.docNumber,
              lotId: product?.lotId,
              expiryDate: product?.expirityDate,
              // documentType: item.docType,
              supplier: suppAndTransData?.supplier.company || "",
              transporter: suppAndTransData?.transporter.name || "",
              palletNumber: product?.palletNumber,
              unitsNumber: product?.unitsNumber,
              looseUnitsNumber: product?.looseUnitsNumber,
            };
          })
      : stock.map((item) => {
          const product = item.productsToEnter.find((p) => p.id === productId);
          total += product?.totalUnitsNumber || 0;
          const suppAndTransData = suppsAndTrans.find(
            (s) => s.entryId === item.id
          );
          return {
            id: item.id!,
            docNumber: item.docNumber,
            lotId: product?.lotId,
            expiryDate: product?.expirityDate,
            // documentType: item.docType,
            supplier: suppAndTransData?.supplier.company || "",
            transporter: suppAndTransData?.transporter.name || "",
            palletNumber: product?.palletNumber,
            unitsNumber: product?.unitsNumber,
            looseUnitsNumber: product?.looseUnitsNumber,
          };
        });
    setTotalUnits(total);
    return rows;
  };

  useEffect(() => {
    const rows = generateRows();
    setRows(rows);
  }, [stock, selectedLot, productId]);

  if (rows.length === 0) {
    return <EmptyStateResult />;
  }

  return (
    <Box height={400} width="100%">
      <Box mt={2}>
        {t("Total Units:")} {totalUnits}
      </Box>
      <AppThemeProvider>
        <DataGrid
          loading={isFetching || isLoadingGetLots}
          rows={rows}
          columns={columns}
          rowCount={stock?.length}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
        />
      </AppThemeProvider>
    </Box>
  );
};
