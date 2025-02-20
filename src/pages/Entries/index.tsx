import { AddIcon, SearchIcon } from "@chakra-ui/icons";
import { Box, Button, Text } from "@chakra-ui/react";
import { withRequireAuth } from "modules/auth/application";
import { useEntries } from "modules/entries/infraestructure";
import { EntriesList } from "modules/entries/presentation";
import { Loading, Page, PageHeader } from "shared/Layout";
import { ErrorPageStrategy } from "shared/Result";
import { useNotImplementedYetToast } from "shared/Toast";
import { useRedirect, useTranslate } from "utils";
import { Logger } from "utils/logger";

const EntriesPage = () => {
  const notImplemented = useNotImplementedYetToast();
  const { t } = useTranslate();
  const redirect = useRedirect();
  const handleCreate = () => {
    redirect("/entries/create");
  };

  const { entriesData, isLoadingGetEntries } = useEntries();

  Logger.info("EntriesPage", { entriesData });

  return (
    <Page>
      <PageHeader
        title={t("Entries list")}
        description={t("Create, edit, remove entries.")}
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
      {isLoadingGetEntries ? (
        <Loading size="md" />
      ) : (
        <EntriesList entries={entriesData} />
      )}
    </Page>
  );
};

export const Component = withRequireAuth(EntriesPage, { to: "/sign-in" });

export const ErrorBoundary = ErrorPageStrategy;
