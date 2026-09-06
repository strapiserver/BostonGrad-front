export const languageCodes = ["pt", "en", "ru", "es", "zh", "de", "fr"] as const;

export type LanguageCode = (typeof languageCodes)[number];
export type Messages = Record<string, string>;

export type LocaleBundle = {
  code: LanguageCode;
  htmlLang: string;
  label: string;
  flag: string;
  messages: Messages;
};
