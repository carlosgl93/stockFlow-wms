import { SearchIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { Box, IconButton, Tooltip } from "@chakra-ui/react";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useRedirect, useTranslate } from "utils";
import { IEntry } from "../types";
import { useEntries } from "./useEntries";
import { Logger } from "utils/logger";
import { useEffect, useState } from "react";
import { getSupplierById } from "modules/suppliers";
import { getTransporterById } from "modules/transporters/infrastructure";
import { commonTooltipStyles } from "../../products/presentation/ProductsList";
import dayjs from "dayjs";
import { capitalize } from "../../../utils/format/capitalize";

export const EntriesListController = () => {
  const [rows, setRows] = useState<IEntry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<IEntry | null>(null);
  const redirect = useRedirect();
  const {
    removeEntryMutation,
    isLoadingRemoveEntry,
    entriesData,
    isLoadingGetEntries,
  } = useEntries();
  const { t, dataGridLocaleText } = useTranslate();
  const handleDetailClick = (entry: IEntry) => {
    setSelectedEntry(entry);
    setIsDetailModalOpen(true);
  };
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
          <Tooltip
            label={t("Detail")}
            placement="left"
            hasArrow
            sx={{
              bgColor: "blue.500",
              ...commonTooltipStyles,
            }}
          >
            <IconButton
              aria-label="Detail"
              icon={<SearchIcon />}
              sx={{
                fontSize: "1rem",
              }}
              onClick={() => handleDetailClick(params.row)}
            />
          </Tooltip>
          <Tooltip
            label={t("Edit Entry")}
            placement="left"
            hasArrow
            sx={{
              bgColor: "blue.500",
              ...commonTooltipStyles,
            }}
          >
            <IconButton
              aria-label="Edit Entry"
              icon={<EditIcon />}
              sx={{
                fontSize: "1rem",
              }}
              onClick={() => redirect(`/entries/edit/${params.row.id}`)}
            />
          </Tooltip>
          <Tooltip
            label={t("Remove Entry")}
            placement="left"
            hasArrow
            sx={{
              bgColor: "red.500",
              ...commonTooltipStyles,
            }}
          >
            <IconButton
              aria-label="Remove Entry"
              icon={<DeleteIcon />}
              sx={{
                fontSize: "1rem",
              }}
              onClick={() => {
                setSelectedEntryId(params.row.id || null);
                setIsModalOpen(true);
              }}
            />
          </Tooltip>
        </Box>
      ),
    },
    {
      field: "entryDate",
      headerName: t("Entry Date"),
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
      width: 400,
      getApplyQuickFilterFn: (value) => {
        const searchTerm = value.toLowerCase();
        return (params: string) => {
          const name = params.toLowerCase();
          return name.includes(searchTerm);
        };
      },
    },
    { field: "supplierName", headerName: t("Supplier"), width: 150 },
    { field: "transporterId", headerName: t("Transporter"), width: 150 },
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
              entryDate: dayjs(entry.entryDate).format("DD-MM-YYYY"),
              supplierName: capitalize(suppInfo.company),
              transporterId: capitalize(transpInfo.name),
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
    isDetailModalOpen,
    selectedEntry,
    dataGridLocaleText,
    handleClose: () => setIsModalOpen(false),
    handleDetailClose: () => setIsDetailModalOpen(false),
    handleConfirmRemove,
    t,
  };
};
