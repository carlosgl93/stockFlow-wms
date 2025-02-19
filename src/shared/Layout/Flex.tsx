import { Box, BoxProps } from "@chakra-ui/react";

interface FlexBoxProps extends BoxProps {
  children: React.ReactNode;
}

export const FlexBox = ({ children, ...props }: FlexBoxProps) => {
  return (
    <Box
      display={"flex"}
      justifyContent={"space-between"}
      alignItems={"center"}
      {...props}
    >
      {children}
    </Box>
  );
};

export const FlexColumn = ({ children, ...props }: FlexBoxProps) => {
  return (
    <Box display={"flex"} flexDirection={"column"} {...props}>
      {children}
    </Box>
  );
};
