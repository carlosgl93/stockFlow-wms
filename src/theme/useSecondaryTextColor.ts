import { useColorModeValue } from "@chakra-ui/react";

export const useSecondaryTextColor = () => {
  return useColorModeValue("gray", "gray");
};
