import { AddIcon, SearchIcon } from "@chakra-ui/icons";
import { Box, Button, Text } from "@chakra-ui/react";
import { OrangeButton } from "modules/components";
import { useDispatches } from "modules/dispatches/infraestructure";
import { DispatchesList } from "modules/dispatches/presentation";
import { Loading, Page, PageHeader } from "shared/Layout";
import { ErrorPageStrategy } from "shared/Result";
import { useNotImplementedYetToast } from "shared/Toast";
import { useRedirect, useTranslate } from "utils";
import { Logger } from "utils/logger";

const DispatchesPage = () => {
  const notImplemented = useNotImplementedYetToast();
  const { t } = useTranslate();
  const redirect = useRedirect();
  const handleCreate = () => {
    redirect("/dispatches/create");
  };

  const { dispatchesData, isLoadingGetDispatches } = useDispatches();

  Logger.info("DispatchesPage", { dispatchesData });

  return (
    <Page>
      <PageHeader
        title={t("Dispatches list")}
        description={t("Create, edit, remove dispatches.")}
      >
        <Box display="flex" alignItems="end" gap={4}>
          <OrangeButton onClick={handleCreate} text={t("Create")} />
        </Box>
      </PageHeader>
      {isLoadingGetDispatches ? (
        <Loading size="md" />
      ) : (
        <DispatchesList
          dispatches={dispatchesData}
          isLoadingGetDispatches={isLoadingGetDispatches}
        />
      )}
    </Page>
  );
};

export const Component = DispatchesPage;

export const ErrorBoundary = ErrorPageStrategy;
