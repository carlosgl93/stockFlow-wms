import React from "react";
import { LocaleEnum, useLocale } from "utils";

const LocaleSelector: React.FC = () => {
  const { locale, setLocale } = useLocale();

  return (
    <select
      style={{
        padding: "0.5rem",
        borderRadius: "0.25rem",
        border: "1px solid #ccc",
        backgroundColor: "#fff",
        color: "#333",
      }}
      value={locale}
      onChange={(e) => setLocale(e.target.value as LocaleEnum)}
    >
      <option value="en">English</option>
      <option value="es">Español</option>
    </select>
  );
};

export default LocaleSelector;
