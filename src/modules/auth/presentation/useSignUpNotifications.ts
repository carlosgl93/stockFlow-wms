import { t, useTranslate } from "utils";
import { useToast } from "shared/Toast";

export const useSignUpNotifications = () => {
  const toast = useToast();
  const { t } = useTranslate();

  const success = () =>
    toast({
      status: "success",
      title: t("Sign up"),
      description: t("Account created successfully."),
    });

  const failure = () =>
    toast({
      status: "error",
      title: t("Sign up"),
      description: t(
        "Something went wrong while signing up. Please try again or contact us."
      ),
    });

  return [success, failure] as const;
};
