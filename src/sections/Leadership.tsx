import { useContent } from '../lib/content'
import { Timeline } from '../components/Timeline'

export function Leadership() {
  return <Timeline items={useContent().leadership} />
}
