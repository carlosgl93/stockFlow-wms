import { useQuery } from "@tanstack/react-query";
import { getTotalStockByProductIdAndLotId } from "./queries";
import { getHumanReadableError } from "shared/Error";
import { useTranslate } from "utils";

type UseLotProductStockProps = {
  productId: string;
  lotId: string;
};

export const useLotProductStock = ({
  productId,
  lotId,
}: UseLotProductStockProps) => {
  const { t } = useTranslate();

  const {
    data: totalStockByLotAndProduct,
    isLoading: isLoadingTotalStockByLotAndProduct,
    isError: isErrorTotalStockByLotAndProduct,
    error,
  } = useQuery({
    queryKey: ["totalStockByLotAndProduct", productId, lotId],
    queryFn: () => getTotalStockByProductIdAndLotId(productId, lotId),
    enabled: !!lotId && !!productId,
    onError: (error: unknown) => {
      const humanError = getHumanReadableError(error, t);
      console.error("Stock query error:", humanError);
    },
  });

  return {
    totalStockByLotAndProduct,
    isLoadingTotalStockByLotAndProduct,
    isErrorTotalStockByLotAndProduct,
    errorMessage: error ? getHumanReadableError(error, t) : undefined,
  };
};
