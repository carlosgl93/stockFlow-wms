import { ReactNode } from "react";

import { ChakraProvider } from "@chakra-ui/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { theme } from "theme";

import { LocaleProvider, queryClient } from "utils";

import { AuthProvider } from "modules/auth/application";
import { ThemeProvider } from "@mui/material";
import { AppThemeProvider } from "theme/materialTheme";

interface IProps {
  children: ReactNode;
}

const Providers = ({ children }: IProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <LocaleProvider>
          <AuthProvider>{children}</AuthProvider>
        </LocaleProvider>
      </ChakraProvider>
    </QueryClientProvider>
  );
};

export { Providers };
