import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import { defaultI18nOptions } from "../../../i18n/config";
import { languages, SUPPORTED_LANGUAGE_CODES } from "../../../i18n/languages";
import translations from "../../../i18n/translations";
import customI18nResources from "virtual:mercur/i18n";
import config from "virtual:mercur/config";

function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...target };

  for (const key of Object.keys(source)) {
    const sourceValue = source[key];
    const targetValue = target[key];
    if (
      sourceValue &&
      typeof sourceValue === "object" &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === "object" &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>,
      );
    } else {
      result[key] = sourceValue;
    }
  }

  return result;
}

const readCookieLanguage = (): string | undefined => {
  if (typeof document === "undefined") {
    return undefined;
  }

  const match = document.cookie.match(/(?:^|; )lng=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : undefined;
};

const resolveInitialLanguage = (): string => {
  const fallback = config.i18n?.defaultLanguage || "he";
  if (typeof window === "undefined") {
    return fallback;
  }

  const raw = window.localStorage.getItem("lng") || readCookieLanguage();
  if (!raw) {
    return fallback;
  }

  const code = raw.split("-")[0] ?? fallback;
  if (SUPPORTED_LANGUAGE_CODES.includes(code)) {
    return code;
  }

  window.localStorage.removeItem("lng");
  document.cookie = "lng=; Max-Age=0; path=/";
  return fallback;
};

const applyDocumentLanguage = (code: string) => {
  if (typeof document === "undefined") {
    return;
  }

  const normalized = code.split("-")[0] ?? "he";
  const language =
    languages.find((item) => item.code === code) ??
    languages.find((item) => item.code === normalized) ??
    languages[0];

  document.documentElement.lang = language.code;
  document.documentElement.dir = language.ltr ? "ltr" : "rtl";
};

const mergedTranslations = deepMerge(
  translations as Record<string, unknown>,
  customI18nResources as Record<string, unknown>,
);

export const I18n = () => {
  if (i18n.isInitialized) {
    return null;
  }

  i18n
    .use(
      new LanguageDetector(null, {
        lookupCookie: "lng",
        lookupLocalStorage: "lng",
        order: ["cookie", "localStorage"],
        caches: ["cookie", "localStorage"],
        cookieOptions: { path: "/" },
      }),
    )
    .use(initReactI18next)
    .init({
      ...defaultI18nOptions,
      lng: resolveInitialLanguage(),
      resources: mergedTranslations,
    });

  applyDocumentLanguage(i18n.language);
  i18n.on("languageChanged", applyDocumentLanguage);

  return null;
};

export { i18n };
