import { DeleteIcon, CheckIcon } from "@chakra-ui/icons";
import { Button } from "@chakra-ui/react";
import { t } from "utils";

import { Page, PageHeader } from "shared/Layout";
import { ErrorPageStrategy } from "shared/Result";

import { withRequireAuth } from "modules/auth/application";
import { CreateProductForm } from "modules/products/presentation";

const CreateProductPage = () => {
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
      <CreateProductForm />
    </Page>
  );
};

export const Component = withRequireAuth(CreateProductPage, { to: "/sign-in" });

export const ErrorBoundary = ErrorPageStrategy;
