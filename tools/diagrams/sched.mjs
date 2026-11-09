// CPU scheduler: the same four tasks laid out by FCFS (one block each) and by round robin (interleaved slices).
import { C, createDiagram, SUB_SIZE } from './lib.mjs';

export const id = 'sched';
export const size = { width: 720, height: 432 };

export const strings = {
  en: { fcfs: 'First come, first served', rr: 'Round robin' },
  es: { fcfs: 'Por orden de llegada', rr: 'Round robin' },
};

export function build(s) {
  const d = createDiagram(size);
  d.background();
  const u = 52, x0 = 48, h = 60, g = 4;
  const row = (key, label, y, slices, emphasis) => {
    d.text({ id: `${key}-label`, text: label, x: x0, cy: y - 30, size: SUB_SIZE, color: emphasis ? C.line : C.muted });
    let x = x0;
    slices.forEach(([task, len], i) => {
      d.box({
        id: `${key}-${i}`, x, y, w: len * u - g, h, stroke: emphasis ? C.accent : C.line, strokeWidth: emphasis ? 3 : 2,
        lines: [{ text: `T${task}` }],
      });
      x += len * u;
    });
  };
  row('fcfs', s.fcfs, 120, [[1, 4], [2, 4], [3, 2], [4, 2]], false);
  row('rr', s.rr, 282, [[1, 2], [2, 2], [3, 2], [4, 2], [1, 2], [2, 2]], true);
  return d.toExcalidraw();
}
