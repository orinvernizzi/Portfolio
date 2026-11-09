// ErgCalc: a 2k split into four 500 m pieces gives time and watts; web and iPhone share one logbook.
import { C, createDiagram } from './lib.mjs';

export const id = 'erg';
export const size = { width: 720, height: 432 };

export const strings = {
  en: { total: '2k', split: '500 m', result: 'Time and watts', web: 'Web', phone: 'iPhone', book: 'Logbook' },
  es: { total: '2k', split: '500 m', result: 'Tiempo y watts', web: 'Web', phone: 'iPhone', book: 'Registro' },
};

export function build(s) {
  const d = createDiagram(size);
  d.background();
  const bw = 112, bg = 10, rowW = 4 * bw + 3 * bg, x0 = (720 - rowW) / 2;
  const pieces = [0, 1, 2, 3].map((i) => d.box({ id: `p-${i}`, x: x0 + i * (bw + bg), y: 48, w: bw, h: 56, lines: [{ text: s.split }] }));
  // bracket under the pieces: together they are the 2k
  d.line({ id: 'bracket', points: [[x0, 118], [x0, 128], [x0 + rowW, 128], [x0 + rowW, 118]], color: C.line });
  d.text({ id: 'total', text: s.total, x: 374, cy: 166, color: C.muted });
  const result = d.box({ id: 'result', x: 360 - 140, y: 196, w: 280, h: 56, stroke: C.accent, strokeWidth: 3, lines: [{ text: s.result }] });
  d.arrow({ id: 'a-result', from: { point: [360, 128] }, to: { el: result, side: 'top' } });

  const web = d.box({ id: 'web', x: 48, y: 316, w: 130, h: 56, lines: [{ text: s.web }] });
  const book = d.box({ id: 'book', x: 270, y: 316, w: 180, h: 56, lines: [{ text: s.book }] });
  const phone = d.box({ id: 'phone', x: 542, y: 316, w: 130, h: 56, lines: [{ text: s.phone }] });
  d.arrow({ id: 'a-web', from: { el: web, side: 'right' }, to: { el: book, side: 'left' } });
  d.arrow({ id: 'a-phone', from: { el: phone, side: 'left' }, to: { el: book, side: 'right' } });
  return d.toExcalidraw();
}
