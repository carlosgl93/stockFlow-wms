import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Collapse,
  Flex,
  Icon,
  Link as ChLink,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";

import { Link } from "shared/Router";

import { INavItem } from "./INavItem";
import { useNavItems } from "./useNavItems";
import { useTranslate } from "utils";

export const MobileNav = () => {
  const bg = useColorModeValue("white", "gray.800");
  const navItems = useNavItems();
  const { t } = useTranslate();

  return (
    <Stack
      p={4}
      display={{ md: "none" }}
      bg={bg}
      borderStyle="solid"
      borderColor={useColorModeValue("gray.200", "gray.900")}
    >
      {navItems.map((navItem) => (
        <MobileNavItem key={t(navItem.label)} {...navItem} t={t} />
      ))}
    </Stack>
  );
};

// todo: navigation: Link
const MobileNavItem = ({
  label,
  children,
  href,
  t,
}: INavItem & { t: (s: string) => string }) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Flex
        py={2}
        as={Link}
        to={href ?? ""}
        justify="space-between"
        align="center"
        _hover={{
          textDecoration: "none",
        }}
      >
        <Text
          fontWeight="bold"
          color={useColorModeValue("gray.600", "gray.200")}
        >
          {t(label)}
        </Text>
        {children && (
          <Icon
            as={ChevronDownIcon}
            transition="all .25s ease-in-out"
            transform={isOpen ? "rotate(180deg)" : ""}
            w={6}
            h={6}
          />
        )}
      </Flex>
      <Collapse in={isOpen} animateOpacity>
        <Stack
          pl={4}
          borderLeft={1}
          borderStyle="solid"
          borderColor={useColorModeValue("gray.200", "gray.700")}
          align="start"
        >
          {children &&
            children.map((child) => (
              <ChLink
                key={child.label}
                py={2}
                href={child.href}
                rel="noreferrer noopener"
              >
                {t(child.label)}
              </ChLink>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};
