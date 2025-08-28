import { extendTheme } from "@chakra-ui/react";

const config = {
  useSystemColorMode: false,
};

export const theme = extendTheme({
  config,
  fonts: {
    heading: `'Inter', sans-serif`,
    body: `'Inter', sans-serif`,
  },
  buttons: {
    base: {
      borderRadius: "md",
      fontWeight: "semibold",
      textTransform: "uppercase",
      backgroundColor: "orange",
    },
    solid: {
      bg: "orange",
      color: "white",
      _hover: {
        bg: "primaryHover",
      },
    },
    outline: {
      border: "2px solid",
      borderColor: "primary",
      color: "primary",
      _hover: {
        bg: "primary",
        color: "white",
      },
    },
  },
});

export const lightTheme = extendTheme({
  config: {
    ...config,
    initialColorMode: "light",
  },
  fonts: {
    heading: `'Inter', sans-serif`,
    body: `'Inter', sans-serif`,
  },
});

export const darkTheme = extendTheme({
  config: {
    ...config,
    initialColorMode: "dark",
  },
  fonts: {
    heading: `'Inter', sans-serif`,
    body: `'Inter', sans-serif`,
  },
});
