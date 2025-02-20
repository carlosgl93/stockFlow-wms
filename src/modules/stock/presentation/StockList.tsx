import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Box, IconButton } from "@chakra-ui/react";
import { SearchIcon, DeleteIcon, EditIcon, TimeIcon } from "@chakra-ui/icons";
import { EmptyStateResult } from "shared/Result";
import { IStock } from "../types";
import { AppThemeProvider } from "theme/materialTheme";
import { useRedirect, useTranslate } from "utils";
import { useStock } from "../infraestructure";
import { useEffect, useState } from "react";
import { useProducts } from "modules/products/infrastructure";
import { useLots } from "modules/lots/infraestructure";

interface IProps {
  stock: IStock[];
}

export const StockList = ({ stock }: IProps) => {
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 25,
    page: 0,
  });

  const redirect = useRedirect();
  const { removeStockMutation, isLoadingRemoveStock } = useStock();
  const { t } = useTranslate();
  const { products, isFetching } = useProducts();
  const { getLotsData, isLoadingGetLots } = useLots();
  const [productNames, setProductNames] = useState<{ [key: string]: string }>(
    {}
  );
  const [lotNames, setLotNames] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const productNamesMap: { [key: string]: string } = {};
    products?.forEach((product) => {
      productNamesMap[product.id || ""] = product.name;
    });
    setProductNames(productNamesMap);

    const lotNamesMap: { [key: string]: string } = {};
    getLotsData?.lots?.forEach((lot) => {
      lotNamesMap[lot.id] = lot.name;
    });
    setLotNames(lotNamesMap);
  }, [products, getLotsData]);

  if (stock.length === 0) {
    return <EmptyStateResult />;
  }

  const columns: GridColDef[] = [
    {
      field: "actions",
      headerName: t("Actions"),
      width: 100,
      renderCell: (params: GridRenderCellParams<IStock>) => (
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
            onClick={() => redirect(`/stock/${params.row.id}`)}
          /> */}
          <IconButton
            aria-label="Edit Stock"
            icon={<EditIcon />}
            onClick={() => redirect(`/stock/edit/${params.row.id}`)}
          />
          {!isLoadingRemoveStock ? (
            <IconButton
              aria-label="Remove Stock"
              icon={<DeleteIcon />}
              onClick={() => removeStockMutation(params.row.id || "")}
            />
          ) : (
            <IconButton
              aria-label="Remove Stock"
              icon={<TimeIcon />}
              onClick={() => removeStockMutation(params.row.id || "")}
            />
          )}
        </Box>
      ),
    },
    { field: "productId", headerName: "Product ID", width: 150 },
    { field: "lotId", headerName: "Lot ID", width: 150 },
    { field: "productName", headerName: "Product Name", width: 150 },
    { field: "lotName", headerName: "Lot Name", width: 150 },
    { field: "unitsNumber", headerName: "Units Number", width: 150 },
    { field: "looseUnitsNumber", headerName: "Loose Units Number", width: 150 },
    { field: "created_at", headerName: "Created At", width: 150 },
    { field: "updated_at", headerName: "Updated At", width: 150 },
  ];

  const rows = stock.map((item) => ({
    id: item.id,
    productId: item.productId,
    lotId: item.lotId,
    productName: productNames[item.productId] || "",
    lotName: lotNames[item.lotId] || "",
    unitsNumber: item.unitsNumber,
    looseUnitsNumber: item.looseUnitsNumber,
    created_at: item.created_at,
    updated_at: item.updated_at,
  }));

  return (
    <Box height={400} width="100%">
      <AppThemeProvider>
        <DataGrid
          loading={isFetching || isLoadingGetLots}
          rows={rows}
          columns={columns}
          rowCount={stock?.length}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
        />
      </AppThemeProvider>
    </Box>
  );
};
