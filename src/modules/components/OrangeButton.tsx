import { AddIcon } from "@chakra-ui/icons";
import { Button } from "@chakra-ui/react";

export const OrangeButton = ({
  onClick = () => {},
  text = "Create",
  leftIcon = <AddIcon />,
}) => {
  return (
    <Button
      bgColor={"orange"}
      color={"white"}
      _hover={{
        bgColor: "orange.400",
      }}
      leftIcon={leftIcon}
      onClick={onClick}
    >
      {text}
    </Button>
  );
};
