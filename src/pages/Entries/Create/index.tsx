import { CreateEntryForm } from "modules/entries/presentation";
import { Cancel } from "shared/Actions";
import { Page, PageHeader } from "shared/Layout";
import { ErrorPageStrategy } from "shared/Result";
import { useTranslate } from "utils";
import { useNavigate } from "shared/Router";

export const CreateEntryPage = () => {
  const { t } = useTranslate();
  const redirect = useNavigate();

  return (
    <Page>
      <PageHeader
        title={t("Create Entry")}
        description={t("Create your entry.")}
        position="sticky"
      />
      <Cancel onCancel={() => redirect(-1)} />
      <CreateEntryForm />
    </Page>
  );
};

export const Component = CreateEntryPage;

export const ErrorBoundary = ErrorPageStrategy;
