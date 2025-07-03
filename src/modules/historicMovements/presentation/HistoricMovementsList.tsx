import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Button } from "@chakra-ui/react";
import { useHistoricMovements } from "../infraestructure/useHistoricMovements";
import { useEffect, useState } from "react";
import { AppThemeProvider } from "theme/materialTheme";
import { IHistoricMovement } from "../infraestructure";
import { capitalize, useTranslate } from "utils";
import dayjs from "dayjs";
import { IEntry, IProductEntry } from "modules/entries/types";
import * as XLSX from "xlsx";
import { IDispatch } from "modules/dispatches/types";

const exportToExcel = (data: IHistoricMovement[], columns: GridColDef[]) => {
  const formattedData = data.map((row) => {
    const formattedRow: Record<
      string,
      string | number | Array<IEntry | IDispatch>
    > = {};
    columns.forEach((column) => {
      if (column.field && column.headerName) {
        formattedRow[column.headerName] = row[column.field];
      }
    });
    return formattedRow;
  });

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
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
        return <Box>{capitalize(t(params.row.type || ""))}</Box>;
      },
    },
    {
      field: "operationType",
      headerName: t("Operation"),
      width: 120,
      renderCell: (params) => {
        const operationType: "create" | "update" | "delete" =
          params.row.operationType || "create";
        const colorMap = {
          create: "green.500",
          update: "blue.500",
          delete: "red.500",
        };
        return (
          <Box color={colorMap[operationType] || "gray.500"}>
            {capitalize(t(operationType))}
          </Box>
        );
      },
    },
    {
      field: "docNumber",
      headerName: t("Document Number"),
      width: 150,
      renderCell: (params) => {
        return <Box>{capitalize(t(params.row.docNumber || ""))}</Box>;
      },
    },
    {
      field: "description",
      headerName: t("Description"),
      width: 350,
      renderCell: (params) => {
        return <Box>{capitalize(params.row.description || "")}</Box>;
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
        <Button
          onClick={() => exportToExcel(rows, columns)}
          mb={4}
          colorScheme="blue"
        >
          Export to Excel
        </Button>
        <DataGrid
          autoPageSize
          rows={rows}
          columns={columns}
          loading={isLoading}
        />
      </AppThemeProvider>
    </Box>
  );
};
