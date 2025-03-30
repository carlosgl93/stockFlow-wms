import { DataGrid } from "@mui/x-data-grid";
import { Box } from "@chakra-ui/react";
import { EmptyStateResult } from "shared/Result";
import { AppThemeProvider } from "theme/materialTheme";
import { EntriesListController } from "../infraestructure";
import { ConfirmationModal } from "shared/ConfirmationModal"; // Added import

export const EntriesList = () => {
  const { columns, rows, t, isModalOpen, handleClose, handleConfirmRemove } =
    EntriesListController(); // Include modal

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
