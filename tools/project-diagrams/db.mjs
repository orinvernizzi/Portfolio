// Consulting-firm database: five entities, connectors, and audit triggers watching Client.
import { C, createDiagram, SUB_SIZE } from './lib.mjs';

export const id = 'db';
export const size = { width: 720, height: 432 };

export const strings = {
  en: { region: 'Region', client: 'Client', contract: 'Contract', consultant: 'Consultant', cls: 'Classification', audit: 'audit triggers' },
  es: { region: 'Región', client: 'Cliente', contract: 'Contrato', consultant: 'Consultor', cls: 'Clasificación', audit: 'triggers de auditoría' },
};

export function build(s) {
  const d = createDiagram(size);
  d.background();
  const h = 60, r1 = 150, r2 = 300;
  const c1 = { x: 48, w: 140 }, c2 = { x: 245, w: 230 }, c3 = { x: 522, w: 150 };
  const region = d.box({ id: 'region', x: c1.x, y: r1, w: c1.w, h, lines: [{ text: s.region }] });
  const client = d.box({ id: 'client', x: c2.x, y: r1, w: c2.w, h, stroke: C.accent, strokeWidth: 3, lines: [{ text: s.client }] });
  const contract = d.box({ id: 'contract', x: c3.x, y: r1, w: c3.w, h, lines: [{ text: s.contract }] });
  const cls = d.box({ id: 'cls', x: c2.x, y: r2, w: c2.w, h, lines: [{ text: s.cls }] });
  const consultant = d.box({ id: 'consultant', x: c3.x, y: r2, w: c3.w, h, lines: [{ text: s.consultant }] });
  const audit = d.box({ id: 'audit', x: 360 - 175, y: 40, w: 350, h: 52, dashed: true, stroke: C.muted, lines: [{ text: s.audit, color: C.muted, size: SUB_SIZE }] });

  const link = (id, a, sa, b, sb, extra = {}) => d.arrow({ id, from: { el: a, side: sa }, to: { el: b, side: sb }, head: null, color: C.line, ...extra });
  link('l-region-client', region, 'right', client, 'left');
  link('l-client-contract', client, 'right', contract, 'left');
  link('l-contract-consultant', contract, 'bottom', consultant, 'top');
  link('l-consultant-cls', consultant, 'left', cls, 'right');
  link('l-audit-client', audit, 'bottom', client, 'top', { dashed: true, color: C.muted, pos: undefined });
  return d.toExcalidraw();
}
