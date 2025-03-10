import { Center } from "@chakra-ui/react";

import { Page } from "shared/Layout";
import { ErrorPageStrategy } from "shared/Result";

import { withRequirePub } from "modules/auth/application";
import { SignUpForm } from "modules/auth/presentation";

export const SignUpPage = () => {
  return (
    <Page maxW="container.xl">
      <Center py={{ base: 10, md: 12 }}>
        <SignUpForm initialEmail="admin@gmail.com" initialPassword="123456" />
      </Center>
    </Page>
  );
};

export const Component = withRequirePub(SignUpPage, { to: "/products" });

export const ErrorBoundary = ErrorPageStrategy;
