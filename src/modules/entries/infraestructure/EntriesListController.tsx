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
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null); // State for selected entry
  const redirect = useRedirect();
  const {
    removeEntryMutation,
    isLoadingRemoveEntry,
    entriesData,
    isLoadingGetEntries,
  } = useEntries();
  const { t } = useTranslate();
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
          {/* <IconButton
            aria-label="View Details"
            icon={<SearchIcon />}
            onClick={() => redirect(`/entries/${params.row.id}`)}
          /> */}
          <IconButton
            aria-label="Edit Entry"
            icon={<EditIcon />}
            onClick={() => redirect(`/entries/edit/${params.row.id}`)}
          />
          <IconButton
            aria-label="Remove Entry"
            icon={<DeleteIcon />}
            onClick={() => {
              setSelectedEntryId(params.row.id || null);
              setIsModalOpen(true);
            }}
          />
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

  const handleConfirmRemove = () => {
    if (selectedEntryId) {
      removeEntryMutation(selectedEntryId);
      setIsModalOpen(false);
    }
  };

  return {
    columns,
    rows,
    entriesData,
    isLoadingGetEntries,
    isLoadingRemoveEntry,
    isModalOpen,
    selectedEntryId,
    handleClose: () => setIsModalOpen(false),
    handleConfirmRemove,
    t,
  };
};
