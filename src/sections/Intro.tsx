// The "Hello" panel, and also the top of the list view on phones: name, role, tagline, location, buttons, portrait.
// Text and links: src/content/site.json (meta, links). In the list view, the tag chips under the buttons are the first 4 items of each group in skills.json.
// The portrait is /photos/portrait.webp, written in the img tag near the bottom of this file.
import { useContent } from '../lib/content'
import { ButtonLink, ChipList, Icon } from '../components/ui'

export function Intro({ hero = false }: { hero?: boolean }) {
  const c = useContent()
  const heroTech = c.skills.groups.flatMap((g) => g.items.slice(0, 4))
  const Name = hero ? 'h1' : 'p'

  return (
    <div className={`grid items-center gap-8 ${hero ? 'md:grid-cols-[1.4fr_1fr] md:gap-12' : 'md:grid-cols-[1.3fr_1fr]'}`}>
      <div>
        <Name className={`display m-0 ${hero ? 'text-[clamp(3rem,10vw,7.5rem)]' : 'text-[clamp(2.5rem,7vw,5rem)]'}`}>
          {c.meta.name}
        </Name>
        <p className="m-0 mt-4 text-lg font-medium text-accent-text md:text-xl">{c.meta.role}</p>
        <p className="m-0 mt-4 max-w-xl text-lg leading-relaxed text-fg/85 md:text-xl">{c.meta.tagline}</p>
        <p className="m-0 mt-4 flex items-center gap-2 text-sm text-muted">
          <Icon name="pin" />
          {c.meta.location}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href={c.links.cv} primary download>
            <Icon name="download" />
            {c.ui.downloadCv}
          </ButtonLink>
          <ButtonLink href={c.links.github} external>
            GitHub
          </ButtonLink>
          <ButtonLink href={c.links.linkedin} external>
            LinkedIn
          </ButtonLink>
        </div>
        {hero && (
          <div className="mt-8">
            <ChipList items={heroTech} label={c.ui.tech} />
          </div>
        )}
      </div>
      <img
        src="/photos/portrait.webp"
        alt={c.alt.portrait}
        width={683}
        height={1024}
        className={`mx-auto w-full rounded-3xl object-cover object-top ${hero ? 'max-w-[300px] md:max-w-sm' : 'max-w-[260px] md:max-w-xs'}`}
      />
    </div>
  )
}
