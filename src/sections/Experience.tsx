// The "Experience" panel, drawn as a timeline (layout in src/components/Timeline.tsx).
// Entries: src/content/experience.json (period, role, org, place, logo, bullets).
import { useContent } from '../lib/content'
import { Timeline } from '../components/Timeline'

export function Experience() {
  return <Timeline items={useContent().experience} />
}
