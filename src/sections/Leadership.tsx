// The "Leadership" panel: a lead sentence and a timeline.
// Text: src/content/leadership.json. Photos on an entry are named techo1 or techo2 and point to files in src/components/Timeline.tsx.
import { useContent } from '../lib/content'
import { Timeline } from '../components/Timeline'

export function Leadership() {
  const { leadership } = useContent()
  return (
    <div className="grid gap-8">
      <p className="m-0 max-w-3xl text-xl font-medium leading-snug tracking-tight md:text-2xl">{leadership.lead}</p>
      <Timeline items={leadership.items} />
    </div>
  )
}
