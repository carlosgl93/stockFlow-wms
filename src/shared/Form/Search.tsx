import { useState, useEffect, Dispatch, SetStateAction, useMemo } from "react";
import { Input, Box, Text } from "@chakra-ui/react";
import { debounce } from "lodash-es";
import { Logger } from "utils/logger";
import { useTranslate } from "utils";
import { useBrandColor } from "theme";
import { getHumanReadableError } from "shared/Error";

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

  const debouncedSearchFunction = useMemo(() => {
    return debounce(async (name: string) => {
      try {
        const results = await searchFunction(name);
        Logger.info("results found: ", results);
        if (results?.length) {
          setResults(results);
          setDisplayFeedback(false);
        } else {
          setResults([]);
          setDisplayFeedback(true);
          setTimeout(() => {
            setDisplayFeedback(false);
          }, 3000);
        }
      } catch (error) {
        const errorMessage = getHumanReadableError(error, t);
        Logger.error("Search function error:", [errorMessage]);
        setResults([]);
        setDisplayFeedback(true);
        setTimeout(() => {
          setDisplayFeedback(false);
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  }, [searchFunction, setResults, setIsLoading, setDisplayFeedback, t]);

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (trimmedQuery !== "") {
      setIsLoading(true);
      debouncedSearchFunction(trimmedQuery.toLowerCase());
    } else {
      setResults([]);
      setIsLoading(false);
      debouncedSearchFunction.cancel();
    }

    return () => {
      debouncedSearchFunction.cancel();
    };
  }, [query, setIsLoading, setResults]);

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
