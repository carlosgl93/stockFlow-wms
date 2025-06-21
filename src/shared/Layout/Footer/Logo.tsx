import { HStack, Text, Image } from "@chakra-ui/react";
import { useBrandColor } from "theme";

export const Logo = () => {
  const color = useBrandColor();

  return (
    <HStack>
      <Image
        src="/favicon-96x96.png"
        alt="Transagro Logo"
        boxSize="32px"
        mr={2}
      />
      <Text color={color} fontSize="lg" fontWeight="extrabold" m={0}>
        Transagro
      </Text>
    </HStack>
  );
};
