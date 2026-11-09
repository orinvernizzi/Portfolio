// Forecast: expected line with a band, two unusual days outside it, dotted continuation to month end.
import { C, createDiagram, SUB_SIZE } from './lib.mjs';

export const id = 'forecast';
export const size = { width: 720, height: 432 };

export const strings = {
  en: { expected: 'Expected', unusual: 'Unusual day', forecast: 'Forecast' },
  es: { expected: 'Esperado', unusual: 'Día inusual', forecast: 'Pronóstico' },
};

export function build(s) {
  const d = createDiagram(size);
  d.background();
  const BAND = '#7a7a7a';
  const xs = [60, 124, 188, 252, 316, 380, 444, 508];
  const ys = [262, 246, 254, 234, 242, 222, 230, 212];
  const obs = xs.map((x, i) => [x, ys[i]]);
  const end = [660, 168];

  d.line({ id: 'axis', points: [[60, 356], [660, 356]], color: '#525252' });
  d.line({ id: 'band-up', points: obs.map(([x, y]) => [x, y - 34]), color: BAND, dashed: 'dotted' });
  d.line({ id: 'band-low', points: obs.map(([x, y]) => [x, y + 34]), color: BAND, dashed: 'dotted' });
  d.line({ id: 'band-up-f', points: [[508, 212 - 34], [end[0], end[1] - 48]], color: BAND, dashed: 'dotted' });
  d.line({ id: 'band-low-f', points: [[508, 212 + 34], [end[0], end[1] + 48]], color: BAND, dashed: 'dotted' });
  d.line({ id: 'expected', points: obs, color: C.line, strokeWidth: 3 });
  d.line({ id: 'continued', points: [[508, 212], end], color: C.line, strokeWidth: 3, dashed: 'dotted' });
  d.dot({ id: 'month-end', cx: end[0], cy: end[1], r: 10, strokeWidth: 3 });

  d.dot({ id: 'spike', cx: 380, cy: 92, r: 11, filled: true });
  d.dot({ id: 'dip', cx: 252, cy: 322, r: 11, filled: true });
  d.text({ id: 'unusual-spike', text: s.unusual, size: SUB_SIZE, x: 402, cy: 92, color: C.line });
  d.text({ id: 'unusual-dip', text: s.unusual, size: SUB_SIZE, x: 274, cy: 322, color: C.line });
  d.text({ id: 'expected-label', text: s.expected, size: SUB_SIZE, x: 60, cy: 150, color: C.muted });
  d.text({ id: 'forecast-label', text: s.forecast, size: SUB_SIZE, x: 520, y: 244, color: C.muted });
  return d.toExcalidraw();
}
