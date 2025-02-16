import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Box, IconButton, Button } from "@chakra-ui/react";
import {
  SearchIcon,
  DeleteIcon,
  EditIcon,
  TimeIcon,
  AddIcon,
} from "@chakra-ui/icons";
import { EmptyStateResult } from "shared/Result";
import { AppThemeProvider } from "theme/materialTheme";
import { useRedirect, useTranslate } from "utils";
import { useLots, ILot } from "../infraestructure";

interface IProps {
  lots: ILot[];
  pageSize?: number;
}

const LotsList = ({ lots }: IProps) => {
  const redirect = useRedirect();
  const { removeLotMutation, isLoadingRemoveLot } = useLots();
  const { t } = useTranslate();

  if (lots.length === 0) {
    return <EmptyStateResult />;
  }

  const columns: GridColDef[] = [
    {
      field: "actions",
      headerName: t("Actions"),
      width: 100,
      renderCell: (params: GridRenderCellParams<ILot>) => (
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
            onClick={() => redirect(`/lots/${params.row.id}`)}
          />
          <IconButton
            aria-label="Edit Lot"
            icon={<EditIcon />}
            onClick={() => redirect(`/lots/edit/${params.row.id}`)}
          />
          {!isLoadingRemoveLot ? (
            <IconButton
              aria-label="Remove Lot"
              icon={<DeleteIcon />}
              onClick={() => removeLotMutation(params.row.id || "")}
            />
          ) : (
            <IconButton
              aria-label="Remove Lot"
              icon={<TimeIcon />}
              onClick={() => removeLotMutation(params.row.id || "")}
            />
          )}
        </Box>
      ),
    },
    { field: "name", headerName: "Name", width: 150 },
    { field: "entryDate", headerName: "Entry Date", width: 150 },
    { field: "departureDate", headerName: "Departure Date", width: 150 },
    { field: "movementHistory", headerName: "Movement History", width: 200 },
  ];

  const rows = lots.map((lot) => ({
    id: lot.id,
    name: lot.name,
    entryDate: lot.entryDate,
    departureDate: lot.departureDate,
    movementHistory: lot.movementHistory,
  }));

  if (lots.length === 0) {
    return <EmptyStateResult />;
  }

  return (
    <Box height={400} width="100%">
      <AppThemeProvider>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="teal"
          onClick={() => redirect("/lots/create")}
          mb={4}
        >
          {t("Create New Lot")}
        </Button>
        <DataGrid rows={rows} columns={columns} rowCount={lots?.length} />
      </AppThemeProvider>
    </Box>
  );
};

export { LotsList };
