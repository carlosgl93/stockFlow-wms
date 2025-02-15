import { Spinner, Center } from "@chakra-ui/react";

export const Loading = () => {
  return (
    <Center height="100vh">
      <Spinner size="xl" />
    </Center>
  );
};
