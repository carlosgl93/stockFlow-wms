import { SearchIcon } from "@chakra-ui/icons";
import { Button } from "@chakra-ui/react";

type SearchProps = {
  onSearch: () => void;
};

export const Search = ({ onSearch }: SearchProps) => {
  return (
    <Button onClick={onSearch}>
      <SearchIcon />
    </Button>
  );
};
