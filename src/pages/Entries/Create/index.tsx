import { CreateEntryForm } from "modules/entries/presentation";
import { Page, PageHeader } from "shared/Layout";
import { ErrorPageStrategy } from "shared/Result";
import { useTranslate } from "utils";

export const CreateEntryPage = () => {
  const { t } = useTranslate();

  return (
    <Page>
      <PageHeader
        title={t("Create Entry")}
        description={t("Create your entry.")}
        position="sticky"
      />
      <CreateEntryForm />
    </Page>
  );
};

export const Component = CreateEntryPage;

export const ErrorBoundary = ErrorPageStrategy;
