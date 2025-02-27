import { useMutation } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";
import {
  UpdatePlaceParams,
  addPlace,
  removePlace,
  updatePlace,
} from "./mutations";
import { queryClient, useQuery, useRedirect, useTranslate } from "utils";
import { useState } from "react";
import { getPlaces } from "./queries";

export const usePlaces = () => {
  const [pageSize, setPageSize] = useState(5);
  const [lastVisible, setLastVisible] = useState<null | string>(null);
  const toast = useToast();
  const { t } = useTranslate();
  const redirect = useRedirect();

  const {
    mutate: addPlaceMutation,
    isLoading: isLoadingAddPlace,
    isError: isErrorAddPlace,
  } = useMutation(addPlace, {
    onSuccess: () => {
      toast({
        title: t("Place added successfully."),
        status: "success",
      });
      queryClient.invalidateQueries(["places"]);
      redirect("/places");
    },
    onError: () => {
      toast({
        title: t("Failed to add place."),
        status: "error",
      });
    },
  });

  const {
    mutate: updatePlaceMutation,
    isLoading: isLoadingUpdatePlace,
    isError: isErrorUpdatePlace,
  } = useMutation(
    ({ placeId, values }: UpdatePlaceParams) =>
      updatePlace({ placeId, values }),
    {
      onSuccess: () => {
        toast({
          title: t("Place updated successfully."),
          status: "success",
        });
        queryClient.invalidateQueries(["places"]);
      },
      onError: () => {
        toast({
          title: t("Failed to update place."),
          status: "error",
        });
      },
    }
  );

  const {
    mutate: removePlaceMutation,
    isLoading: isLoadingRemovePlace,
    isError: isErrorRemovePlace,
  } = useMutation(removePlace, {
    onSuccess: () => {
      toast({
        title: t("Place removed successfully."),
        status: "success",
      });
      queryClient.invalidateQueries(["places"]);
    },
    onError: () => {
      toast({
        title: t("Failed to remove place."),
        status: "error",
      });
    },
  });

  const {
    data: getPlacesData,
    isLoading: isLoadingGetPlaces,
    isError: isErrorGetPlaces,
  } = useQuery({
    queryKey: ["places", pageSize, lastVisible],
    queryFn: () => getPlaces(pageSize, lastVisible ? lastVisible : null),
    onSuccess: (data) => {
      setLastVisible(data.lastVisible);
    },
  });

  return {
    addPlaceMutation,
    isLoadingAddPlace,
    isErrorAddPlace,
    updatePlaceMutation,
    isLoadingUpdatePlace,
    isErrorUpdatePlace,
    removePlaceMutation,
    isLoadingRemovePlace,
    isErrorRemovePlace,
    getPlacesData,
    isLoadingGetPlaces,
    isErrorGetPlaces,
  };
};
