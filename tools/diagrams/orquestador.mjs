// Orquestador (illustration): Tier 0 orchestrator -> agents and companies -> leaf lists (org-chart tree).
import { C, createDiagram } from './lib.mjs';

export const id = 'orquestador';
export const size = { width: 720, height: 600 };

export const strings = {
  en: { root: 'Orchestrator · Tier 0', agents: 'agents', companies: 'companies', leaves: ['analysis', 'opportunities', 'SQL', 'modeling', 'storytelling', 'reports'] },
  es: { root: 'Orquestador · Tier 0', agents: 'agentes', companies: 'empresas', leaves: ['análisis', 'oportunidades', 'SQL', 'modelado', 'storytelling', 'reportes'] },
};
const COMPANIES = ['ueno-bank', 'upay', 'monchis'];

export function build(s) {
  const d = createDiagram(size);
  d.background();
  const h = 56, lh = 44, gap = 8;
  const root = d.box({ id: 'root', x: 180, y: 20, w: 360, h, stroke: C.accent, strokeWidth: 3, lines: [{ text: s.root }] });
  const y2 = 118;
  const left = d.box({ id: 'agents', x: 24, y: y2, w: 330, h, lines: [{ text: s.agents }] });
  const right = d.box({ id: 'companies', x: 366, y: y2, w: 330, h, lines: [{ text: s.companies }] });

  // bus from the root down to both second-level boxes
  const busY = 97;
  for (const [id, el] of [['a-left', left], ['a-right', right]]) {
    d.arrow({ id, from: { el: root, side: 'bottom' }, to: { el, side: 'top' }, via: [[360, busY], [el.x + el.width / 2, busY]], strokeWidth: 3, color: C.line });
  }

  const y3 = y2 + h + 30;
  const column = (parent, labels, tag, leafX, leafW) => {
    const trunkX = parent.x + 24;
    const ys = labels.map((_, i) => y3 + i * (lh + gap));
    const lastCy = ys[ys.length - 1] + lh / 2;
    d.line({ id: `trunk-${tag}`, points: [[trunkX, parent.y + h + 3], [trunkX, lastCy]], color: C.line, strokeWidth: 2 });
    labels.forEach((t, i) => {
      const leaf = d.box({ id: `${tag}-${i}`, x: leafX, y: ys[i], w: leafW, h: lh, lines: [{ text: t }] });
      d.arrow({ id: `${tag}-a${i}`, from: { point: [trunkX, ys[i] + lh / 2] }, to: { el: leaf, side: 'left' }, color: C.line });
    });
  };
  column(left, s.leaves, 'ag', 72, 282);
  column(right, COMPANIES, 'co', 414, 282);
  return d.toExcalidraw();
}
