import { Spinner, Center } from "@chakra-ui/react";

type LoadingProps = {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
};
export const Loading = ({ size }: LoadingProps) => {
  let height;
  switch (size) {
    case "xs":
      height = "10vh";
      break;
    case "sm":
      height = "25vh";
      break;
    case "md":
      height = "50vh";
      break;
    case "lg":
      height = "75vh";
      break;
    case "xl":
      height = "100vh";
      break;
    default:
      height = "100vh";
  }

  return (
    <Center height={height}>
      <Spinner size={size} />
    </Center>
  );
};
