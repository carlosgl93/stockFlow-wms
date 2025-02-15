import { DeleteIcon } from "@chakra-ui/icons";
import { Button } from "@chakra-ui/react";
import { UseMutateFunction } from "@tanstack/react-query";
import { ValidationError } from "shared/Error";
import { useTranslate } from "utils";

export const Delete = ({
  onRemove,
}: {
  onRemove:
    | (() => void)
    | UseMutateFunction<void, ValidationError, string, unknown>;
}) => {
  const { t } = useTranslate();

  return (
    <Button onClick={() => onRemove} leftIcon={<DeleteIcon />}>
      {t("Delete")}
    </Button>
  );
};
