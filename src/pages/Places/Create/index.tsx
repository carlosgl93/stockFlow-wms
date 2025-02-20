import { CreatePlaceForm } from "modules/lots/presentation";
import { Cancel } from "shared/Actions";
import { Page, PageHeader } from "shared/Layout";
import { ErrorPageStrategy } from "shared/Result";
import { useTranslate } from "utils";
import { useNavigate } from "shared/Router";

export const CreatePlace = () => {
  const { t } = useTranslate();
  const redirect = useNavigate();

  return (
    <Page>
      <PageHeader
        title={t("Create Place")}
        description={t("Create your place.")}
        position="sticky"
      >
        {/* <Button leftIcon={<DeleteIcon />} onClick={() => {}}>
          {t("Delete")}
        </Button>

        <Button leftIcon={<CheckIcon />} onClick={() => {}}>
          {t("Create")}
        </Button> */}
      </PageHeader>
      <Cancel onCancel={() => redirect(-1)} />
      <CreatePlaceForm />
    </Page>
  );
};

export const Component = CreatePlace;

export const ErrorBoundary = ErrorPageStrategy;
