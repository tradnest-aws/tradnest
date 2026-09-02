import ar from "./ar.json"
import en from "./en.json"
import he from "./he.json"

const translations: Record<string, { translation: Record<string, unknown> }> = {
  he: {
    translation: he,
  },
  en: {
    translation: en,
  },
  ar: {
    translation: ar,
  },
}

export default translations
