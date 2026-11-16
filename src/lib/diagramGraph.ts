// Reads a Mermaid flowchart SVG (built by tools/project-diagrams/mermaid) into boxes and arrows,
// and lights up one box with its arrows. Used by src/components/DiagramViewer.tsx.
// Mermaid ids: a box is "flowchart-<id>-<n>", an arrow is "L_<from>_<to>_<n>", a subgraph is "<id>".

interface Edge {
  from: string
  to: string
  parts: Element[] // the arrow and its label, if it has one
}

export interface DiagramGraph {
  svg: SVGSVGElement
  nodes: Map<string, Element>
  labels: Map<string, string>
  edges: Edge[]
  clusterOf: Map<string, string>
  members: Map<string, string[]>
}

const NODE_ID = /^flowchart-(.+)-\d+$/

export function nodeIdOf(el: Element): string | undefined {
  return NODE_ID.exec(el.id)?.[1]
}

function lineText(node: Element) {
  const lines = Array.from(node.querySelectorAll('.label tspan.text-outer-tspan'), (t) => t.textContent?.trim() ?? '')
  return lines.filter(Boolean).join(' ')
}

// "L_PT_BS_7" -> ["PT", "BS"], trying every split so ids with "_" still work.
function edgeEnds(id: string, known: Set<string>): [string, string] | undefined {
  const inner = id.split('_').slice(1, -1)
  for (let i = 1; i < inner.length; i++) {
    const from = inner.slice(0, i).join('_')
    const to = inner.slice(i).join('_')
    if (known.has(from) && known.has(to)) return [from, to]
  }
}

export function readDiagram(svg: SVGSVGElement): DiagramGraph {
  const nodes = new Map<string, Element>()
  const labels = new Map<string, string>()
  const clusterOf = new Map<string, string>()
  const members = new Map<string, string[]>()
  for (const el of svg.querySelectorAll('g.node')) {
    const id = nodeIdOf(el)
    if (!id) continue
    nodes.set(id, el)
    labels.set(id, lineText(el))
    // A subgraph with its own direction is drawn as a nested g.root that holds its cluster.
    const root = el.closest('g.root')
    const nested = root?.parentElement?.closest('g.root')
    const cluster = nested && root?.querySelector(':scope > g.clusters > g.cluster')?.id
    if (cluster) {
      clusterOf.set(id, cluster)
      members.set(cluster, [...(members.get(cluster) ?? []), id])
    }
  }

  const known = new Set([...nodes.keys(), ...Array.from(svg.querySelectorAll('g.cluster'), (c) => c.id)])
  const edges: Edge[] = []
  for (const root of svg.querySelectorAll('g.root')) {
    // Labels carry no id: the n-th label of a g.root belongs to its n-th arrow.
    const paths = root.querySelectorAll(':scope > g.edgePaths > path')
    const texts = root.querySelectorAll(':scope > g.edgeLabels > g.edgeLabel')
    paths.forEach((path, i) => {
      if (path.classList.contains('edge-thickness-invisible')) return
      const ends = edgeEnds(path.id, known)
      if (!ends) return
      const label = texts.length === paths.length ? texts[i] : undefined
      edges.push({ from: ends[0], to: ends[1], parts: label ? [path, label] : [path] })
    })
  }
  return { svg, nodes, labels, edges, clusterOf, members }
}

// The lit box's outline is set inline with priority: some boxes (.top, headers) carry inline !important styles.
function outline(node: Element | undefined, on: boolean) {
  const box = node?.querySelector<SVGElement>(':scope > .label-container')
  if (!box) return
  if (!on) {
    if (box.dataset.dvStyle !== undefined) box.setAttribute('style', box.dataset.dvStyle)
    delete box.dataset.dvStyle
    return
  }
  box.dataset.dvStyle ??= box.getAttribute('style') ?? ''
  box.style.setProperty('stroke', '#fff', 'important')
  box.style.setProperty('stroke-width', '3px', 'important')
  box.style.setProperty('fill', '#3a3a3a', 'important')
}

// Lights `id` and everything joined to it (an arrow to a subgraph joins all its boxes). null clears.
export function highlight(g: DiagramGraph, id: string | null) {
  g.svg.querySelectorAll('.dv-on').forEach((el) => outline(el, false))
  g.svg.querySelectorAll('.dv-on, .dv-link').forEach((el) => el.classList.remove('dv-on', 'dv-link'))
  g.svg.classList.toggle('dv-dim', id !== null)
  if (id === null) return
  g.nodes.get(id)?.classList.add('dv-on')
  outline(g.nodes.get(id), true)
  const self = new Set([id, g.clusterOf.get(id)])
  const light = (end: string) => {
    for (const n of g.members.get(end) ?? [end]) if (n !== id) g.nodes.get(n)?.classList.add('dv-link')
  }
  for (const e of g.edges) {
    if (!self.has(e.from) && !self.has(e.to)) continue
    e.parts.forEach((el) => el.classList.add('dv-link'))
    light(self.has(e.from) ? e.to : e.from)
  }
}
