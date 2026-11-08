import { useContent } from '../lib/content'
import { ButtonLink, Icon } from '../components/ui'

export function Contact() {
  const c = useContent()
  return (
    <div className="max-w-3xl">
      <p className="m-0 text-2xl font-semibold leading-snug tracking-tight md:text-3xl">{c.contact.lead}</p>
      <a
        href={`mailto:${c.links.email}`}
        className="display mt-8 block break-words text-[clamp(1.5rem,5.5vw,3rem)] text-fg underline decoration-accent decoration-4 underline-offset-8"
      >
        {c.links.email}
      </a>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href={c.links.linkedin} external>
          LinkedIn
          <Icon name="arrow" />
        </ButtonLink>
        <ButtonLink href={c.links.github} external>
          GitHub
          <Icon name="arrow" />
        </ButtonLink>
        <ButtonLink href={c.links.cv} primary download>
          <Icon name="download" />
          {c.ui.downloadCv}
        </ButtonLink>
      </div>
    </div>
  )
}
