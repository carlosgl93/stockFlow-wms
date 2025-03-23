import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Box, IconButton } from "@chakra-ui/react";
import { SearchIcon, DeleteIcon, EditIcon, TimeIcon } from "@chakra-ui/icons";
import { EmptyStateResult } from "shared/Result";
import { IDispatch } from "../types";
import { AppThemeProvider } from "theme/materialTheme";
import { useRedirect, useTranslate } from "utils";
import { useDispatches } from "../infraestructure";

interface IProps {
  dispatches: IDispatch[];
  pageSize?: number;
}

export const DispatchesList = ({ dispatches }: IProps) => {
  const redirect = useRedirect();
  const { removeDispatchMutation, isLoadingRemoveDispatch } = useDispatches();
  const { t } = useTranslate();

  if (dispatches?.length === 0) {
    return <EmptyStateResult />;
  }

  const columns: GridColDef[] = [
    {
      field: "actions",
      headerName: t("Actions"),
      width: 100,
      renderCell: (params: GridRenderCellParams<IDispatch>) => (
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
            onClick={() => redirect(`/dispatches/${params.row.id}`)}
          />
          <IconButton
            aria-label="Edit Dispatch"
            icon={<EditIcon />}
            onClick={() => redirect(`/dispatches/edit/${params.row.id}`)}
          />
          {!isLoadingRemoveDispatch ? (
            <IconButton
              aria-label="Remove Dispatch"
              icon={<DeleteIcon />}
              onClick={() => removeDispatchMutation(params.row.id || "")}
            />
          ) : (
            <IconButton
              aria-label="Remove Dispatch"
              icon={<TimeIcon />}
              onClick={() => removeDispatchMutation(params.row.id || "")}
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
    { field: "dispatchDate", headerName: "Dispatch Date", width: 150 },
    { field: "deliveryDate", headerName: "Delivery Date", width: 150 },
    { field: "palletNumber", headerName: "Pallet Number", width: 150 },
    { field: "unitsNumber", headerName: "Units Number", width: 150 },
    { field: "looseUnitsNumber", headerName: "Loose Units Number", width: 150 },
    { field: "totalUnitsNumber", headerName: "Total Units Number", width: 150 },
    { field: "heightCMs", headerName: "Height (CMs)", width: 150 },
    { field: "widthCMs", headerName: "Width (CMs)", width: 150 },
    { field: "description", headerName: "Description", width: 150 },
    { field: "dispatchStatus", headerName: "Dispatch Status", width: 150 },
  ];

  const rows = dispatches?.map((dispatch, i) => ({
    id: dispatch.id,
    docNumber: dispatch.docNumber,
    supplierId: dispatch.supplierId,
    transporterId: dispatch.transporterId,
    productId: dispatch.products[i].id,
    lotId: dispatch.products[i].lotId,
    dispatchDate: dispatch.dispatchDate,
    deliveryDate: dispatch.deliveryDate,
    palletNumber: dispatch.products[i].palletNumber,
    unitsNumber: dispatch.products[i].unitsNumber,
    looseUnitsNumber: dispatch.products[i].looseUnitsNumber,
    totalUnitsNumber: dispatch.products[i].totalUnitsNumber,
    heightCMs: dispatch.products[i].heightCMs,
    widthCMs: dispatch.products[i].widthCMs,
    description: dispatch.products[i].description,
  }));

  return (
    <Box height={400} width="100%">
      <AppThemeProvider>
        <DataGrid rows={rows} columns={columns} rowCount={dispatches?.length} />
      </AppThemeProvider>
    </Box>
  );
};
