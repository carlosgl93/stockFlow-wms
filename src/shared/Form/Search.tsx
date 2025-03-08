import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Input, Box, Text } from "@chakra-ui/react";
import { debounce } from "lodash-es";
import { Logger } from "utils/logger";
import { useTranslate } from "utils";
import { useBrandColor } from "theme";

interface SearchProps<T> {
  setResults: Dispatch<SetStateAction<T[]>>;
  placeholderText: string;
  searchFunction: (name: string) => Promise<T[]>;
  notFoundText: string;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

export const Search = <T,>({
  setResults,
  placeholderText,
  searchFunction,
  notFoundText,
  setIsLoading,
}: SearchProps<T>) => {
  const [query, setQuery] = useState("");
  const textColor = useBrandColor();
  const [displayFeedback, setDisplayFeedback] = useState(false);
  const { t } = useTranslate();

  const handleSearch = debounce(async (name: string) => {
    setIsLoading(true);
    const results = await searchFunction(name);
    Logger.info("results found: ", results);
    if (results?.length) {
      setResults(results);
    } else {
      setDisplayFeedback(true);
      setTimeout(() => {
        setDisplayFeedback(false);
      }, 3000);
    }
    setIsLoading(false);
  }, 1000);

  useEffect(() => {
    if (query.trim() !== "") {
      handleSearch(query.toLowerCase());
    } else {
      setResults([]);
    }
  }, [query]);

  return (
    <Box w={"100%"}>
      <Input
        placeholder={t(placeholderText)}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {displayFeedback && (
        <Box px={2} py={1}>
          <Text color={textColor}>{t(notFoundText)}</Text>
        </Box>
      )}
    </Box>
  );
};
