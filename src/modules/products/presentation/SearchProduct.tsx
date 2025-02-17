import { useState, useEffect } from "react";
import { Input, Box, Text } from "@chakra-ui/react";
import { searchProduct } from "../infrastructure/searchProduct";
import { IProduct } from "../types";
import { debounce } from "lodash-es";
import { Logger } from "utils/logger";
import { useTranslate } from "utils";
import { useBrandColor } from "theme";

interface SearchProductProps {
  setResults: (products: IProduct[]) => void;
}

export const SearchProduct = ({ setResults }: SearchProductProps) => {
  const [query, setQuery] = useState("");
  const textColor = useBrandColor();
  const [displayFeedback, setDisplayFeedback] = useState(false);
  const { t } = useTranslate();

  const handleSearch = debounce(async (name: string) => {
    const products = await searchProduct(name);
    Logger.info("Products found: ", products);
    if (products.length) {
      setResults(products);
    } else {
      setDisplayFeedback(true);
      setTimeout(() => {
        setDisplayFeedback(false);
      }, 3000);
    }
  }, 300);

  useEffect(() => {
    if (query.trim() !== "") {
      handleSearch(query);
    } else {
      setResults([]);
    }
  }, [query]);

  return (
    <Box>
      <Input
        placeholder={t("Search for a product")}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {displayFeedback && (
        <Box px={2} py={1}>
          <Text color={textColor}>{t("No products found")}</Text>
        </Box>
      )}
    </Box>
  );
};
