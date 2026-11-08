import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './content/en.json'
import es from './content/es.json'

export type Lang = 'en' | 'es'
const STORAGE_KEY = 'portfolio-lang'

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'en' || saved === 'es') return saved
  } catch {
    // storage blocked: fall through to the browser language
  }
  return navigator.language?.toLowerCase().startsWith('es') ? 'es' : 'en'
}

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, es: { translation: es } },
  lng: initialLang(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

function syncDocument(lng: string) {
  const meta = lng === 'es' ? es.meta : en.meta
  document.documentElement.lang = lng
  document.title = meta.title
  document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description)
}

syncDocument(i18n.language)
i18n.on('languageChanged', syncDocument)

export function setLanguage(lang: Lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    // choice just won't be remembered
  }
  void i18n.changeLanguage(lang)
}

export default i18n
