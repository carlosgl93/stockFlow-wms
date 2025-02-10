import { useState } from "react";

import {
  Box,
  Checkbox,
  Stack,
  Link,
  Button,
  Heading,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { useSecondaryTextColor } from "theme";

import { t } from "utils";

import { TextInput } from "shared/Form";

import { useAuthStore } from "../application";
import { useSignInNotifications } from "./useSignInNotifications";

interface IProps {
  initialEmail?: string;
  initialPassword?: string;
}

export const SignInForm = ({ initialEmail, initialPassword }: IProps) => {
  const secondaryColor = useSecondaryTextColor();

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState(initialPassword);

  const [notifySuccess, notifyFailure] = useSignInNotifications();
  const login = useAuthStore((store) => store.login);

  return (
    <VStack align="stretch" spacing={8} w="100%" maxW="lg">
      <VStack textAlign="center">
        <Heading fontSize={{ base: "2xl", md: "4xl" }}>
          {t("Sign in to your account")}
        </Heading>
        <Text fontSize={{ base: "md", md: "lg" }} color={secondaryColor}>
          {t("to enjoy all of our cool {link} ✌️", {
            link: <Link color={"blue.400"}>{t("features")}</Link>,
          })}
        </Text>
      </VStack>
      <Box
        rounded="lg"
        bg={useColorModeValue("white", "gray.700")}
        boxShadow="lg"
        p={{ base: 6, md: 8 }}
      >
        <VStack
          as="form"
          spacing={4}
          onSubmit={(e) => {
            e.preventDefault();

            if (!email || !password) {
              return;
            }

            login({ email, password })
              .then(() => notifySuccess())
              .catch(() => notifyFailure());
          }}
        >
          <TextInput
            id="email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
          >
            {t("Email")}
          </TextInput>
          <TextInput
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
          >
            {t("Password")}
          </TextInput>
          <VStack w="100%" spacing={10}>
            <Stack
              w="100%"
              direction={{ base: "column", sm: "row" }}
              align="start"
              justify="space-between"
            >
              <Checkbox>{t("Remember me")}</Checkbox>
              <Link color="blue.400">{t("Forgot password?")}</Link>
            </Stack>
            <Button type="submit" colorScheme="blue" w="100%">
              {t("Sign in")}
            </Button>
          </VStack>
        </VStack>
      </Box>
    </VStack>
  );
};
