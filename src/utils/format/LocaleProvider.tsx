import React, { createContext, useState, useContext, ReactNode } from "react";

interface ComponentWithChildren {
  children: ReactNode;
}

export type LocaleEnum = "es" | "en";

const LocaleContext = createContext({
  locale: "es" as LocaleEnum,
  setLocale: (locale: LocaleEnum) => {},
});

export const LocaleProvider: React.FC<ComponentWithChildren> = ({
  children,
}) => {
  const [locale, setLocale] = useState<LocaleEnum>("es");

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => useContext(LocaleContext);
