// The "Education" panel, drawn as a timeline (layout in src/components/Timeline.tsx).
// Entries: src/content/education.json. Each entry can have a logo (see LOGOS in src/components/ui.tsx) and a school link (url).
import { useContent } from '../lib/content'
import { Timeline } from '../components/Timeline'

export function Education() {
  return <Timeline items={useContent().education} />
}
