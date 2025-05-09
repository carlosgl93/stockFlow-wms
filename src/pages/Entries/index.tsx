import { AddIcon, SearchIcon } from "@chakra-ui/icons";
import { Box, Button, Text } from "@chakra-ui/react";
import { EntriesListController } from "modules/entries/infraestructure";
import { EntriesList } from "modules/entries/presentation";
import { Loading, Page, PageHeader } from "shared/Layout";
import { ErrorPageStrategy } from "shared/Result";
import { useNotImplementedYetToast } from "shared/Toast";
import { useRedirect, useTranslate } from "utils";

const EntriesPage = () => {
  const notImplemented = useNotImplementedYetToast();
  const { t } = useTranslate();
  const redirect = useRedirect();
  const handleCreate = () => {
    redirect("/entries/create");
  };
  const { isLoadingGetEntries } = EntriesListController();

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
      {isLoadingGetEntries ? <Loading size="md" /> : <EntriesList />}
    </Page>
  );
};

export const Component = EntriesPage;

export const ErrorBoundary = ErrorPageStrategy;
