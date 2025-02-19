import { AddIcon, SearchIcon } from "@chakra-ui/icons";
import { Box, Button, Text } from "@chakra-ui/react";
import { withRequireAuth } from "modules/auth/application";
import { useLots } from "modules/lots/infraestructure";
import { LotsList } from "modules/lots/presentation";
import { Loading, Page, PageHeader } from "shared/Layout";
import { ErrorPageStrategy } from "shared/Result";
import { useNotImplementedYetToast } from "shared/Toast";
import { useRedirect, useTranslate } from "utils";
import { Logger } from "utils/logger";

const LotsPage = () => {
  const { t } = useTranslate();
  const notImplemented = useNotImplementedYetToast();
  const redirect = useRedirect();
  const { getLotsData, isLoadingGetLots } = useLots();
  Logger.info("getLotsData", [getLotsData]);

  const handleCreate = () => {
    // TODO: implement lot creation
    redirect("/lots/create");
  };

  if (isLoadingGetLots) return <Loading />;

  return (
    <Page>
      <PageHeader
        title={t("Lots list")}
        description={t("Create, edit, remove lots.")}
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
      <LotsList lots={getLotsData?.lots} />
    </Page>
  );
};

export const Component = withRequireAuth(LotsPage, { to: "/sign-in" });

export const ErrorBoundary = ErrorPageStrategy;
