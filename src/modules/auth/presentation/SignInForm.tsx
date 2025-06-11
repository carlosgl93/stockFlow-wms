import {
  Box,
  Checkbox,
  Stack,
  Link,
  Button,
  Heading,
  useColorModeValue,
  VStack,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  useToast,
} from "@chakra-ui/react";
import { useForm, Controller } from "react-hook-form";
import { useSecondaryTextColor } from "theme";
import { useAuthStore } from "../application";
import { useSignInNotifications } from "./useSignInNotifications";
import { useTranslate } from "utils";
import { useMutation } from "@tanstack/react-query";
import { ValidationError } from "shared/Error";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import { FirebaseError } from "firebase/app";

interface IProps {
  initialEmail?: string;
  initialPassword?: string;
}

interface SignInFormValues {
  email: string;
  password: string;
}

export const SignInForm = ({ initialEmail, initialPassword }: IProps) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignInFormValues>();
  const login = useAuthStore((store) => store.login);
  const { t } = useTranslate();
  const toast = useToast();
  const [isResetting, setIsResetting] = useState(false);

  const loginMutation = useMutation(["login"], login, {
    onError: (error: ValidationError) => {
      toast({
        title: t(`There was an error signing in ${error.message}`),
        status: "error",
        isClosable: true,
      });
    },

    onSuccess: () => {
      toast({
        title: t("Sign in successful"),
        status: "success",
        isClosable: true,
      });
    },
  });

  const onSubmit = (data: SignInFormValues) => {
    loginMutation.mutate({ email: data.email, password: data.password });
  };

  const handleForgotPassword = async () => {
    const email = control._formValues.email || initialEmail || "";
    if (!email) {
      toast({
        title: t("Please enter your email to reset your password."),
        status: "warning",
        isClosable: true,
      });
      return;
    }
    setIsResetting(true);
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      toast({
        title: t("Password reset email sent!"),
        description: t("Check your inbox for instructions."),
        status: "success",
        isClosable: true,
      });
    } catch (error) {
      if (error instanceof FirebaseError) {
        let description = error.message;
        switch (error.code) {
          case "auth/user-not-found":
            description = t("No user found with this email address.");
            break;
          case "auth/invalid-email":
            description = t("The email address is not valid.");
            break;
          case "auth/missing-email":
            description = t("Please enter your email address.");
            break;
          default:
            description = error.message || t("Please try again later.");
        }
        toast({
          title: t("Failed to send password reset email."),
          description,
          status: "error",
          isClosable: true,
        });
      } else {
        toast({
          title: t("Failed to send password reset email."),
          description: t("An unknown error occurred. Please try again later."),
          status: "error",
          isClosable: true,
        });
      }
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <VStack align="stretch" spacing={8} w="100%" maxW="lg">
      <VStack textAlign="center">
        <Heading fontSize={{ base: "2xl", md: "4xl" }}>
          {t("Sign in to your account")}
        </Heading>
        {/* <Text fontSize={{ base: "md", md: "lg" }} color={secondaryColor}>
          {t("to enjoy all of our cool {link} ✌️", {
            link: <Link color={"blue.400"}>{t("features")}</Link>,
          })}
        </Text> */}
      </VStack>
      <Box
        rounded="lg"
        bg={useColorModeValue("white", "gray.700")}
        boxShadow="lg"
        p={{ base: 6, md: 8 }}
      >
        <VStack as="form" spacing={4} onSubmit={handleSubmit(onSubmit)}>
          <FormControl isInvalid={!!errors.email}>
            <FormLabel htmlFor="email">{t("Email")}</FormLabel>
            <Controller
              name="email"
              control={control}
              rules={{
                required: t("Email is required"),
              }}
              render={({ field }) => (
                <Input id="email" {...field} placeholder={t("Email")} />
              )}
            />
            <FormErrorMessage>
              {errors.email && errors.email.message}
            </FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.password}>
            <FormLabel htmlFor="password">{t("Password")}</FormLabel>
            <Controller
              name="password"
              control={control}
              rules={{
                required: t("Password is required"),
              }}
              render={({ field }) => (
                <Input
                  id="password"
                  type="password"
                  {...field}
                  placeholder={t("Password")}
                />
              )}
            />
            <FormErrorMessage>
              {errors.password && errors.password.message}
            </FormErrorMessage>
          </FormControl>

          <VStack w="100%" spacing={10}>
            <Stack
              w="100%"
              direction={{ base: "column", sm: "row" }}
              align="start"
              justify="space-between"
            >
              <Checkbox>{t("Remember me")}</Checkbox>
              <Link
                color="blue.400"
                onClick={handleForgotPassword}
                style={{
                  cursor: isResetting ? "not-allowed" : "pointer",
                  pointerEvents: isResetting ? "none" : "auto",
                }}
              >
                {t("Forgot password?")}
              </Link>
            </Stack>
            <Button
              type="submit"
              colorScheme="orange"
              w="100%"
              disabled={loginMutation.isLoading}
            >
              {t("Sign in")}
            </Button>
          </VStack>
        </VStack>
      </Box>
    </VStack>
  );
};
