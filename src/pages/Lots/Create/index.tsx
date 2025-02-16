import { CreateLotForm } from "modules/lots/presentation";
import { Page, PageHeader } from "shared/Layout";
import { ErrorPageStrategy } from "shared/Result";
import { useTranslate } from "utils";

export const CreateLot = () => {
  const { t } = useTranslate();

  return (
    <Page>
      <PageHeader
        title={t("Create Lot")}
        description={t("Create your lot.")}
        position="sticky"
      >
        {/* <Button leftIcon={<DeleteIcon />} onClick={() => {}}>
          {t("Delete")}
        </Button>

        <Button leftIcon={<CheckIcon />} onClick={() => {}}>
          {t("Create")}
        </Button> */}
      </PageHeader>
      <CreateLotForm />
    </Page>
  );
};

export const Component = CreateLot;

export const ErrorBoundary = ErrorPageStrategy;
