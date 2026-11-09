// Dashboard: two KPI tiles, each with a status dot and a this-week vs last-week pair of bars.
import { C, createDiagram, SUB_SIZE } from './lib.mjs';

export const id = 'dashboard';
export const size = { width: 720, height: 432 };

export const strings = {
  en: { a: 'Transactions', b: 'Customers', ok: 'On track', watch: 'To watch' },
  es: { a: 'Transacciones', b: 'Clientes', ok: 'En meta', watch: 'A vigilar' },
};

export function build(s) {
  const d = createDiagram(size);
  d.background();
  const tiles = [
    { id: 'a', x: 56, title: s.a, status: s.ok, ok: true, now: 118, prev: 84 },
    { id: 'b', x: 384, title: s.b, status: s.watch, ok: false, now: 62, prev: 112 },
  ];
  const y = 48, w = 280, h = 336, base = y + h - 28;
  for (const t of tiles) {
    const g = [`g-${t.id}`];
    d.rect({ id: `tile-${t.id}`, x: t.x, y, w, h, groupIds: g });
    d.text({ id: `title-${t.id}`, text: t.title, x: t.x + 24, y: y + 24, groupIds: g });
    d.dot({ id: `dot-${t.id}`, cx: t.x + 38, cy: y + 82, r: 11, filled: t.ok, strokeWidth: 3 });
    d.text({ id: `status-${t.id}`, text: t.status, x: t.x + 62, cy: y + 82, color: C.muted, size: SUB_SIZE, groupIds: g });
    // last week = outline bar, this week = white bar
    d.rect({ id: `prev-${t.id}`, x: t.x + 64, y: base - t.prev - 40, w: 64, h: t.prev + 40, stroke: C.muted, round: false });
    d.rect({ id: `now-${t.id}`, x: t.x + 152, y: base - t.now - 40, w: 64, h: t.now + 40, fill: C.accent, stroke: C.accent, round: false });
  }
  return d.toExcalidraw();
}
