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

interface IProps {
  initialEmail?: string;
  initialPassword?: string;
}

interface SignInFormValues {
  email: string;
  password: string;
}

export const SignInForm = ({ initialEmail, initialPassword }: IProps) => {
  const secondaryColor = useSecondaryTextColor();
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignInFormValues>();
  const [notifySuccess, notifyFailure] = useSignInNotifications();
  const login = useAuthStore((store) => store.login);
  const { t } = useTranslate();
  const toast = useToast();

  const loginMutation = useMutation(["login"], login, {
    onError: (error: ValidationError) =>
      toast({
        title: "An error occurred.",
        description: `"Please try again later." ${t(error.message)}`,
        status: "error",
        duration: 9000,
        isClosable: true,
      }),
    onSuccess: () => notifySuccess(),
  });

  const onSubmit = (data: SignInFormValues) => {
    loginMutation.mutate({ email: data.email, password: data.password });
  };

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
        <VStack as="form" spacing={4} onSubmit={handleSubmit(onSubmit)}>
          <FormControl isInvalid={!!errors.email}>
            <FormLabel htmlFor="email">{t("Email")}</FormLabel>
            <Controller
              name="email"
              control={control}
              defaultValue={initialEmail || ""}
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
              defaultValue={initialPassword || ""}
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
