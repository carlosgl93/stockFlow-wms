import { ChevronRightIcon } from "@chakra-ui/icons";
import {
  Box,
  Flex,
  Icon,
  Link as ChLink,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useBrandColor } from "theme";

import { Link, useLocation } from "shared/Router";

import { INavItem } from "./INavItem";
import { useNavItems } from "./useNavItems";
import { useTranslate } from "utils";

export const DesktopNav = () => {
  const { pathname } = useLocation();
  const navItems = useNavItems();

  const linkColor = useColorModeValue("gray.600", "gray.200");
  const popoverContentBgColor = useColorModeValue("white", "gray.800");
  const brandColor = useBrandColor();
  const { t } = useTranslate();

  return (
    <Box maxW={"90vw"}>
      <Stack direction="row" spacing={4}>
        {navItems.map((navItem) => (
          <Box key={navItem.label}>
            <Popover trigger="hover" placement="bottom-start">
              <PopoverTrigger>
                {navItem.href ? (
                  <ChLink
                    as={Link}
                    p={2}
                    to={navItem.href}
                    color={pathname === navItem.href ? brandColor : linkColor}
                    _hover={{
                      color: brandColor,
                    }}
                  >
                    {t(navItem.label)}
                  </ChLink>
                ) : (
                  <ChLink
                    p={2}
                    href={navItem.href}
                    color={pathname === navItem.href ? brandColor : linkColor}
                    _hover={{
                      color: brandColor,
                    }}
                  >
                    {t(navItem.label)}
                  </ChLink>
                )}
              </PopoverTrigger>
              <PopoverContentWrapper
                navItem={navItem}
                popoverContentBgColor={popoverContentBgColor}
              />
            </Popover>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

const PopoverContentWrapper = ({
  navItem,
  popoverContentBgColor,
}: {
  navItem: INavItem;
  popoverContentBgColor: string;
}) => {
  if (!navItem.children) {
    return null;
  }

  return (
    <PopoverContent
      border={0}
      boxShadow={"xl"}
      bg={popoverContentBgColor}
      p={4}
      rounded={"xl"}
      minW={"sm"}
    >
      <Stack>
        {navItem.children.map((child) => (
          <DesktopSubNav key={child.label} {...child} />
        ))}
      </Stack>
    </PopoverContent>
  );
};

const DesktopSubNav = ({ label, href, subLabel }: INavItem) => {
  const brandColor = useBrandColor();

  const { t } = useTranslate();

  return (
    <ChLink
      href={href}
      // target="_blank"
      rel="noreferrer noopener"
      role="group"
      display="block"
      p={2}
      rounded="md"
      _hover={{ bg: useColorModeValue("orange.50", "gray.900") }}
    >
      <Stack direction="row" align="center">
        <Box>
          <Text
            transition="all .3s ease"
            _groupHover={{ color: brandColor }}
            fontWeight="bold"
          >
            {t(label)}
          </Text>
          {subLabel && <Text fontSize={"sm"}>{t(subLabel)}</Text>}
        </Box>
        <Flex
          transition="all .3s ease"
          transform="translateX(-10px)"
          opacity={0}
          _groupHover={{ opacity: "100%", transform: "translateX(0)" }}
          justify="flex-end"
          align="center"
          flex={1}
        >
          <Icon color={brandColor} w={5} h={5} as={ChevronRightIcon} />
        </Flex>
      </Stack>
    </ChLink>
  );
};
