// The "Contact" panel: a lead sentence, the email, and the LinkedIn, GitHub and CV buttons.
// Lead text: src/content/contact.json. Email and links: src/content/site.json (links).
import { useContent } from '../lib/content'
import { ButtonLink, Icon } from '../components/ui'

export function Contact() {
  const c = useContent()
  return (
    <div className="max-w-3xl">
      <p className="m-0 text-xl font-medium leading-snug tracking-tight md:text-2xl">{c.contact.lead}</p>
      <a
        href={`mailto:${c.links.email}`}
        className="mt-8 block break-words text-[clamp(1.25rem,4.5vw,2.25rem)] font-semibold tracking-tight text-fg underline decoration-white/70 decoration-2 underline-offset-8"
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
