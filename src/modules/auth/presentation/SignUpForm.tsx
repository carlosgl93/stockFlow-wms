import {
  Box,
  Button,
  Heading,
  VStack,
  useColorModeValue,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { useForm, Controller } from "react-hook-form";
import { useAuthStore } from "../application";
import { useSignUpNotifications } from "./useSignUpNotifications";
import { useTranslate } from "utils";

interface IProps {
  initialEmail?: string;
  initialPassword?: string;
}

interface SignUpFormValues {
  email: string;
  password: string;
  confirmPassword: string;
}

export const SignUpForm = ({ initialEmail, initialPassword }: IProps) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<SignUpFormValues>();
  const [notifySuccess, notifyFailure] = useSignUpNotifications();
  const signup = useAuthStore((store) => store.signup);
  const { t } = useTranslate();

  const onSubmit = (data: SignUpFormValues) => {
    if (data.password !== data.confirmPassword) {
      return;
    }

    signup({ email: data.email, password: data.password })
      .then(() => notifySuccess())
      .catch(() => notifyFailure());
  };

  const password = watch("password");

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
        <VStack as="form" spacing={4} onSubmit={handleSubmit(onSubmit)}>
          <FormControl isInvalid={!!errors.email}>
            <FormLabel htmlFor="email">{t("Email")}</FormLabel>
            <Controller
              name="email"
              control={control}
              defaultValue={initialEmail || ""}
              rules={{
                required: t("Email is required"),
                minLength: {
                  value: 6,
                  message: t("Email must be at least 6 characters"),
                },
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
                minLength: {
                  value: 6,
                  message: t("Password must be at least 6 characters"),
                },
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

          <FormControl isInvalid={!!errors.confirmPassword}>
            <FormLabel htmlFor="confirmPassword">
              {t("Confirm Password")}
            </FormLabel>
            <Controller
              name="confirmPassword"
              control={control}
              defaultValue=""
              rules={{
                required: t("Confirm Password is required"),
                minLength: {
                  value: 6,
                  message: t("Confirm Password must be at least 6 characters"),
                },
                validate: (value) =>
                  value === password || t("Passwords do not match"),
              }}
              render={({ field }) => (
                <Input
                  id="confirmPassword"
                  type="password"
                  {...field}
                  placeholder={t("Confirm Password")}
                />
              )}
            />
            <FormErrorMessage>
              {errors.confirmPassword && errors.confirmPassword.message}
            </FormErrorMessage>
          </FormControl>

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
