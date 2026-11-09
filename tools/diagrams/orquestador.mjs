// Orquestador (illustration): a question goes to the Planner, which hands work to three agents.
import { C, createDiagram } from './lib.mjs';

export const id = 'orquestador';
export const size = { width: 720, height: 432 };

export const strings = {
  en: { question: 'Question', planner: 'Planner', sql: 'SQL agent', analyst: 'Analyst', report: 'Report', snippet: 'SELECT ... FROM ...' },
  es: { question: 'Pregunta', planner: 'Planificador', sql: 'Agente SQL', analyst: 'Analista', report: 'Reporte', snippet: 'SELECT ... FROM ...' },
};

export function build(s) {
  const d = createDiagram(size);
  d.background();
  const h = 56, cy = 204;
  const q = d.box({ id: 'question', x: 24, y: cy - h / 2, w: 158, h, lines: [{ text: s.question }] });
  const planner = d.box({ id: 'planner', x: 232, y: cy - h / 2, w: 200, h, stroke: C.accent, strokeWidth: 3, lines: [{ text: s.planner }] });
  const ax = 490, aw = 206;
  const ys = [56, 176, 296]; // gaps leave room for the SQL caption
  const agents = [s.sql, s.analyst, s.report].map((t, i) => d.box({ id: `agent-${i}`, x: ax, y: ys[i], w: aw, h, lines: [{ text: t }] }));

  d.text({ id: 'caption', text: s.snippet, x: ax + aw - 224, cy: ys[0] + h + 32, size: 24, color: C.muted });

  d.arrow({ id: 'a-q', from: { el: q, side: 'right' }, to: { el: planner, side: 'left' } });
  // bus-style elbows: out of the Planner, up or down at x = 456, into each agent
  agents.forEach((a, i) => {
    const yc = a.y + h / 2;
    const via = i === 1 ? [] : [[456, cy], [456, yc]];
    d.arrow({ id: `a-p${i}`, from: { el: planner, side: 'right' }, to: { el: a, side: 'left' }, via, strokeWidth: 3, color: C.line });
  });
  return d.toExcalidraw();
}
