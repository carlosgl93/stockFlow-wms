import { ReactNode } from "react";

import { ChakraProvider } from "@chakra-ui/react";
import { QueryClientProvider } from "@tanstack/react-query";

import { LocaleProvider, queryClient } from "utils";

import { AuthProvider } from "modules/auth/application";
import { lightTheme } from "theme/theme";

interface IProps {
  children: ReactNode;
}

const Providers = ({ children }: IProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={lightTheme}>
        <LocaleProvider>
          <AuthProvider>{children}</AuthProvider>
        </LocaleProvider>
      </ChakraProvider>
    </QueryClientProvider>
  );
};

export { Providers };
