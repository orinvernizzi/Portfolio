import { useContent } from '../lib/content'
import { Timeline } from '../components/Timeline'

export function Education() {
  return <Timeline items={useContent().education} />
}
