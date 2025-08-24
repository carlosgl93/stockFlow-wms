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
  useMediaQuery,
  VStack,
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
  const { isOpen, onToggle, onClose } = useDisclosure();
  const bg = useColorModeValue("white", "gray.800");
  const isMobile = useMediaQuery("(max-width: 32em)")[0];
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
        bg={"white"}
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
        <HStack
          spacing={2}
          mr={{ base: 0, md: 4 }}
          display={{ base: "none", md: "flex" }}
        >
          <LocaleSelector />
          <SignInButton />
          <SignUpButton />
          <LogoutButton />
        </HStack>
      </Flex>
      <LoaderBar />
      {/* Mobile navigation */}
      <Collapse in={isOpen} animateOpacity>
        <Box
          pb={4}
          px={4}
          display={{ md: "none" }}
          bg={bg}
          borderBottom="1px solid"
          borderColor={useColorModeValue("gray.200", "gray.900")}
        >
          <VStack align="stretch" spacing={3}>
            <MobileNav />
            <LocaleSelector />
            <SignInButton mobile onClick={onClose} />
            {/* <SignUpButton mobile onClick={onClose} /> */}
            <LogoutButton mobile onClick={onClose} />
          </VStack>
        </Box>
      </Collapse>
    </Box>
  );
};

const SignInButton = ({
  mobile = false,
  onClick,
}: {
  mobile?: boolean;
  onClick?: () => void;
}) => {
  const isAuthenticated = useAuthStore((store) => store.isAuthenticated);

  if (isAuthenticated) {
    return null;
  }

  return (
    <Button
      as={Link}
      to="/sign-in"
      colorScheme="orange"
      w={mobile ? "100%" : undefined}
      size={mobile ? "md" : "sm"}
      display={
        mobile
          ? { base: "flex", md: "none" }
          : { base: "none", md: "inline-flex" }
      }
      onClick={mobile ? onClick : undefined}
    >
      {t("Sign In")}
    </Button>
  );
};

const SignUpButton = ({
  mobile = false,
  onClick,
}: {
  mobile?: boolean;
  onClick?: () => void;
}) => {
  const isAuthenticated = useAuthStore((store) => store.isAuthenticated);

  if (isAuthenticated) {
    return null;
  }

  return (
    <Button
      as={Link}
      to="/sign-up"
      colorScheme="orange"
      w={mobile ? "100%" : undefined}
      size={mobile ? "md" : "sm"}
      display={
        mobile
          ? { base: "flex", md: "none" }
          : { base: "none", md: "inline-flex" }
      }
      onClick={mobile ? onClick : undefined}
    >
      {t("Sign Up")}
    </Button>
  );
};

const LogoutButton = ({
  mobile = false,
  onClick,
}: {
  mobile?: boolean;
  onClick?: () => void;
}) => {
  const navigate = useNavigate();

  const isAuthenticated = useAuthStore((store) => store.isAuthenticated);
  const logout = useAuthStore((store) => store.logout);

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate("/");
    if (mobile && onClick) onClick();
  };

  return (
    <Button
      fontWeight={600}
      color={"orange.300"}
      variant="link"
      onClick={mobile ? handleLogout : () => logout().then(() => navigate("/"))}
      w={mobile ? "100%" : undefined}
      size={mobile ? "md" : "sm"}
      display={
        mobile
          ? { base: "flex", md: "none" }
          : { base: "none", md: "inline-flex" }
      }
    >
      {t("Logout")}
    </Button>
  );
};
