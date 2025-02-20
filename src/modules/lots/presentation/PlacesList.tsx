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
import { usePlaces, IPlace } from "../infraestructure";

interface IProps {
  places: IPlace[];
  pageSize?: number;
}

const PlacesList = ({ places }: IProps) => {
  const redirect = useRedirect();
  const { removePlaceMutation, isLoadingRemovePlace } = usePlaces();
  const { t } = useTranslate();

  if (places.length === 0) {
    return <EmptyStateResult />;
  }

  const columns: GridColDef[] = [
    {
      field: "actions",
      headerName: t("Actions"),
      width: 100,
      renderCell: (params: GridRenderCellParams<IPlace>) => (
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
            onClick={() => redirect(`/places/${params.row.id}`)}
          />
          <IconButton
            aria-label="Edit Place"
            icon={<EditIcon />}
            onClick={() => redirect(`/places/edit/${params.row.id}`)}
          />
          {!isLoadingRemovePlace ? (
            <IconButton
              aria-label="Remove Place"
              icon={<DeleteIcon />}
              onClick={() => removePlaceMutation(params.row.id || "")}
            />
          ) : (
            <IconButton
              aria-label="Remove Place"
              icon={<TimeIcon />}
              onClick={() => removePlaceMutation(params.row.id || "")}
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

  const rows = places.map((place) => ({
    id: place.id,
    name: place.name,
    entryDate: place.entryDate,
    departureDate: place.departureDate,
    movementHistory: place.movementHistory,
  }));

  if (places.length === 0) {
    return <EmptyStateResult />;
  }

  return (
    <Box height={400} width="100%">
      <AppThemeProvider>
        <DataGrid rows={rows} columns={columns} rowCount={places?.length} />
      </AppThemeProvider>
    </Box>
  );
};

export { PlacesList };
