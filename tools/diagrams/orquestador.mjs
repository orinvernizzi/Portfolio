// Orchestrator: a router sends a question to specialist agents; writes pass a human gate.
import { C, createDiagram } from './lib.mjs';

export const id = 'orquestador';
export const size = { width: 720, height: 432 };

export const strings = {
  en: { question: 'Question', router: 'Router', analysis: 'Analysis', reports: 'Reports', sql: 'SQL', answer: 'Answer', gate: 'Person confirms', db: 'Database' },
  es: { question: 'Pregunta', router: 'Enrutador', analysis: 'Análisis', reports: 'Informes', sql: 'SQL', answer: 'Respuesta', gate: 'Persona confirma', db: 'Base de datos' },
};

export function build(s) {
  const d = createDiagram(size);
  d.background();
  const agentH = 48, agentGap = 12, cy = 148;
  const left = { x: 48, w: 150 }, col = { x: 300, w: 140 }, right = { x: 522, w: 150 };
  const mid = col.x + col.w / 2;

  const router = d.box({ id: 'router', x: left.x, y: cy - 28, w: left.w, h: 56, lines: [{ text: s.router }] });
  const q = d.box({ id: 'question', x: left.x, y: 40, w: left.w, h: 48, lines: [{ text: s.question }] });
  const names = [s.analysis, s.reports, s.sql];
  const agents = names.map((t, i) => d.box({
    id: `agent-${i}`, x: col.x, y: cy - (3 * agentH + 2 * agentGap) / 2 + i * (agentH + agentGap), w: col.w, h: agentH, lines: [{ text: t }],
  }));
  const answer = d.box({ id: 'answer', x: right.x, y: cy - 28, w: right.w, h: 56, lines: [{ text: s.answer }] });
  const gate = d.box({ id: 'gate', x: mid - 135, y: 266, w: 270, h: agentH, stroke: C.accent, strokeWidth: 3, dashed: true, lines: [{ text: s.gate }] });
  const db = d.box({ id: 'db', x: mid - 115, y: 336, w: 230, h: agentH, lines: [{ text: s.db }] });

  d.arrow({ id: 'a-q', from: { el: q, side: 'bottom' }, to: { el: router, side: 'top' } });
  agents.forEach((a, i) => {
    d.arrow({ id: `a-r${i}`, from: { el: router, side: 'right' }, to: { el: a, side: 'left' } });
    d.arrow({ id: `a-a${i}`, from: { el: a, side: 'right' }, to: { el: answer, side: 'left' } });
  });
  d.arrow({ id: 'a-sql-gate', from: { el: agents[2], side: 'bottom' }, to: { el: gate, side: 'top' } });
  d.arrow({ id: 'a-gate-db', from: { el: gate, side: 'bottom' }, to: { el: db, side: 'top' }, color: C.accent, strokeWidth: 3 });
  return d.toExcalidraw();
}
