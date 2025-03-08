import { DeleteIcon, CheckIcon } from "@chakra-ui/icons";
import { Button } from "@chakra-ui/react";

import { Page, PageHeader } from "shared/Layout";
import { ErrorPageStrategy } from "shared/Result";

import { withRequireAuth } from "modules/auth/application";
import { CreateProductForm } from "modules/products/presentation";
import { useTranslate } from "utils";
import { useNavigate } from "shared/Router";
import { Cancel } from "shared/Actions";

const CreateProductPage = () => {
  const { t } = useTranslate();
  const redirect = useNavigate();
  return (
    <Page>
      <PageHeader
        title={t("Create Product")}
        description={t("Create your product.")}
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
      <CreateProductForm />
    </Page>
  );
};

export const Component = CreateProductPage;

export const ErrorBoundary = ErrorPageStrategy;
