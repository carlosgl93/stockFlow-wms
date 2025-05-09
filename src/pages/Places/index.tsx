import { AddIcon, SearchIcon } from "@chakra-ui/icons";
import { Box, Button, Text } from "@chakra-ui/react";
import { usePlaces } from "modules/places/infra";
import { PlacesList } from "modules/places/presentation";
import { Loading, Page, PageHeader } from "shared/Layout";
import { ErrorPageStrategy } from "shared/Result";
import { useNotImplementedYetToast } from "shared/Toast";
import { useRedirect, useTranslate } from "utils";

const PlacesPage = () => {
  const { t } = useTranslate();
  const notImplemented = useNotImplementedYetToast();
  const redirect = useRedirect();
  const { getPlacesData, isLoadingGetPlaces } = usePlaces();

  const handleCreate = () => {
    redirect("/places/create");
  };

  if (isLoadingGetPlaces) return <Loading />;

  return (
    <Page>
      <PageHeader
        title={t("Places list")}
        description={t("Create, edit, remove places.")}
      >
        <Box display="flex" alignItems="center" gap={4}>
          <Text>
            {/* {t("Total registers: ")} {total} {t("Pages:")} {pages} */}
          </Text>
          <Button leftIcon={<SearchIcon />} onClick={notImplemented}>
            {t("Search")}
          </Button>

          <Button leftIcon={<AddIcon />} onClick={handleCreate}>
            {t("Create")}
          </Button>
        </Box>
      </PageHeader>
      <PlacesList places={getPlacesData?.places} />
    </Page>
  );
};

export const Component = PlacesPage;

export const ErrorBoundary = ErrorPageStrategy;
