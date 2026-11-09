// Catch Analysis: four sources converge on Review, then Database (row-level security), then Verdict.
import { C, createDiagram } from './lib.mjs';

export const id = 'catch';
export const size = { width: 720, height: 432 };

export const strings = {
  en: { sources: ['Concept2', 'CSV', 'PM5 photo', 'Bluetooth'], review: 'Review', db: 'Database', verdict: 'Better +2.1%' },
  es: { sources: ['Concept2', 'CSV', 'Foto PM5', 'Bluetooth'], review: 'Revisión', db: 'Base de datos', verdict: 'Mejor +2.1%' },
};

export function build(s) {
  const d = createDiagram(size);
  d.background();
  const cy = 182, hh = 48, gap = 14;
  const top = cy - (4 * hh + 3 * gap) / 2;
  const sources = s.sources.map((t, i) => d.box({ id: `src-${i}`, x: 48, y: top + i * (hh + gap), w: 170, h: hh, lines: [{ text: t }] }));
  const review = d.box({ id: 'review', x: 274, y: cy - 28, w: 140, h: 56, lines: [{ text: s.review }] });
  const db = d.box({ id: 'db', x: 462, y: cy - 28, w: 210, h: 56, lines: [{ text: s.db }] });
  const verdict = d.box({ id: 'verdict', x: 462, y: 300, w: 210, h: 56, fill: C.accent, stroke: C.accent, lines: [{ text: s.verdict, color: C.bg }] });

  sources.forEach((src, i) => d.arrow({ id: `a-src-${i}`, from: { el: src, side: 'right' }, to: { el: review, side: 'left' } }));
  d.arrow({ id: 'a-review', from: { el: review, side: 'right' }, to: { el: db, side: 'left' } });
  d.arrow({ id: 'a-db', from: { el: db, side: 'bottom' }, to: { el: verdict, side: 'top' } });

  // lock mark sitting on the database box (row-level security)
  const lx = db.x + 16, ly = db.y - 22;
  d.rect({ id: 'lock-body', x: lx, y: ly, w: 24, h: 18, stroke: C.line, strokeWidth: 2.5, round: false });
  d.line({ id: 'lock-shackle', points: [[lx + 4, ly], [lx + 4, ly - 9], [lx + 20, ly - 9], [lx + 20, ly]], color: C.line, strokeWidth: 2.5 });
  return d.toExcalidraw();
}
