"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Locale, TranslationDict, getTranslation } from "./index";

interface LocaleContextType {
  locale: Locale;
  t: TranslationDict;
  toggleLocale: () => void;
  setLocale: (loc: Locale) => void;
  dir: "ltr" | "rtl";
}

const LocaleContext = createContext<LocaleContextType | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem("vs_locale") as Locale;
    if (saved === "ar" || saved === "en") {
      setLocaleState(saved);
      document.documentElement.dir = saved === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = saved;
    }
  }, []);

  const setLocale = (loc: Locale) => {
    setLocaleState(loc);
    localStorage.setItem("vs_locale", loc);
    document.documentElement.dir = loc === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = loc;
  };

  const toggleLocale = () => {
    const next = locale === "en" ? "ar" : "en";
    setLocale(next);
  };

  const t = getTranslation(locale);
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <LocaleContext.Provider value={{ locale, t, toggleLocale, setLocale, dir }}>
      <div dir={dir}>{children}</div>
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    // Graceful fallback if used outside provider
    const t = getTranslation("en");
    return {
      locale: "en" as Locale,
      t,
      toggleLocale: () => {},
      setLocale: () => {},
      dir: "ltr" as const,
    };
  }
  return context;
}
