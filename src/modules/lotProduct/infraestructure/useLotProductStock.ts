import { useQuery } from "@tanstack/react-query";
import { getTotalStockByProductIdAndLotId } from "./queries";

type UseLotProductStockProps = {
  productId: string;
  lotId: string;
};

export const useLotProductStock = ({
  productId,
  lotId,
}: UseLotProductStockProps) => {
  const {
    data: totalStockByLotAndProduct,
    isLoading: isLoadingTotalStockByLotAndProduct,
    isError: isErrorTotalStockByLotAndProduct,
  } = useQuery({
    queryKey: ["totalStockByLotAndProduct", productId, lotId],
    queryFn: () => getTotalStockByProductIdAndLotId(productId, lotId),
    enabled: !!lotId && !!productId,
  });

  return {
    totalStockByLotAndProduct,
    isLoadingTotalStockByLotAndProduct,
    isErrorTotalStockByLotAndProduct,
  };
};
