import { useTranslation } from 'react-i18next'
import type { Lang } from '../i18n'

export interface Block {
  period: string
  title?: string
  role?: string
  org?: string
  place?: string
  logo?: 'itti' | 'marietta' | 'cambridge' | 'cristorey' | 'techo'
  url?: string
  urlOn?: 'title'
  photos?: ('techo1' | 'techo2')[]
  bullets?: string[]
  text?: string
}

export interface Medal {
  medals: ('silver' | 'bronze')[]
  label: string
  event: string
  place: string
  year: number
}

export interface Project {
  id: string
  group: string
  title: string
  tag: string
  text: string
  details: string[]
  stack: string[]
  note?: string
  legal?: string
  live?: string
  code?: string
  codeLabel?: string
  image?: 'svg' | 'webp'
}

interface Content {
  ui: Record<
    'spiral' | 'list' | 'menu' | 'close' | 'scrollHint' | 'downloadCv' | 'lang' | 'open' | 'viewCode' | 'newTab' | 'links' | 'tech' | 'badgeRing' | 'badgeLabel' | 'reelTitle' | 'reelPrev' | 'reelNext' | 'reelPause' | 'reelPlay' | 'reelCounter',
    string
  >
  alt: Record<'portrait' | 'hocr' | 'paraguay' | 'itti' | 'marietta' | 'cambridge' | 'cristorey' | 'techo' | 'techo1' | 'techo2', string>
  art: Record<string, { label: string }>
  meta: { title: string; description: string; name: string; role: string; tagline: string; location: string }
  links: { email: string; linkedin: string; github: string; cv: string }
  sections: { id: string; title: string }[]
  about: { lead: string; points: string[] }
  experience: Block[]
  skills: { groups: { title: string; items: string[] }[]; other: string[]; languages: string }
  education: Block[]
  projects: { groups: { id: string; title: string }[]; items: Project[] }
  rowing: { lead: string; rosterUrl: string; rosterLabel: string; medals: Medal[] }
  learning: { lead: string; points: string[] }
  leadership: { lead: string; items: Block[] }
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
