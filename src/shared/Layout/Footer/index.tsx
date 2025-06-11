import { ReactNode } from "react";
import {
  Box,
  Container,
  Link,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { Logo } from "./Logo";
import { useTranslate } from "utils";
import { useAuthStore } from "modules/auth/application";

export const Footer = () => {
  const bg = useColorModeValue("gray.50", "gray.900");
  const color = useColorModeValue("gray.700", "gray.200");
  const { t } = useTranslate();
  const isAuthenticated = useAuthStore((store) => store.isAuthenticated);
  return (
    <Box bg={bg} color={color}>
      <Container as={Stack} maxW="1340px" py={10}>
        <SimpleGrid
          templateColumns={{
            sm: "1fr 1fr",
            md: isAuthenticated ? "2fr 1fr 1fr" : "2fr",
          }}
          spacing={8}
        >
          <Stack spacing={3}>
            <Box>
              <Logo />
            </Box>
            <Text fontSize="sm">
              © {new Date().getFullYear()} Stockflow. {t("All rights reserved")}
            </Text>
          </Stack>
          {isAuthenticated && (
            <Stack align="flex-start">
              <ListHeader>{t("Stock")}</ListHeader>
              <Link href="/places">{t("Places")}</Link>
              <Link href="/stock">{t("Products inventory")}</Link>
              <Link href="/historic">{t("Historic Inventory")}</Link>
            </Stack>
          )}
          {isAuthenticated && (
            <Stack align="flex-start">
              <ListHeader>{t("Products")}</ListHeader>
              <Link href="/products">{t("Manage your products")}</Link>
              <Link href="/entries">{t("Entries")}</Link>
              <Link href="/dispatches">{t("Dispatches")}</Link>
            </Stack>
          )}
        </SimpleGrid>
      </Container>
    </Box>
  );
};

const ListHeader = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslate();
  return (
    <Text fontWeight="500" fontSize="lg" mb={2}>
      {typeof children === "string" ? t(children) : children}
    </Text>
  );
};
