import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Box, IconButton } from "@chakra-ui/react";
import { SearchIcon, DeleteIcon, EditIcon, TimeIcon } from "@chakra-ui/icons";
import { EmptyStateResult } from "shared/Result";
import { IEntry } from "../types";
import { AppThemeProvider } from "theme/materialTheme";
import { useRedirect, useTranslate } from "utils";
import { useEntries } from "../infraestructure";

interface IProps {
  entries: IEntry[];
  pageSize?: number;
}

export const EntriesList = ({ entries }: IProps) => {
  const redirect = useRedirect();
  const { removeEntryMutation, isLoadingRemoveEntry } = useEntries();
  const { t } = useTranslate();

  if (entries.length === 0) {
    return <EmptyStateResult />;
  }

  const columns: GridColDef[] = [
    {
      field: "actions",
      headerName: t("Actions"),
      width: 100,
      renderCell: (params: GridRenderCellParams<IEntry>) => (
        <Box
          display="flex"
          gap={2}
          justifyContent={"center"}
          alignContent={"center"}
          h={"100%"}
        >
          <IconButton
            aria-label="View Details"
            icon={<SearchIcon />}
            onClick={() => redirect(`/entries/${params.row.id}`)}
          />
          <IconButton
            aria-label="Edit Entry"
            icon={<EditIcon />}
            onClick={() => redirect(`/entries/edit/${params.row.id}`)}
          />
          {!isLoadingRemoveEntry ? (
            <IconButton
              aria-label="Remove Entry"
              icon={<DeleteIcon />}
              onClick={() => removeEntryMutation(params.row.id || "")}
            />
          ) : (
            <IconButton
              aria-label="Remove Entry"
              icon={<TimeIcon />}
              onClick={() => removeEntryMutation(params.row.id || "")}
            />
          )}
        </Box>
      ),
    },
    { field: "docNumber", headerName: "Document Number", width: 150 },
    { field: "supplierId", headerName: "Supplier ID", width: 150 },
    { field: "transporterId", headerName: "Transporter ID", width: 150 },
    { field: "productId", headerName: "Product ID", width: 150 },
    { field: "lotId", headerName: "Lot ID", width: 150 },
    { field: "expirityDate", headerName: "Expiry Date", width: 150 },
    { field: "palletNumber", headerName: "Pallet Number", width: 150 },
    { field: "unitsNumber", headerName: "Units Number", width: 150 },
    { field: "looseUnitsNumber", headerName: "Loose Units Number", width: 150 },
    { field: "totalUnitsNumber", headerName: "Total Units Number", width: 150 },
    { field: "heightCMs", headerName: "Height (CMs)", width: 150 },
    { field: "widthCMs", headerName: "Width (CMs)", width: 150 },
    { field: "description", headerName: "Description", width: 150 },
  ];

  const rows = entries.map((entry) => ({
    id: entry.id,
    docNumber: entry.docNumber,
    supplierId: entry.supplierId,
    transporterId: entry.transporterId,
    productId: entry.productId,
    lotId: entry.lotId,
    expirityDate: entry.expirityDate,
    palletNumber: entry.palletNumber,
    unitsNumber: entry.unitsNumber,
    looseUnitsNumber: entry.looseUnitsNumber,
    totalUnitsNumber: entry.totalUnitsNumber,
    heightCMs: entry.heightCMs,
    widthCMs: entry.widthCMs,
    description: entry.description,
  }));

  return (
    <Box height={400} width="100%">
      <AppThemeProvider>
        <DataGrid rows={rows} columns={columns} rowCount={entries?.length} />
      </AppThemeProvider>
    </Box>
  );
};
