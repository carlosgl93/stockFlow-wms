import { useState } from "react";
import {
  Box,
  Button,
  Heading,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { TextInput } from "shared/Form";
import { useAuthStore } from "../application";
import { useSignUpNotifications } from "./useSignUpNotifications";
import { useTranslate } from "utils";

interface IProps {
  initialEmail?: string;
  initialPassword?: string;
}

export const SignUpForm = ({ initialEmail, initialPassword }: IProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [notifySuccess, notifyFailure] = useSignUpNotifications();
  const signup = useAuthStore((store) => store.signup);
  const { t } = useTranslate();

  return (
    <VStack align="stretch" spacing={8} w="100%" maxW="lg">
      <VStack textAlign="center">
        <Heading fontSize={{ base: "2xl", md: "4xl" }}>
          {t("Sign up for an account")}
        </Heading>
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

            if (!email || !password || password !== confirmPassword) {
              return;
            }

            signup({ email, password })
              .then(() => notifySuccess())
              .catch(() => notifyFailure());
          }}
        >
          <TextInput
            id="email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            placeholder={initialEmail}
          >
            {t("Email")}
          </TextInput>
          <TextInput
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            placeholder={initialPassword}
          >
            {t("Password")}
          </TextInput>
          <TextInput
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.currentTarget.value)}
          >
            {t("Confirm Password")}
          </TextInput>

          <VStack w="100%" spacing={10}>
            <Button type="submit" colorScheme="blue" w="100%">
              {t("Sign up")}
            </Button>
          </VStack>
        </VStack>
      </Box>
    </VStack>
  );
};
