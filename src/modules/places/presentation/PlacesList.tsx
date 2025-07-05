import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridToolbar,
} from "@mui/x-data-grid";
import { Box, CircularProgress, IconButton, Tooltip } from "@chakra-ui/react";
import { DeleteIcon, EditIcon, TimeIcon } from "@chakra-ui/icons";
import { EmptyStateResult } from "shared/Result";
import { AppThemeProvider } from "theme/materialTheme";
import { useRedirect, useTranslate } from "utils";
import { IPlace, usePlaces } from "../infra";
import { commonTooltipStyles } from "../../products/presentation/ProductsList";

interface IProps {
  places: IPlace[];
  isLoadingGetPlaces: boolean;
}

const PlacesList = ({ places, isLoadingGetPlaces }: IProps) => {
  const redirect = useRedirect();
  const { removePlaceMutation, isLoadingRemovePlace } = usePlaces();
  const { t, dataGridLocaleText } = useTranslate();

  if (isLoadingGetPlaces) {
    return <CircularProgress />;
  }

  if (places?.length === 0) {
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
          <Tooltip
            label={t("Edit Place")}
            placement="left"
            hasArrow
            sx={{
              bgColor: "blue.500",
              ...commonTooltipStyles,
            }}
          >
            <IconButton
              aria-label="Edit Place"
              icon={<EditIcon />}
              onClick={() => redirect(`/places/edit/${params.row.id}`)}
              sx={{
                fontSize: "1.2rem",
                p: 2,
              }}
            />
          </Tooltip>
          {!isLoadingRemovePlace ? (
            <Tooltip
              label={t("Remove Entry")}
              placement="left"
              hasArrow
              sx={{
                bgColor: "red.500",
                ...commonTooltipStyles,
              }}
            >
              <IconButton
                aria-label="Remove Place"
                icon={<DeleteIcon />}
                onClick={() => removePlaceMutation(params.row.id || "")}
                sx={{
                  fontSize: "1.2rem",
                  p: 2,
                }}
              />
            </Tooltip>
          ) : (
            <IconButton
              aria-label="Remove Place"
              icon={<TimeIcon />}
              // onClick={() => removePlaceMutation(params.row.id || "")}
              sx={{
                fontSize: "1.2rem",
                p: 2,
              }}
            />
          )}
        </Box>
      ),
    },
    { field: "name", headerName: t("Name"), width: 150 },
  ];

  const rows = places
    ?.map((place) => ({
      id: place.id,
      name: place.name,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (places?.length === 0) {
    return <EmptyStateResult />;
  }

  return (
    <Box height={"100%"} width="100%">
      <AppThemeProvider>
        <DataGrid
          rows={rows}
          columns={columns}
          rowCount={places?.length}
          slots={{ toolbar: GridToolbar }}
          loading={isLoadingRemovePlace}
          slotProps={{
            toolbar: {
              csvOptions: {
                fileName: `lugares-${new Date().toISOString()}.csv`,
                utf8WithBom: true,
              },
              contentEditable: false,
              showQuickFilter: true,
              quickFilterProps: {
                debounceMs: 500,
                placeholder: t("Search by place name..."),
                sx: { width: "400px" },
              },
            },
          }}
          sx={{
            height: "100%",
            width: "100%",
          }}
          localeText={dataGridLocaleText}
          disableColumnFilter
          disableColumnSelector
          disableDensitySelector
        />
      </AppThemeProvider>
    </Box>
  );
};

export { PlacesList };
