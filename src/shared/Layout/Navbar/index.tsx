import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Collapse,
  HStack,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";

import { Link, useNavigate } from "shared/Router";

import { useAuthStore } from "modules/auth/application";

import { DesktopNav } from "./DesktopNav";
import { LoaderBar } from "./LoaderBar";
import { MobileNav } from "./MobileNav";
import LocaleSelector from "../LocaleSelector";
import { t } from "utils";
import { Logo } from "../Footer/Logo";

export const Navbar = () => {
  const { isOpen, onToggle } = useDisclosure();
  const bg = useColorModeValue("white", "gray.800");

  return (
    <Box w="100%" position="fixed" zIndex="10">
      <Flex
        w="100%"
        minH="60px"
        py={2}
        px={4}
        borderBottom={1}
        borderStyle="solid"
        borderColor={useColorModeValue("gray.200", "gray.900")}
        align="center"
        bg={bg}
      >
        <Flex
          flex={{ base: 1, md: "auto" }}
          display={{ base: "flex", md: "none" }}
        >
          <IconButton
            onClick={onToggle}
            icon={
              isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
            }
            variant="ghost"
            aria-label="Toggle Navigation"
          />
        </Flex>
        <Flex flex={{ base: 1 }} justify={{ base: "center", md: "start" }}>
          <Box as={Link} to="/" mr={2}>
            <Logo />
          </Box>
          <Flex display={{ base: "none", md: "flex" }} ml={10}>
            <DesktopNav />
          </Flex>
        </Flex>
        <HStack direction={"row"} spacing={4} mr={4}>
          <LocaleSelector />
          <SignInButton />
          {/* <SignUpButton /> */}
          <LogoutButton />
          {/* <ToggleModeButton /> */}
        </HStack>
      </Flex>
      <LoaderBar />
      <Collapse in={isOpen} animateOpacity>
        <MobileNav />
      </Collapse>
    </Box>
  );
};

const SignInButton = () => {
  const isAuthenticated = useAuthStore((store) => store.isAuthenticated);

  if (isAuthenticated) {
    return null;
  }

  return (
    <Button
      // fontWeight={400}
      // variant="link"
      as={Link}
      to="/sign-in"
      colorScheme="orange"
    >
      {t("Sign In")}
    </Button>
  );
};

const SignUpButton = () => {
  // const notImplemented = useNotImplementedYetToast();
  const isAuthenticated = useAuthStore((store) => store.isAuthenticated);

  if (isAuthenticated) {
    return null;
  }

  return (
    <Button
      as={Link}
      to="/sign-up"
      display={{ base: "none", md: "inline-flex" }}
      colorScheme="orange"
    >
      {t("Sign Up")}
    </Button>
  );
};

const LogoutButton = () => {
  const navigate = useNavigate();

  const isAuthenticated = useAuthStore((store) => store.isAuthenticated);
  const logout = useAuthStore((store) => store.logout);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Button
      fontWeight={400}
      variant="link"
      onClick={() => logout().then(() => navigate("/"))}
    >
      {t("Logout")}
    </Button>
  );
};
