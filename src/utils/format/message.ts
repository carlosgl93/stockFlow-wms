import IntlMessageFormat, {
  PrimitiveType,
  FormatXMLElementFn,
} from "intl-messageformat";
import { useLocale } from "./LocaleProvider";
import { en, es } from "./localeDicts";

type Messages = {
  en: Record<string, string>;
  es: Record<string, string>;
};

const messages: Messages = {
  en,
  es,
};

type Format<T> =
  | Record<
      string,
      PrimitiveType | T | FormatXMLElementFn<T, string | T | (string | T)[]>
    >
  | undefined;

export function t<T = void>(message: string, values?: Format<T>) {
  const { locale } = useLocale();
  const translatedMessage = messages[locale][message] || message;
  return new IntlMessageFormat(translatedMessage, locale).format(
    values
  ) as string;
}
