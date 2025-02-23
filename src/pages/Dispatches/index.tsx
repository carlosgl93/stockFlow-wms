import { AddIcon, SearchIcon } from "@chakra-ui/icons";
import { Box, Button, Text } from "@chakra-ui/react";
import { withRequireAuth } from "modules/auth/application";
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
        <Box display="flex" alignItems="center" gap={4}>
          <Text>
            {/* {t("Total registers: ")} {total} {t("Pages:")} {pages} */}
          </Text>
          <Button leftIcon={<SearchIcon />} onClick={notImplemented}>
            {t("Search")}
          </Button>

          <Button leftIcon={<AddIcon />} onClick={handleCreate}>
            {t("Create")}
          </Button>
        </Box>
      </PageHeader>
      {isLoadingGetDispatches ? (
        <Loading size="md" />
      ) : (
        <DispatchesList dispatches={dispatchesData} />
      )}
    </Page>
  );
};

export const Component = withRequireAuth(DispatchesPage, { to: "/sign-in" });

export const ErrorBoundary = ErrorPageStrategy;
