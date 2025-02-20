import { EntriesNotFoundResult } from "modules/entries/presentation";
import { InternalErrorResult } from "shared/Result";
import { ResourceNotFoundException, useQuery, useTranslate } from "utils";
import { useNavigate, useParams, useRouteError } from "shared/Router";
import { Loading, Page, PageHeader } from "shared/Layout";
import { Cancel } from "shared/Actions";
import { CreateEntryForm } from "modules/entries/presentation";
import { useEntries } from "modules/entries/infraestructure";

export const EditEntryPage = () => {
  const { t } = useTranslate();

  const { getEntryByIdData, isFetchingGetEntryById, isErrorgetEntryById } =
    useEntries();

  const navigate = useNavigate();

  if (isErrorgetEntryById || !getEntryByIdData) {
    return <EntriesNotFoundResult />;
  }

  if (isFetchingGetEntryById) {
    return <Loading />;
  }

  return (
    <Page>
      <PageHeader
        title={t("Edit Entry")}
        description={t("Edit your entry.")}
        position="sticky"
      >
        <Cancel onCancel={() => navigate(-1)} />
      </PageHeader>
      <CreateEntryForm entryToEdit={getEntryByIdData} />;
    </Page>
  );
};

export const Component = EditEntryPage;

export const ErrorBoundary = () => {
  const error = useRouteError();

  if (error instanceof ResourceNotFoundException) {
    return <EntriesNotFoundResult />;
  }

  return <InternalErrorResult />;
};
