import { ReactNode } from "react";

import {
  Stack,
  VStack,
  Heading,
  Text,
  ButtonGroup,
  HeadingProps,
} from "@chakra-ui/react";
import { useSecondaryTextColor } from "theme";

interface IProps {
  title: string | ReactNode;
  description?: string | ReactNode;
  size?: HeadingProps["size"];
  children?: ReactNode;
  position?: "sticky" | "static";
}

const PageHeader = ({
  title,
  description,
  size = { base: "md", md: "lg" },
  children,
  position = "static",
}: IProps) => {
  const descriptionColor = useSecondaryTextColor();
  const secondaryColor = useSecondaryTextColor();
  return (
    <Stack
      direction={{ base: "column", lg: "row" }}
      w="100%"
      spacing={3}
      justify="space-between"
      align={{ base: "start", lg: "center" }}
      position={position}
      top={position === "sticky" ? 50 : "auto"}
      zIndex={position === "sticky" ? 1000 : "auto"}
      boxShadow={position === "sticky" ? "md" : "none"}
      bg={position === "sticky" ? "grey" : "transparent"}
      padding={4}
    >
      <VStack align="start" spacing={1}>
        <Heading size={size}>{title}</Heading>
        {description && <Text color={descriptionColor}>{description}</Text>}
      </VStack>
      <ButtonGroup>{children}</ButtonGroup>
    </Stack>
  );
};

export { PageHeader };
