import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline, useMediaQuery } from "@mui/material";
import { ReactNode, useMemo } from "react";

// Chakra's orange.400 and orange.300 hex values
const ORANGE_400 = "#FB923C";
const ORANGE_300 = "#FDBA74";

const commonThemeOptions = {
  typography: {
    fontFamily: `'Inter', sans-serif`,
    h1: { fontFamily: `'Inter', sans-serif` },
    h2: { fontFamily: `'Inter', sans-serif` },
    h3: { fontFamily: `'Inter', sans-serif` },
    h4: { fontFamily: `'Inter', sans-serif` },
    h5: { fontFamily: `'Inter', sans-serif` },
    h6: { fontFamily: `'Inter', sans-serif` },
    body1: { fontFamily: `'Inter', sans-serif` },
    body2: { fontFamily: `'Inter', sans-serif` },
  },
};

const lightTheme = createTheme({
  ...commonThemeOptions,
  palette: {
    mode: "light",
    primary: {
      main: ORANGE_400,
    },
    secondary: {
      main: "#64748B", // Chakra's gray.500
    },
    background: {
      default: "#fff",
      paper: "#fff",
    },
    text: {
      primary: "#1A202C", // Chakra's gray.800
      secondary: "#64748B", // Chakra's gray.500
    },
  },
});

const darkTheme = createTheme({
  ...commonThemeOptions,
  palette: {
    mode: "dark",
    primary: {
      main: ORANGE_300,
    },
    secondary: {
      main: "#D1D5DB", // Chakra's gray.300
    },
    background: {
      default: "#1A202C", // Chakra's gray.800
      paper: "#2D3748", // Chakra's gray.700
    },
    text: {
      primary: "#F7FAFC", // Chakra's gray.50
      secondary: "#D1D5DB", // Chakra's gray.300
    },
  },
});

const AppThemeProvider = ({ children }: { children: ReactNode }) => {
  // Use system color mode preference
  // const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  // const theme = useMemo(
  // () => (prefersDarkMode ? darkTheme : lightTheme),
  // [prefersDarkMode]
  // );

  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export { lightTheme, darkTheme, AppThemeProvider };
