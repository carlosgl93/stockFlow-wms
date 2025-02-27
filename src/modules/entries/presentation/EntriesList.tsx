import { DataGrid } from "@mui/x-data-grid";
import { Box } from "@chakra-ui/react";
import { EmptyStateResult } from "shared/Result";
import { AppThemeProvider } from "theme/materialTheme";
import { EntriesListController } from "../infraestructure";

export const EntriesList = () => {
  const { columns, rows } = EntriesListController();

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
    </Box>
  );
};
