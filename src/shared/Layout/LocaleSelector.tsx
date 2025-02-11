import React from "react";
import { LocaleEnum, useLocale } from "utils";

const LocaleSelector: React.FC = () => {
  const { locale, setLocale } = useLocale();

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as LocaleEnum)}
    >
      <option value="en">English</option>
      <option value="es">Español</option>
    </select>
  );
};

export default LocaleSelector;
