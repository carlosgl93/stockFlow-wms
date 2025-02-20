import { StockNotFoundResult } from "modules/stock/presentation";
import { InternalErrorResult } from "shared/Result";
import { ResourceNotFoundException, useTranslate } from "utils";
import { useNavigate, useRouteError } from "shared/Router";
import { Loading, Page, PageHeader } from "shared/Layout";
import { Cancel } from "shared/Actions";
import { CreateStockForm } from "modules/stock/presentation";
import { useStock } from "modules/stock/infraestructure";

export const EditStockPage = () => {
  const { t } = useTranslate();
  const navigate = useNavigate();
  const { stockByIdData, isFetchingGetStock, isErrorGetStock } = useStock();

  if (isErrorGetStock || !stockByIdData) {
    return <StockNotFoundResult />;
  }

  if (isFetchingGetStock) {
    return <Loading />;
  }

  return (
    <Page>
      <PageHeader
        title={t("Edit Stock")}
        description={t("Edit your stock.")}
        position="sticky"
      >
        <Cancel onCancel={() => navigate(-1)} />
      </PageHeader>
      <CreateStockForm stockToEdit={stockByIdData} />;
    </Page>
  );
};

export const Component = EditStockPage;

export const ErrorBoundary = () => {
  const error = useRouteError();

  if (error instanceof ResourceNotFoundException) {
    return <StockNotFoundResult />;
  }

  return <InternalErrorResult />;
};
