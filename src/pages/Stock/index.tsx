import { AddIcon, SearchIcon } from "@chakra-ui/icons";
import { Box, Button, Text } from "@chakra-ui/react";
import { withRequireAuth } from "modules/auth/application";
import { useStock } from "modules/stock/infraestructure";
import { StockList } from "modules/stock/presentation";
import { Loading, Page, PageHeader } from "shared/Layout";
import { ErrorPageStrategy } from "shared/Result";
import { useNotImplementedYetToast } from "shared/Toast";
import { useRedirect, useTranslate } from "utils";
import { Logger } from "utils/logger";

const StockPage = () => {
  const notImplemented = useNotImplementedYetToast();
  const { t } = useTranslate();
  const redirect = useRedirect();
  const handleCreate = () => {
    redirect("/stock/create");
  };

  const { stockData, isLoadingGetStock } = useStock();

  Logger.info("StockPage", { stockData });

  return (
    <Page>
      <PageHeader
        title={t("Stock list")}
        description={t("Create, edit, remove stock items.")}
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
      {isLoadingGetStock ? (
        <Loading size="md" />
      ) : (
        <StockList stock={stockData} />
      )}
    </Page>
  );
};

export const Component = withRequireAuth(StockPage, { to: "/sign-in" });

export const ErrorBoundary = ErrorPageStrategy;
