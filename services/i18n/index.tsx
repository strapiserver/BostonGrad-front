import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import de from "./locales/de";
import en from "./locales/en";
import es from "./locales/es";
import fr from "./locales/fr";
import pt from "./locales/pt";
import ru from "./locales/ru";
import zh from "./locales/zh";
import type { LanguageCode, LocaleBundle } from "./types";

export { languageCodes } from "./types";
export type { LanguageCode, LocaleBundle } from "./types";

export const localeBundles: Record<LanguageCode, LocaleBundle> = {
  pt,
  en,
  ru,
  es,
  zh,
  de,
  fr,
};

const storageKey = "bostongrad-language";
const domOriginals = new WeakMap<Node, string>();
const domOriginalAttributes = new WeakMap<Element, Record<string, string>>();

type I18nValue = {
  locale: LanguageCode;
  bundle: LocaleBundle;
  setLocale: (locale: LanguageCode) => void;
  t: (source: string | null | undefined) => string;
};

const I18nContext = createContext<I18nValue>({
  locale: "ru",
  bundle: ru,
  setLocale: () => undefined,
  t: (source) => source || "",
});

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocaleState] = useState<LanguageCode>("ru");

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey) as LanguageCode | null;
    if (saved && saved in localeBundles) setLocaleState(saved);
  }, []);

  const setLocale = useCallback((nextLocale: LanguageCode) => {
    if (!(nextLocale in localeBundles)) return;
    setLocaleState(nextLocale);
    window.localStorage.setItem(storageKey, nextLocale);
  }, []);

  const bundle = localeBundles[locale];
  const t = useCallback(
    (source: string | null | undefined) => {
      if (!source) return "";
      return bundle.messages[source] || (locale === "ru" ? source : en.messages[source]) || source;
    },
    [bundle, locale],
  );

  useEffect(() => {
    document.documentElement.lang = bundle.htmlLang;
  }, [bundle.htmlLang]);

  // Covers legacy copy while components are migrated to explicit t() calls.
  // Original values are retained so switching repeatedly never translates a translation.
  useEffect(() => {
    const lookup = (source: string) =>
      bundle.messages[source] ||
      (locale === "ru" ? source : en.messages[source]) ||
      source;
    const translateElement = (root: Node) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node: Node | null;
      while ((node = walker.nextNode())) {
        if (!node.parentElement || ["SCRIPT", "STYLE"].includes(node.parentElement.tagName)) continue;
        const original = domOriginals.get(node) ?? node.textContent ?? "";
        domOriginals.set(node, original);
        const trimmed = original.trim();
        if (!trimmed) continue;
        const translated = lookup(trimmed);
        if (translated !== trimmed || locale === "ru") {
          node.textContent = original.replace(trimmed, translated);
        }
      }
      const elements = root instanceof Element ? [root, ...Array.from(root.querySelectorAll("*"))] : Array.from((root as Document).querySelectorAll?.("*") || []);
      for (const element of elements) {
        const saved = domOriginalAttributes.get(element) || {};
        for (const attribute of ["placeholder", "aria-label", "title"]) {
          const current = element.getAttribute(attribute);
          if (!current) continue;
          const original = saved[attribute] || current;
          saved[attribute] = original;
          element.setAttribute(attribute, lookup(original));
        }
        domOriginalAttributes.set(element, saved);
      }
    };
    translateElement(document.body);
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => mutation.addedNodes.forEach(translateElement));
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [bundle, locale]);

  const value = useMemo(
    () => ({ locale, bundle, setLocale, t }),
    [locale, bundle, setLocale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => useContext(I18nContext);

export const translateContent = <T,>(value: T, t: I18nValue["t"]): T => {
  if (typeof value === "string") return t(value) as T;
  if (Array.isArray(value)) {
    return value.map((item) => translateContent(item, t)) as T;
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        // Media metadata and URLs must remain byte-for-byte unchanged.
        key === "url" || key === "name" || key === "hash" || key === "path"
          ? item
          : translateContent(item, t),
      ]),
    ) as T;
  }
  return value;
};

export const useLocalizedContent = <T,>(value: T): T => {
  const { t } = useI18n();
  return useMemo(() => translateContent(value, t), [value, t]);
};
