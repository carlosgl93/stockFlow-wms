import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Box, IconButton } from "@chakra-ui/react";
import { SearchIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { EmptyStateResult } from "shared/Result";
import { IProduct } from "../types";
import { Logger } from "utils/logger";
import { AppThemeProvider } from "theme/materialTheme";
import { useRedirect } from "utils";

interface IProps {
  products: IProduct[];
  pageSize?: number;
  onRemove?: (id: string) => void;
}

const ProductsList = ({ products, pageSize, onRemove }: IProps) => {
  const redirect = useRedirect();

  if (products.length === 0) {
    return <EmptyStateResult />;
  }

  Logger.info("products", [products]);

  const columns: GridColDef[] = [
    {
      field: "actions",
      headerName: "",
      width: 150,
      renderCell: (params: GridRenderCellParams<IProduct>) => (
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
            onClick={() => redirect(`/products/${params.row.id}`)}
          />
          <IconButton
            aria-label="Edit Product"
            icon={<EditIcon />}
            onClick={() => redirect(`/products/edit/${params.row.id}`)}
          />
          {onRemove && (
            <IconButton
              aria-label="Remove Product"
              icon={<DeleteIcon />}
              onClick={() => onRemove(params.row.id || "")}
            />
          )}
        </Box>
      ),
    },
    { field: "name", headerName: "Name", width: 150 },
    { field: "category", headerName: "Category", width: 150 },
    { field: "type", headerName: "Type", width: 150 },
    { field: "units", headerName: "Units", width: 100 },
    { field: "quantity", headerName: "Quantity", width: 100 },
    { field: "unitsPerSurface", headerName: "Units per Surface", width: 150 },
    {
      field: "container",
      headerName: "Container",
      width: 150,
    },
  ];

  const rows = products.map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category,
    type: product.boxDetails?.type,
    units: product.boxDetails?.units,
    quantity: product.boxDetails?.quantity,
    unitsPerSurface: product.boxDetails?.unitsPerSurface,
    container: product.boxDetails?.container,
  }));

  return (
    <Box height={400} width="100%">
      <AppThemeProvider>
        <DataGrid rows={rows} columns={columns} rowCount={products?.length} />
      </AppThemeProvider>
    </Box>
  );
};

export { ProductsList };
