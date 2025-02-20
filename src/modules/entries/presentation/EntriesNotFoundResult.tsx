import { Button, ButtonGroup } from "@chakra-ui/react";

import { t } from "utils";

import { ContactUsButton, Result, WarningIcon } from "shared/Result";
import { useNavigate } from "shared/Router";

export const EntriesNotFoundResult = () => {
  const navigate = useNavigate();

  return (
    <Result
      image={<WarningIcon />}
      heading={t("Entry doesn't exist")}
      subheading={t(
        "Probably this entry is no more for a sale or you just got here by accident. If you think there is something wrong on our side, please contact us!"
      )}
    >
      <ButtonGroup>
        <ContactUsButton />
        <Button onClick={() => navigate("/entrys")}>
          {t("Back to entrys' list")}
        </Button>
      </ButtonGroup>
    </Result>
  );
};
