import { ArrowBackIcon } from "@chakra-ui/icons";
import { Button } from "@chakra-ui/react";
import { useTranslate } from "utils";

export const Cancel = ({ onCancel }: { onCancel: () => void }) => {
  const { t } = useTranslate();

  return (
    <Button onClick={onCancel} leftIcon={<ArrowBackIcon />}>
      {t("Cancel")}
    </Button>
  );
};
