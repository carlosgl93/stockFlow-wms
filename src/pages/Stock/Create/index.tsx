import { CreateStockForm } from "modules/stock/presentation";
import { Cancel } from "shared/Actions";
import { Page, PageHeader } from "shared/Layout";
import { ErrorPageStrategy } from "shared/Result";
import { useTranslate } from "utils";
import { useNavigate } from "shared/Router";

export const CreateStockPage = () => {
  const { t } = useTranslate();
  const redirect = useNavigate();

  return (
    <Page>
      <PageHeader
        title={t("Create Stock")}
        description={t("Create your stock item.")}
        position="sticky"
      />
      <Cancel onCancel={() => redirect(-1)} />
      <CreateStockForm />
    </Page>
  );
};

export const Component = CreateStockPage;

export const ErrorBoundary = ErrorPageStrategy;
