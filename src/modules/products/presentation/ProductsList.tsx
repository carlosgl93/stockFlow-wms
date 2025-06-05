import { IProduct } from "../types";
import { EmptyStateResult } from "shared/Result";
import { Box, CircularProgress, IconButton } from "@chakra-ui/react";
import { AppThemeProvider } from "theme/materialTheme";
import { capitalize, useRedirect, useTranslate } from "utils";
import { useCRUDProducts } from "../infrastructure/useCRUDProducts";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { SearchIcon, DeleteIcon, EditIcon, TimeIcon } from "@chakra-ui/icons";
import { ExcelProductType } from "../types/IProduct";

interface IProps {
  products: IProduct[];
  isLoading?: boolean;
  isPreview?: boolean;
}

const ProductsList = ({ products, isPreview, isLoading }: IProps) => {
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
          {/* <IconButton
            aria-label="View Details"
            icon={<SearchIcon />}
            onClick={() => redirect(`/products/${params.row.id}`)}
          /> */}
          <IconButton
            aria-label="Edit Product"
            icon={<EditIcon />}
            onClick={() =>
              redirect(`/products/edit/${params.row.id}`, {
                product: params.row,
              })
            }
          />
          {!isLoadingRemoveProduct ? (
            <IconButton
              aria-label="Remove Product"
              icon={<DeleteIcon />}
              onClick={() => removeProductMutation(params.row.id || "")}
            />
          ) : (
            <CircularProgress size={"small"} />
          )}
        </Box>
      ),
    },
    { field: "extCode", headerName: t("Codigo Ext"), width: 100 },
    { field: "name", headerName: t("Name"), width: 200 },
    // {
    //   field: "warehouseStock",
    //   headerName: t("Warehouse Stock"),
    //   width: 150,
    //   renderCell: (params) => {
    //     return params.row.warehouseStock || 0;
    //   },
    // },
    // { field: "boxType", headerName: t("Box / Unit"), width: 100 },
    { field: "riskCategory", headerName: t("Risk"), width: 100 },
    { field: "category", headerName: t("Category"), width: 100 },
    { field: "unitOfMeasure", headerName: t("U. Of Measure"), width: 125 },
    { field: "quantity", headerName: t("Quantity Per Unit"), width: 125 },

    {
      field: "container",
      headerName: t("Container"),
      width: 100,
    },
    { field: "type", headerName: t("Type"), width: 100 },
    { field: "unitsPerBox", headerName: t("Units Per Box"), width: 100 },
  ];

  const rows = products.map((product, i) => ({
    id: product.id || i.toString(),
    extCode: product.extCode,
    intCode: product.internalCode,
    name: capitalize(product.name),
    warehouseStock: isPreview
      ? // @ts-ignore
        (product as ExcelProductType).warehouseStock
      : 0,
    riskCategory: capitalize(t(product.riskCategory || "")),
    unitOfMeasure: capitalize(t(product.boxDetails?.unitOfMeasure || "")),
    boxType: capitalize(t(product.selectionType || "")),
    category: capitalize(t(product.category || "")),
    type: t(product.boxDetails?.type || ""),
    unitsPerBox: product.boxDetails?.units,
    quantity: `${product.boxDetails?.quantity} ${t(
      product.boxDetails?.unitOfMeasure || ""
    )}${(product.boxDetails?.quantity || 0) > 1 ? "s" : ""}
    `,
    unitsPerSurface: product.boxDetails?.unitsPerSurface,
    container: product.boxDetails?.container,
  }));

  return (
    <Box width="100%">
      {isPreview && (
        <Box
          bgColor={"orange.400"}
          p={2}
          mb={4}
          display="flex"
          justifyContent={"center"}
        >
          <Box fontSize={"lg"} fontWeight={"bold"}>
            {t("Preview from Excel")}
          </Box>
        </Box>
      )}
      <AppThemeProvider>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSizeOptions={[5, 10, 25, 50, 100]}
          loading={isLoading}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
                page: 0,
              },
            },
          }}
        />
      </AppThemeProvider>
    </Box>
  );
};

export { ProductsList };
