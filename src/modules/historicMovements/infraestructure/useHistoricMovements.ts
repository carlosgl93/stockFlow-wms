import { useQuery } from "@tanstack/react-query";
import { fetchHistoricMovements } from "./historicMovementsApi";
import { useState } from "react";

export const useHistoricMovements = (
  productId: string | null,
  type: "entry" | "dispatch" | null
) => {
  const { data: historicMovements, isLoading } = useQuery({
    queryKey: ["historicMovements", productId, type],
    queryFn: () => fetchHistoricMovements(productId, type),
  });

  return {
    historicMovements,
    isLoading,
  };
};
