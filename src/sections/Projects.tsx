// The "Projects" panel: project cards grouped by the groups in projects.json.
// Text, links and stack: src/content/projects.json. The picture of each card is public/project-pictures/<id>.<en|es>.<svg|webp>
// (webp when the project has "image": "webp"). Picture descriptions for screen readers: "art" in projects.json.
import { useState, type CSSProperties, type ReactNode } from 'react'
import { useContent, useLang, type Project } from '../lib/content'
import { ButtonLink, ChipList, Icon } from '../components/ui'
import { DiagramViewer } from '../components/DiagramViewer'
import pictureSizes from '../content/pictureSizes.json'

// [width, height] of each diagram, written by `npm run pictures` (tools/project-diagrams/mermaid).
const DIAGRAM_SIZES: Record<string, number[] | undefined> = pictureSizes

// A diagram card's picture: tapping opens DiagramViewer.
function DiagramPicture({ p, fade, img, hint, alt, width, height }: { p: Project; fade: CSSProperties; img: ReactNode; hint: string; alt?: string; width: number; height: number }) {
  const [viewing, setViewing] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setViewing(true)} aria-haspopup="dialog" className="project-pic group relative block w-full cursor-zoom-in border-0 bg-transparent p-0 text-left transition-transform duration-150 active:scale-[0.985] focus-visible:outline-none!">
        <div className="pb-10" style={fade}>{img}</div>
        {/* Bottom right: the one corner no diagram uses, kept out of the fade so it stays readable. It also shows keyboard focus. */}
        <span className="pointer-events-none absolute bottom-11 right-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/75 px-2.5 py-1 text-xs font-medium text-fg backdrop-blur-sm transition-colors group-hover:border-white/40 group-hover:bg-black/90 group-focus-visible:border-white group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-white">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
          {hint}
        </span>
      </button>
      <DiagramViewer open={viewing} onClose={() => setViewing(false)} id={p.id} title={p.title} alt={alt ?? p.title} width={width} height={height} />
    </>
  )
}

// A photo card's picture is the link itself (the live site, else the code), like a thumbnail: on hover it zooms
// a little and an arrow badge fades in (.project-pic in src/styles/effects.css).
function LinkedPicture({ href, label, fade, img }: { href: string; label: string; fade: CSSProperties; img: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="project-pic relative block focus-visible:outline-none!">
      <div className="pb-10" style={fade}>{img}</div>
      <span className="project-pic-badge pointer-events-none absolute bottom-11 right-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white text-ink" aria-hidden="true">
        <Icon name="arrow" />
      </span>
    </a>
  )
}

function ProjectCard({ p, lang, alt, open, viewCode, newTab, hint }: { p: Project; lang: string; alt?: string; open: string; viewCode: string; newTab: string; hint: string }) {
  const photo = p.image === 'webp'
  const picLink = photo ? (p.live ?? p.code) : undefined // the picture takes over this link's button
  const liveButton = p.live !== picLink ? p.live : undefined
  const codeButton = p.code !== picLink ? p.code : undefined
  const picLabel = `${p.title}: ${picLink === p.live ? open : (p.codeLabel ?? viewCode)} (${newTab})`
  const ext = photo ? 'webp' : 'svg'
  const [width, height] = photo ? [1500, 900] : (DIAGRAM_SIZES[p.id] ?? [720, 432])
  const solid = p.id === 'catch' ? 55 : 78 // where the picture starts melting into the card (the Catch app screen melts earlier)
  const mask = `linear-gradient(to bottom, #000 ${solid}%, transparent 100%)`
  const fade: CSSProperties = { maskImage: mask, WebkitMaskImage: mask }
  const img = (
    <img src={`/project-pictures/${p.id}.${lang}.${ext}`} width={width} height={height} loading="lazy" decoding="async" alt={alt ?? ''} className="block h-auto w-full" />
  )
  return (
    <article aria-labelledby={`project-${p.id}`} className="reveal flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface">
      {/* The picture fades into the card colour; the extra bottom padding gives the fade room. */}
      {photo && picLink ? (
        <LinkedPicture href={picLink} label={picLabel} fade={fade} img={img} />
      ) : photo ? (
        <div className="pb-10" style={fade}>{img}</div>
      ) : (
        <DiagramPicture p={p} fade={fade} img={img} hint={hint} alt={alt} width={width} height={height} />
      )}
      <div className="relative -mt-8 flex flex-1 flex-col gap-3 px-5 pb-5">
        <p className="m-0 text-xs font-medium tracking-wide text-accent-text">{p.tag}</p>
        <h4 id={`project-${p.id}`} className="m-0 text-lg font-semibold tracking-tight">
          {p.title}
        </h4>
        <p className="m-0 text-[15px] leading-relaxed text-fg/90">{p.text}</p>
        {p.legal && (
          <p className="m-0 rounded-xl border border-white/20 border-l-4 border-l-white bg-white/[0.06] px-4 py-3 text-[15px] font-medium leading-relaxed text-fg">
            {p.legal}
          </p>
        )}
        <ul className="m-0 flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed text-fg/80 marker:text-accent-text">
          {p.details.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
        {p.note && <p className="m-0 text-xs leading-relaxed text-muted">{p.note}</p>}
        <div className="mt-auto pt-2">
          <ChipList items={p.stack} label={p.title} />
        </div>
        {(liveButton || codeButton) && (
          <div className="flex flex-wrap gap-2 pt-1">
            {liveButton && (
              <ButtonLink href={liveButton} external primary>
                {open}
                <Icon name="arrow" />
              </ButtonLink>
            )}
            {codeButton && (
              <ButtonLink href={codeButton} external>
                {p.codeLabel ?? viewCode}
                <Icon name="arrow" />
              </ButtonLink>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

export function Projects() {
  const c = useContent()
  const lang = useLang()
  return (
    <div className="flex flex-col gap-12">
      {c.projects.groups.map((g) => (
        <section key={g.id} aria-labelledby={`group-${g.id}`}>
          <h3 id={`group-${g.id}`} className="eyebrow m-0 mb-4 border-b border-line pb-3">
            {g.title}
          </h3>
          <div className="grid gap-5 md:grid-cols-2">
            {c.projects.items
              .filter((p) => p.group === g.id)
              .map((p) => (
                <ProjectCard
                  key={p.id}
                  p={p}
                  lang={lang}
                  alt={c.art[p.id]?.label}
                  open={c.ui.open}
                  viewCode={c.ui.viewCode}
                  newTab={c.ui.newTab}
                  hint={c.ui.diagramExplore}
                />
              ))}
          </div>
        </section>
      ))}
    </div>
  )
}
