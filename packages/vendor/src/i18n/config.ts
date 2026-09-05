import { InitOptions } from "i18next"

import { SUPPORTED_LANGUAGE_CODES } from "./languages"

export const defaultI18nOptions: InitOptions = {
  debug: process.env.NODE_ENV === "development",
  detection: {
    caches: ["cookie", "localStorage"],
    lookupCookie: "lng",
    lookupLocalStorage: "lng",
    order: ["cookie", "localStorage"],
  },
  fallbackLng: "he",
  supportedLngs: SUPPORTED_LANGUAGE_CODES,
  nonExplicitSupportedLngs: true,
  load: "languageOnly",
  fallbackNS: "translation",
  interpolation: {
    escapeValue: false,
  }
}
