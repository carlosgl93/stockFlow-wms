import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Button } from "@chakra-ui/react";
import { useHistoricMovements } from "../infraestructure/useHistoricMovements";
import { useEffect, useState } from "react";
import { AppThemeProvider } from "theme/materialTheme";
import { IHistoricMovement } from "../infraestructure";
import { capitalize, useTranslate } from "utils";
import dayjs from "dayjs";
import { IProductEntry } from "modules/entries/types";
import * as XLSX from "xlsx";

const exportToExcel = (data: IHistoricMovement[]) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Historic Movements");
  XLSX.writeFile(workbook, "HistoricMovements.xlsx");
};

type HistoricMovementsListProps = {
  productId: string | null;
  type: "entry" | "dispatch" | null;
};

export const HistoricMovementsList = ({
  productId,
  type,
}: HistoricMovementsListProps) => {
  const { historicMovements, isLoading } = useHistoricMovements(
    productId,
    type
  );
  const [rows, setRows] = useState<IHistoricMovement[]>([]);
  const { t } = useTranslate();

  useEffect(() => {
    if (historicMovements) {
      setRows(historicMovements);
    }
  }, [historicMovements]);

  const columns: GridColDef[] = [
    // { field: "id", headerName: "ID", width: 200 },
    {
      field: "type",
      headerName: t("Type"),
      width: 150,
      renderCell: (params) => {
        return <Box>{capitalize(t(params.row.type))}</Box>;
      },
    },
    {
      field: "docNumber",
      headerName: t("Document Number"),
      width: 150,
      renderCell: (params) => {
        return <Box>{capitalize(t(params.row.docNumber))}</Box>;
      },
    },
    {
      field: "description",
      headerName: t("Description"),
      width: 350,
      renderCell: (params) => {
        return <Box>{capitalize(params.row.description)}</Box>;
      },
    },
    {
      field: "totalUnits",
      headerName: t("Total Units"),
      width: 150,
      renderCell: (params) => {
        if (params.row.productsToEnter) {
          return (
            <Box>
              {params.row.productsToEnter?.reduce(
                (acc: number, curr: IProductEntry) =>
                  acc + curr.totalUnitsNumber,
                0
              )}
            </Box>
          );
        } else {
          return (
            <Box>
              {params.row.products?.reduce(
                (acc: number, curr: IProductEntry) =>
                  acc + curr.totalUnitsNumber,
                0
              )}
            </Box>
          );
        }
      },
    },

    {
      field: "createdAt",
      headerName: t("Created At"),
      width: 200,
      renderCell: (params) => {
        const date = new Date(params.row.createdAt);
        return <Box>{dayjs(date).format("DD/MM/YYYY")}</Box>;
      },
    },
  ];

  return (
    <Box height={400} width="100%">
      <AppThemeProvider>
        <Button onClick={() => exportToExcel(rows)} mb={4} colorScheme="blue">
          Export to Excel
        </Button>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={isLoading}
          pagination
          //   onPageChange={(params) => fetchNextPage(params.page)}
        />
      </AppThemeProvider>
    </Box>
  );
};
