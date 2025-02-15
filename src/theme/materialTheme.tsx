import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { ReactNode, useMemo } from "react";
import { useMediaQuery } from "@mui/material";

const commonThemeOptions = {
  typography: {
    fontFamily: `'Inter', sans-serif`,
    h1: {
      fontFamily: `'Inter', sans-serif`,
    },
    h2: {
      fontFamily: `'Inter', sans-serif`,
    },
    h3: {
      fontFamily: `'Inter', sans-serif`,
    },
    h4: {
      fontFamily: `'Inter', sans-serif`,
    },
    h5: {
      fontFamily: `'Inter', sans-serif`,
    },
    h6: {
      fontFamily: `'Inter', sans-serif`,
    },
    body1: {
      fontFamily: `'Inter', sans-serif`,
    },
    body2: {
      fontFamily: `'Inter', sans-serif`,
    },
  },
};

const lightTheme = createTheme({
  ...commonThemeOptions,
  palette: {
    mode: "light",
  },
});

const darkTheme = createTheme({
  ...commonThemeOptions,
  palette: {
    mode: "dark",
  },
});

const AppThemeProvider = ({ children }: { children: ReactNode }) => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = useMemo(
    () => (prefersDarkMode ? darkTheme : lightTheme),
    [prefersDarkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export { lightTheme, darkTheme, AppThemeProvider };
