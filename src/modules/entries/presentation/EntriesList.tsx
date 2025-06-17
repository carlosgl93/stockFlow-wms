import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Box } from "@chakra-ui/react";
import { EmptyStateResult } from "shared/Result";
import { AppThemeProvider } from "theme/materialTheme";
import { EntriesListController } from "../infraestructure";
import { ConfirmationModal } from "shared/ConfirmationModal"; // Added import

export const EntriesList = () => {
  const {
    columns,
    rows,
    isModalOpen,
    isLoadingGetEntries,
    isLoadingRemoveEntry,
    dataGridLocaleText,
    t,
    handleClose,
    handleConfirmRemove,
  } = EntriesListController();

  if (rows?.length === 0) {
    return <EmptyStateResult />;
  }

  return (
    <Box height={400} width="100%">
      <AppThemeProvider>
        <DataGrid
          rows={rows}
          columns={columns}
          rowCount={5}
          paginationMode="client"
          slots={{ toolbar: GridToolbar }}
          loading={isLoadingGetEntries || isLoadingRemoveEntry}
          slotProps={{
            toolbar: {
              csvOptions: {
                fileName: `ingresos-${new Date().toISOString()}.csv`,
                utf8WithBom: true,
              },
              contentEditable: false,
              showQuickFilter: true,
              quickFilterProps: {
                debounceMs: 500,
                placeholder: t("Search by date, doc number or produt name..."),
                sx: { width: "400px" },
              },
            },
          }}
          localeText={dataGridLocaleText}
          disableColumnFilter
          disableColumnSelector
          disableDensitySelector
        />
      </AppThemeProvider>
      <ConfirmationModal
        description={t("Are you sure you want to delete this entry?")}
        isOpen={isModalOpen}
        onClose={handleClose}
        onConfirm={handleConfirmRemove}
        title={t("Delete Entry")}
      />
    </Box>
  );
};
