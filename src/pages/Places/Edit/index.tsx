import { ProductNotFoundResult } from "modules/products/presentation";
import { InternalErrorResult } from "shared/Result";
import { ResourceNotFoundException, useQuery, useTranslate } from "utils";
import { useNavigate, useParams, useRouteError } from "shared/Router";
import { Loading, Page, PageHeader } from "shared/Layout";
import { Cancel } from "shared/Actions";
import { getPlaceById } from "modules/lots/infraestructure";
import {
  CreatePlaceForm,
  PlaceNotFoundResult,
} from "modules/places/presentation";

export const EditPlacePage = () => {
  const { placeId } = useParams<{ placeId: string }>();
  const { t } = useTranslate();
  const { data, isFetching, isError } = useQuery({
    queryKey: ["place", placeId],
    queryFn: () => getPlaceById(placeId as string),
  });

  const navigate = useNavigate();

  if (isError || !data) {
    return <ProductNotFoundResult />;
  }

  if (isFetching) {
    return <Loading />;
  }

  return (
    <Page>
      <PageHeader
        title={t("Edit Place")}
        description={t("Edit your place.")}
        position="sticky"
      >
        <Cancel onCancel={() => navigate(-1)} />
      </PageHeader>
      <CreatePlaceForm placeToEdit={data} />;
    </Page>
  );
};

export const Component = EditPlacePage;

export const ErrorBoundary = () => {
  const error = useRouteError();

  if (error instanceof ResourceNotFoundException) {
    return <PlaceNotFoundResult />;
  }

  return <InternalErrorResult />;
};
