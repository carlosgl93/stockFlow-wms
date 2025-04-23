import { useQuery } from "@tanstack/react-query";
import { fetchHistoricMovements } from "./historicMovementsApi";
import { useState } from "react";

export const useHistoricMovements = (
  productId: string | null,
  type: "entry" | "dispatch" | null
) => {
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [lastVisible, setLastVisible] = useState<string | null>(null);

  const { data: historicMovements, isLoading } = useQuery({
    queryKey: [
      "historicMovements",
      productId,
      type,
      page,
      pageSize,
      lastVisible,
    ],
    queryFn: async () => {
      const data = await fetchHistoricMovements(
        page,
        pageSize,
        lastVisible,
        productId,
        type
      );
      if (data.length > 0) {
        setLastVisible(data[data.length - 1].id);
      }
      return data;
    },
  });

  return {
    historicMovements,
    isLoading,
    fetchNextPage: (nextPage: number) => setPage(nextPage),
  };
};
