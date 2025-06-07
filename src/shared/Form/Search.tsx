import { useState, useEffect, Dispatch, SetStateAction, useMemo } from "react";
import { Input, Box, Text } from "@chakra-ui/react";
import { debounce } from "lodash-es";
import { Logger } from "utils/logger";
import { useTranslate } from "utils";
import { useBrandColor } from "theme";
import { FirebaseError } from "firebase/app";

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
        if (error instanceof Error) {
          Logger.error("Search function error:", [error.message]);
        }
        if (error instanceof FirebaseError) {
          Logger.error("Firebase error in search function:", [error.message]);
        }
        setResults([]);
        setDisplayFeedback(true);
        if (error instanceof Error) {
          Logger.error("Search function error:", [error.message]);
        }
        if (error instanceof FirebaseError) {
          Logger.error("Firebase error in search function:", [error.message]);
        }
        setTimeout(() => {
          setDisplayFeedback(false);
        }, 3000);
      } finally {
        setIsLoading(false); // Set loading to false after search completes or errors
      }
    }, 1000);
  }, [searchFunction, setResults, setIsLoading, setDisplayFeedback]);

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (trimmedQuery !== "") {
      setIsLoading(true); // Set loading to true when query changes and is not empty
      debouncedSearchFunction(trimmedQuery.toLowerCase());
    } else {
      setResults([]);
      setIsLoading(false); // Set loading to false if query is empty
      debouncedSearchFunction.cancel(); // Cancel any pending debounced calls
    }

    return () => {
      debouncedSearchFunction.cancel(); // Cleanup on unmount
    };
  }, [query, debouncedSearchFunction, setIsLoading, setResults]);

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
