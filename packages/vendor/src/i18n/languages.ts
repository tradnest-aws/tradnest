import { ar, enUS, he } from "date-fns/locale"
import { Language } from "./types"

export const languages: Language[] = [
  {
    code: "he",
    display_name: "עברית",
    ltr: false,
    date_locale: he,
  },
  {
    code: "en",
    display_name: "English",
    ltr: true,
    date_locale: enUS,
  },
  {
    code: "ar",
    display_name: "العربية",
    ltr: false,
    date_locale: ar,
  },
]

export const SUPPORTED_LANGUAGE_CODES = languages.map((language) => language.code)
