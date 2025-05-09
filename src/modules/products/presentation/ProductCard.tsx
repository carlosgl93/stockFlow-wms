import { Box, Text, VStack, HStack } from "@chakra-ui/react";
import { useSecondaryTextColor } from "theme";

import { moneyVO } from "utils";

import { useNavigate } from "shared/Router";

import { AddToCartButton } from "modules/carts/presentation";

import { Category, IProduct } from "../types";
import { useCategoryLabel } from "./useCategoryLabel";

interface IProps {
  product: IProduct;
}

const ProductCard = ({
  product: { id, name: title, category, price },
}: IProps) => {
  const navigate = useNavigate();
  const categoryLabel = useCategoryLabel(category);
  const categoryColor = useSecondaryTextColor();

  return (
    <VStack spacing={3} overflow="hidden" rounded="lg">
      <Box
        onClick={() => navigate(`/products/${id}`)}
        cursor="pointer"
        h={64}
        w="lg"
        bgSize="cover"
        bgPos="center"
      />
      <VStack w="100%" spacing={0} align="flex-start">
        <HStack
          w="100%"
          justify="space-between"
          fontSize={{ base: "md", md: "lg" }}
          fontWeight="semibold"
          spacing={6}
        >
          <Text
            isTruncated
            onClick={() => navigate(`/products/${id}`)}
            cursor="pointer"
          >
            {title}
          </Text>
          <Text>{moneyVO.format(price)}</Text>
        </HStack>
        <Text
          fontStyle="italic"
          fontSize={{ base: "sm", md: "md" }}
          color={categoryColor}
        >
          {categoryLabel}
        </Text>
      </VStack>
    </VStack>
  );
};

export { ProductCard };
