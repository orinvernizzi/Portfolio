// Pep/9: memory feeds the CPU (registers and flags), which drives output; fetch, decode, execute loop.
import { C, createDiagram, SUB_SIZE } from './lib.mjs';

export const id = 'pep9';
export const size = { width: 720, height: 432 };

export const strings = {
  en: { memory: 'Memory', cpu: 'CPU', output: 'Output', fetch: 'Fetch', decode: 'Decode', execute: 'Execute' },
  es: { memory: 'Memoria', cpu: 'CPU', output: 'Salida', fetch: 'Buscar', decode: 'Decodificar', execute: 'Ejecutar' },
};

export function build(s) {
  const d = createDiagram(size);
  d.background();
  d.text({ id: 'memory-label', text: s.memory, x: 48, cy: 56, size: SUB_SIZE, color: C.muted });
  // memory: one outlined strip of four hex cells
  const cx0 = 48, cw = 92, cellY = 80, cellH = 52;
  const mem = d.rect({ id: 'memory', x: cx0, y: cellY, w: cw * 4, h: cellH });
  ['D0', '00', '48', 'F1'].forEach((hex, i) => {
    if (i > 0) d.line({ id: `div-${i}`, points: [[cx0 + i * cw, cellY], [cx0 + i * cw, cellY + cellH]], color: C.muted });
    d.text({ id: `hex-${i}`, text: hex, cx: cx0 + i * cw + cw / 2, cy: cellY + cellH / 2 });
  });
  const cpuY = 168, cpuH = 112;
  const cpu = d.box({
    id: 'cpu', x: 48, y: cpuY, w: cw * 4, h: cpuH, stroke: C.accent, strokeWidth: 3,
    lines: [{ text: s.cpu, color: C.muted, size: SUB_SIZE }, { text: 'A   X   SP   HP' }, { text: 'N   Z   V   C', color: C.muted }],
  });
  const out = d.box({ id: 'output', x: 512, y: cpuY + cpuH / 2 - 28, w: 160, h: 56, lines: [{ text: s.output }] });
  const bw = 160, gap = 20, ly = 316, lh = 52;
  const steps = [s.fetch, s.decode, s.execute].map((t, i) => d.box({ id: `step-${i}`, x: 48 + i * (bw + gap), y: ly, w: bw, h: lh, lines: [{ text: t }] }));

  d.arrow({ id: 'a-mem', from: { el: mem, side: 'bottom' }, to: { el: cpu, side: 'top' } });
  d.arrow({ id: 'a-out', from: { el: cpu, side: 'right' }, to: { el: out, side: 'left' } });
  d.arrow({ id: 'a-f-d', from: { el: steps[0], side: 'right' }, to: { el: steps[1], side: 'left' } });
  d.arrow({ id: 'a-d-e', from: { el: steps[1], side: 'right' }, to: { el: steps[2], side: 'left' } });
  const ex = steps[2].x + bw / 2, fx = steps[0].x + bw / 2;
  d.arrow({ id: 'a-loop', from: { el: steps[2], side: 'bottom' }, to: { el: steps[0], side: 'bottom' }, via: [[ex, ly + lh + 28], [fx, ly + lh + 28]], dashed: true });
  return d.toExcalidraw();
}
