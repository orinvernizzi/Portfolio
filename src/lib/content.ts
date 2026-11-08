import { useTranslation } from 'react-i18next'
import type { Lang } from '../i18n'

export interface Block {
  period: string
  title?: string
  role?: string
  org?: string
  place?: string
  logo?: 'itti' | 'marietta'
  bullets?: string[]
  text?: string
}

export interface Project {
  id: string
  title: string
  tag: string
  text: string
  stack: string[]
  live?: string
  code?: string
}

export interface Content {
  ui: Record<
    'spiral' | 'list' | 'menu' | 'close' | 'scrollHint' | 'downloadCv' | 'lang' | 'open' | 'viewCode' | 'links' | 'tech',
    string
  >
  alt: Record<'portrait' | 'hocr' | 'paraguay' | 'itti' | 'marietta', string>
  art: {
    orquestador: Record<'question' | 'planner' | 'sql' | 'analyst' | 'report', string>
    forecast: Record<'forecast' | 'actual' | 'anomaly', string>
    dashboard: Record<'transactions' | 'active' | 'trend', string>
  }
  meta: { title: string; description: string; name: string; role: string; tagline: string; location: string }
  links: { email: string; linkedin: string; github: string; cv: string }
  sections: { id: string; title: string }[]
  about: { lead: string; points: string[] }
  experience: Block[]
  skills: { groups: { title: string; items: string[] }[]; other: string[]; languages: string }
  education: Block[]
  projects: Project[]
  rowing: { lead: string; medals: string[] }
  learning: { lead: string; points: string[] }
  leadership: Block[]
  contact: { lead: string }
}

export function useLang(): Lang {
  const { i18n } = useTranslation()
  return i18n.resolvedLanguage === 'es' ? 'es' : 'en'
}

export function useContent(): Content {
  const { i18n } = useTranslation()
  const lang = i18n.resolvedLanguage === 'es' ? 'es' : 'en'
  return i18n.getResourceBundle(lang, 'translation') as Content
}
