import { ArrowBackIcon } from "@chakra-ui/icons";
import { Button } from "@chakra-ui/react";
import { useTranslate } from "utils";

export const Cancel = ({ onCancel }: { onCancel: () => void }) => {
  const { t } = useTranslate();

  return (
    <Button
      sx={{
        backgroundColor: "orange",
        mb: 2,
      }}
      onClick={onCancel}
      leftIcon={<ArrowBackIcon />}
      _hover={{
        bgColor: "orange.400",
      }}
    >
      {t("Cancel")}
    </Button>
  );
};
