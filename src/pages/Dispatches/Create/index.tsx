import { Cancel } from "shared/Actions";
import { Page, PageHeader } from "shared/Layout";
import { ErrorPageStrategy } from "shared/Result";
import { useTranslate } from "utils";
import { useNavigate } from "shared/Router";
import { CreateDispatchForm } from "modules/dispatches/presentation";

export const CreateDispatchPage = () => {
  const { t } = useTranslate();
  const redirect = useNavigate();

  return (
    <Page>
      <PageHeader
        title={t("Create Dispatch")}
        description={t("Create your dispatch.")}
        position="sticky"
      />
      <Cancel onCancel={() => redirect(-1)} />
      <CreateDispatchForm />
    </Page>
  );
};

export const Component = CreateDispatchPage;

export const ErrorBoundary = ErrorPageStrategy;
