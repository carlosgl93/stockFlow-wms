import { EntriesNotFoundResult } from "modules/entries/presentation";
import { InternalErrorResult } from "shared/Result";
import { ResourceNotFoundException, useQuery, useTranslate } from "utils";
import { useNavigate, useParams, useRouteError } from "shared/Router";
import { Loading, Page, PageHeader } from "shared/Layout";
import { Cancel } from "shared/Actions";
import { useDispatches } from "modules/dispatches/infraestructure";
import { CreateDispatchForm } from "modules/dispatches/presentation";

export const EditDispatchPage = () => {
  const { t } = useTranslate();

  const {
    getDispatchByIdData,
    isFetchingGetDispatchById,
    isErrorGetDispatchById,
  } = useDispatches();

  const navigate = useNavigate();

  if (isErrorGetDispatchById || !getDispatchByIdData) {
    return <EntriesNotFoundResult />;
  }

  if (isFetchingGetDispatchById) {
    return <Loading />;
  }

  return (
    <Page>
      <PageHeader
        title={t("Edit Dispatch")}
        description={t("Edit your Dispatch.")}
        position="sticky"
      >
        <Cancel onCancel={() => navigate(-1)} />
      </PageHeader>
      <CreateDispatchForm dispatchToEdit={getDispatchByIdData} />;
    </Page>
  );
};

export const Component = EditDispatchPage;

export const ErrorBoundary = () => {
  const error = useRouteError();

  if (error instanceof ResourceNotFoundException) {
    return <EntriesNotFoundResult />;
  }

  return <InternalErrorResult />;
};
