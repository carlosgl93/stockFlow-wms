import { AddIcon } from "@chakra-ui/icons";
import { Button } from "@chakra-ui/react";
import { useTranslate } from "utils";

type AddProps = {
  onAdd: () => void;
  text?: string;
};

export const AddButton = ({ onAdd, text }: AddProps) => {
  const { t } = useTranslate();

  if (text) {
    return (
      <Button
        sx={{
          backgroundColor: "orange",
        }}
        onClick={onAdd}
        leftIcon={<AddIcon m={0} />}
      >
        {t(text)}
      </Button>
    );
  }
  return (
    <Button
      onClick={onAdd}
      sx={{
        backgroundColor: "orange",
      }}
    >
      <AddIcon />
    </Button>
  );
};
