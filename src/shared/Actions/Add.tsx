import { AddIcon } from "@chakra-ui/icons";
import { Button } from "@chakra-ui/react";
import { useTranslate } from "utils";

export const AddButton = ({ onAdd }: { onAdd: () => void }) => {
  const { t } = useTranslate();

  return (
    <Button onClick={onAdd} leftIcon={<AddIcon />}>
      {t("Add")}
    </Button>
  );
};
