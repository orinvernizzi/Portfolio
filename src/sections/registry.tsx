import type { ComponentType } from 'react'
import { Intro } from './Intro'
import { About } from './About'
import { Experience } from './Experience'
import { Skills } from './Skills'
import { Education } from './Education'
import { Projects } from './Projects'
import { Rowing } from './Rowing'
import { Learning } from './Learning'
import { Leadership } from './Leadership'
import { Contact } from './Contact'

// Section id (from the content JSON) -> component, shared by the panel and list view.
export const SECTION_VIEWS: Record<string, ComponentType> = {
  intro: () => <Intro />,
  about: About,
  experience: Experience,
  skills: Skills,
  education: Education,
  projects: Projects,
  rowing: Rowing,
  learning: Learning,
  leadership: Leadership,
  contact: Contact,
}
