import { en } from "./en";
import { ar } from "./ar";

export type Locale = "en" | "ar";
export type TranslationDict = typeof en;

export const translations: Record<Locale, TranslationDict> = {
  en,
  ar,
};

export function getTranslation(locale: Locale): TranslationDict {
  return translations[locale] || translations.en;
}
