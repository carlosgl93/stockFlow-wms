import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridToolbar,
} from "@mui/x-data-grid";
import { Box, IconButton, Tooltip, useDisclosure } from "@chakra-ui/react";
import { DeleteIcon, EditIcon, TimeIcon } from "@chakra-ui/icons";
import { EmptyStateResult } from "shared/Result";
import { IDispatch } from "../types";
import { AppThemeProvider } from "theme/materialTheme";
import { useRedirect, useTranslate } from "utils";
import { useDispatches } from "../infraestructure";
import { ConfirmationModal } from "shared/ConfirmationModal";
import { useState } from "react";
import dayjs from "dayjs";
import { commonTooltipStyles } from "../../products/presentation/ProductsList";

interface IProps {
  dispatches: IDispatch[];
  pageSize?: number;
}

export const DispatchesList = ({ dispatches }: IProps) => {
  const redirect = useRedirect();
  const {
    isLoadingGetDispatches,
    removeDispatchMutation,
    isLoadingRemoveDispatch,
  } = useDispatches();

  const { t, dataGridLocaleText } = useTranslate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedDispatchId, setSelectedDispatchId] = useState<string | null>(
    null
  );

  const handleRemoveClick = (id: string) => {
    setSelectedDispatchId(id);
    onOpen();
  };

  const confirmRemove = () => {
    if (selectedDispatchId) {
      removeDispatchMutation(selectedDispatchId);
      setSelectedDispatchId(null);
      onClose();
    }
  };

  if (dispatches?.length === 0) {
    return <EmptyStateResult />;
  }

  const columns: GridColDef[] = [
    {
      field: "actions",
      headerName: t("Actions"),
      width: 100,
      renderCell: (params: GridRenderCellParams<IDispatch>) => (
        <Box
          display="flex"
          gap={2}
          justifyContent={"center"}
          alignContent={"center"}
          h={"100%"}
        >
          <Tooltip
            label={t("Edit Dispatch")}
            placement="left"
            hasArrow
            sx={{
              bgColor: "blue.500",
              ...commonTooltipStyles,
            }}
          >
            <IconButton
              aria-label="Edit Dispatch"
              icon={<EditIcon />}
              onClick={() => redirect(`/dispatches/edit/${params.row.id}`)}
              sx={{
                fontSize: "1.2rem",
                p: 2,
              }}
            />
          </Tooltip>
          {!isLoadingRemoveDispatch ? (
            <Tooltip
              label={t("Remove Dispatch")}
              placement="left"
              hasArrow
              sx={{
                bgColor: "red.500",
                ...commonTooltipStyles,
              }}
            >
              <IconButton
                aria-label="Remove Dispatch"
                icon={<DeleteIcon />}
                onClick={() => handleRemoveClick(params.row.id || "")}
                sx={{
                  fontSize: "1.2rem",
                  p: 2,
                }}
              />
            </Tooltip>
          ) : (
            <IconButton
              aria-label="Remove Dispatch"
              icon={<TimeIcon />}
              onClick={() => handleRemoveClick(params.row.id || "")}
            />
          )}
        </Box>
      ),
    },
    {
      field: "dispatchDate",
      headerName: t("Dispatch Date"),
      width: 150,
      getApplyQuickFilterFn: (value) => {
        const searchTerm = value.toLowerCase();
        return (params: string) => {
          const name = params.toLowerCase();
          return name.includes(searchTerm);
        };
      },
    },
    {
      field: "docNumber",
      headerName: t("Document Number"),
      width: 150,
      getApplyQuickFilterFn: (value) => {
        const searchTerm = value.toLowerCase();
        return (params: string) => {
          const name = params.toLowerCase();
          return name.includes(searchTerm);
        };
      },
    },
    {
      field: "description",
      headerName: t("Description"),
      width: 450,
      getApplyQuickFilterFn: (value) => {
        const searchTerm = value.toLowerCase();
        return (params: string) => {
          const name = params.toLowerCase();
          return name.includes(searchTerm);
        };
      },
    },
    {
      field: "lotId",
      headerName: t("Lot"),
      width: 150,
      getApplyQuickFilterFn: (value) => {
        const searchTerm = value.toLowerCase();
        return (params: string) => {
          const name = params.toLowerCase();
          return name.includes(searchTerm);
        };
      },
    },
    {
      field: "totalUnitsNumber",
      headerName: t("Total Units Number"),
      width: 150,
    },
    { field: "dispatchStatus", headerName: t("Dispatch Status"), width: 150 },
  ];
  const rows = dispatches?.map((dispatch, i) => ({
    id: dispatch?.id,
    docNumber: dispatch?.docNumber,
    supplierId: dispatch?.supplierId,
    transporterId: dispatch?.transporterId,
    productId: dispatch?.products[i]?.id,
    lotId: [...new Set(dispatch?.products.map((p) => p.lotId))]
      .filter(Boolean)
      .join(", "),
    dispatchDate: dayjs(dispatch?.dispatchDate).format("DD-MM-YYYY"),
    deliveryDate: dispatch?.deliveryDate,
    palletNumber: dispatch?.products[i]?.palletNumber,
    unitsNumber: dispatch?.products[i]?.unitsNumber,
    looseUnitsNumber: dispatch?.products[i]?.looseUnitsNumber,
    totalUnitsNumber: dispatch?.products.reduce((acc, curr) => {
      return acc + (curr?.totalUnitsNumber || 0);
    }, 0),
    description: dispatch?.description,
    dispatchStatus: t(dispatch?.dispatchedStatus || ""),
  }));

  return (
    <Box height={400} width="100%">
      <AppThemeProvider>
        <DataGrid
          rows={rows}
          columns={columns}
          rowCount={dispatches?.length}
          slots={{ toolbar: GridToolbar }}
          loading={isLoadingGetDispatches || isLoadingRemoveDispatch}
          slotProps={{
            toolbar: {
              csvOptions: {
                fileName: `despachos-${new Date().toISOString()}.csv`,
                utf8WithBom: true,
              },
              contentEditable: false,
              showQuickFilter: true,
              quickFilterProps: {
                debounceMs: 500,
                placeholder: t(
                  "Search by date, doc number, lot id or produt name..."
                ),
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
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={confirmRemove}
        title={t("Confirm Removal")}
        description={t("Are you sure you want to remove this dispatch?")}
      />
    </Box>
  );
};
