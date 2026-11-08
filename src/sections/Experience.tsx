import { useContent } from '../lib/content'
import { Timeline } from '../components/Timeline'

export function Experience() {
  return <Timeline items={useContent().experience} />
}
