import { ReactNode } from "react";

import {
  Stack,
  VStack,
  Heading,
  Text,
  ButtonGroup,
  HeadingProps,
} from "@chakra-ui/react";
import { useBrandColor, useSecondaryTextColor } from "theme";

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
  const colors = useBrandColor();
  return (
    <Stack
      direction={{ base: "column", lg: "row" }}
      w="100%"
      spacing={3}
      justify="space-between"
      align={{ base: "start", lg: "center" }}
      position={position}
      padding={4}
      borderRadius={6}
    >
      <VStack align="start" spacing={1}>
        <Heading size={size} color={secondaryColor}>
          {title}
        </Heading>
        {description && <Text color={descriptionColor}>{description}</Text>}
      </VStack>
      <ButtonGroup>{children}</ButtonGroup>
    </Stack>
  );
};

export { PageHeader };
