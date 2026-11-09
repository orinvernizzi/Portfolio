import { useEffect } from 'react'
import { SECTION_VIEWS } from '../sections/registry'
import { Intro } from '../sections/Intro'
import { useContent } from '../lib/content'

export function ListView() {
  const c = useContent()

  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (id) document.getElementById(id)?.scrollIntoView()
  }, [])

  return (
    <main className="mx-auto w-full max-w-6xl px-4 md:px-8">
      <section id="intro" tabIndex={-1} aria-label={c.sections[0].title} className="scroll-mt-24 pb-16 pt-28 md:pb-24 md:pt-36">
        <Intro hero />
      </section>
      {c.sections.slice(1).map((s, i) => {
        const View = SECTION_VIEWS[s.id]
        return (
          <section key={s.id} id={s.id} aria-labelledby={`h-${s.id}`} className="scroll-mt-20 border-t border-line py-14 md:py-20">
            <h2 id={`h-${s.id}`} tabIndex={-1} className="m-0 mb-8 text-[clamp(1.6rem,4vw,2.4rem)] font-semibold leading-tight tracking-tight md:mb-12">
              <span className="eyebrow mr-3 align-middle">
                {String(i + 2).padStart(2, '0')}
              </span>
              {s.title}
            </h2>
            <View />
          </section>
        )
      })}
      <footer className="flex flex-col gap-4 border-t border-line py-10 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <p className="m-0">© {new Date().getFullYear()} {c.meta.name}</p>
        <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label={c.ui.links}>
          <a className="inline-flex min-h-11 items-center text-fg" href={c.links.github} target="_blank" rel="noopener noreferrer">GitHub</a>
          <a className="inline-flex min-h-11 items-center text-fg" href={c.links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a className="inline-flex min-h-11 items-center text-fg" href={`mailto:${c.links.email}`}>{c.links.email}</a>
        </nav>
      </footer>
    </main>
  )
}
