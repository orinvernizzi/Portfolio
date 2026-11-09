// Sudoku checker: one row thread, one column thread and nine box threads write into 11 result cells.
import { C, createDiagram, textWidth, SUB_SIZE } from './lib.mjs';

export const id = 'sudoku';
export const size = { width: 720, height: 432 };

export const strings = {
  en: { row: '1 row thread', col: '1 column thread', box: '9 box threads', results: '11 results' },
  es: { row: '1 hilo de filas', col: '1 hilo de columnas', box: '9 hilos de cuadros', results: '11 resultados' },
};

export function build(s) {
  const d = createDiagram(size);
  d.background();
  // 9x9 grid drawn as 3x3 big blocks
  const gx = 48, gy = 130, cell = 56, n = 3;
  d.rect({ id: 'grid', x: gx, y: gy, w: cell * n, h: cell * n, round: false, strokeWidth: 2.5 });
  for (let i = 1; i < n; i++) {
    d.line({ id: `gv-${i}`, points: [[gx + i * cell, gy], [gx + i * cell, gy + cell * n]], color: C.line, strokeWidth: 2.5 });
    d.line({ id: `gh-${i}`, points: [[gx, gy + i * cell], [gx + cell * n, gy + i * cell]], color: C.line, strokeWidth: 2.5 });
  }
  // results strip: 11 cells
  const sx = 628, sy = 100, sw = 44, ch = 20;
  const strip = d.rect({ id: 'results', x: sx, y: sy, w: sw, h: ch * 11, round: false, stroke: C.accent, strokeWidth: 3 });
  for (let i = 1; i < 11; i++) d.line({ id: `rc-${i}`, points: [[sx, sy + i * ch], [sx + sw, sy + i * ch]], color: C.muted });
  d.text({ id: 'results-label', text: s.results, size: SUB_SIZE, x: sx + sw - textWidth(s.results, SUB_SIZE), cy: sy - 26, color: C.line });
  [s.row, s.col, s.box].forEach((t, i) => {
    const y = gy + 28 + i * 56;
    d.text({ id: `thread-${i}`, text: t, x: 248, cy: y });
    d.arrow({ id: `a-t-${i}`, from: { point: [248 + 272, y] }, to: { el: strip, side: 'left', pos: sy + (ch * 11) / 2 + (i - 1) * 36 } });
  });
  return d.toExcalidraw();
}
