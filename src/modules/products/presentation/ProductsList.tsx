import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Box, CircularProgress, IconButton } from "@chakra-ui/react";
import { SearchIcon, DeleteIcon, EditIcon, TimeIcon } from "@chakra-ui/icons";
import { EmptyStateResult } from "shared/Result";
import { IProduct } from "../types";
import { AppThemeProvider } from "theme/materialTheme";
import { capitalize, useRedirect, useTranslate } from "utils";
import { useCRUDProducts } from "../infrastructure/useCRUDProducts";

interface IProps {
  products: IProduct[];
  pageSize?: number;
}

const ProductsList = ({ products }: IProps) => {
  const redirect = useRedirect();
  const { removeProductMutation, isLoadingRemoveProduct } = useCRUDProducts();
  const { t } = useTranslate();

  if (products.length === 0) {
    return <EmptyStateResult />;
  }

  const columns: GridColDef[] = [
    {
      field: "actions",
      headerName: t("Actions"),
      width: 100,

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
          {!isLoadingRemoveProduct ? (
            <IconButton
              aria-label="Remove Product"
              icon={<DeleteIcon />}
              onClick={() => removeProductMutation(params.row.id || "")}
            />
          ) : (
            <IconButton
              aria-label="Remove Product"
              icon={<TimeIcon />}
              onClick={() => removeProductMutation(params.row.id || "")}
            />
          )}
        </Box>
      ),
    },
    { field: "extCode", headerName: t("Codigo Ext"), width: 100 },
    { field: "intCode", headerName: t("Codigo Int"), width: 100 },
    { field: "name", headerName: t("Name"), width: 150 },
    { field: "boxType", headerName: t("Box / Unit"), width: 100 },
    { field: "units", headerName: t("Units"), width: 100 },
    {
      field: "container",
      headerName: t("Container"),
      width: 100,
    },
    { field: "type", headerName: t("Type"), width: 100 },
    { field: "quantity", headerName: t("Quantity"), width: 100 },
    { field: "category", headerName: t("Category"), width: 100 },
  ];

  const rows = products.map((product) => ({
    id: product.id,
    extCode: product.extCode,
    intCode: product.internalCode,
    name: product.name,
    boxType: capitalize(t(product.selectionType)),
    category: t(product.category),
    type: t(product.boxDetails?.type || ""),
    units: product.selectionType === "box" ? product.boxDetails?.units : 1,
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
