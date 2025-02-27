import { SearchIcon, EditIcon, DeleteIcon, TimeIcon } from "@chakra-ui/icons";
import { Box, IconButton } from "@chakra-ui/react";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useRedirect, useTranslate } from "utils";
import { IEntry } from "../types";
import { useEntries } from "./useEntries";
import { Logger } from "utils/logger";
import { useEffect, useState } from "react";
import { getSupplierById } from "modules/suppliers";
import { getTransporterById } from "modules/transporters/infrastructure";

export const EntriesListController = () => {
  const [rows, setRows] = useState<IEntry[]>([]);
  const redirect = useRedirect();
  const {
    removeEntryMutation,
    isLoadingRemoveEntry,
    entriesData,
    isLoadingGetEntries,
  } = useEntries();
  const { t } = useTranslate();
  Logger.info("entriesData", entriesData);
  const columns: GridColDef[] = [
    {
      field: "actions",
      headerName: t("Actions"),
      width: 100,
      renderCell: (params: GridRenderCellParams<IEntry>) => (
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
            onClick={() => redirect(`/entries/${params.row.id}`)}
          />
          <IconButton
            aria-label="Edit Entry"
            icon={<EditIcon />}
            onClick={() => redirect(`/entries/edit/${params.row.id}`)}
          />
          {!isLoadingRemoveEntry ? (
            <IconButton
              aria-label="Remove Entry"
              icon={<DeleteIcon />}
              onClick={() => removeEntryMutation(params.row.id || "")}
            />
          ) : (
            <IconButton
              aria-label="Remove Entry"
              icon={<TimeIcon />}
              onClick={() => removeEntryMutation(params.row.id || "")}
            />
          )}
        </Box>
      ),
    },
    { field: "docNumber", headerName: t("Document Number"), width: 150 },
    { field: "supplierName", headerName: t("Supplier"), width: 150 },
    { field: "transporterId", headerName: t("Transporter"), width: 150 },
    { field: "description", headerName: t("Description"), width: 400 },
  ];

  useEffect(() => {
    const fetchSupportingData = async () => {
      if (entriesData) {
        const rowsWithSupportingData = await Promise.all(
          entriesData.map(async (entry) => {
            const suppInfo = await getSupplierById(entry.supplierId);
            const transpInfo = await getTransporterById(entry.transporterId);
            return {
              ...entry,
              supplierName: suppInfo.company,
              transporterId: transpInfo.name,
            };
          })
        );
        setRows(rowsWithSupportingData as IEntry[]);
      }
    };
    fetchSupportingData();
  }, [entriesData]);

  Logger.info("rows", rows);

  return {
    columns,
    rows,
    entriesData,
    isLoadingGetEntries,
  };
};
