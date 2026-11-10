// Virtual memory manager, reduced to the one idea: TLB hit is the fast path, a miss walks the page table, a fault goes to disk.
import { C, createDiagram, SUB_SIZE } from './lib.mjs';

export const id = 'vmm';
export const size = { width: 720, height: 432 };

export const strings = {
  en: { address: 'Address', tlb: 'TLB', memory: 'Memory', pt: 'Page table', disk: 'Disk', hit: 'hit', miss: 'miss', fault: 'page fault' },
  es: { address: 'Dirección', tlb: 'TLB', memory: 'Memoria', pt: 'Tabla de páginas', disk: 'Disco', hit: 'acierto', miss: 'fallo', fault: 'fallo de página' },
};

export function build(s) {
  const d = createDiagram(size);
  d.background();
  const h = 64;
  const row = { tlb: 48, pt: 184, disk: 320 };
  const cx = 350; // centre column
  const center = (el) => el.y + el.height / 2;

  const address = d.box({ id: 'address', x: 48, y: row.tlb, w: 150, h, lines: [{ text: s.address }] });
  const tlb = d.box({ id: 'tlb', x: cx - 50, y: row.tlb, w: 100, h, lines: [{ text: s.tlb }] });
  const pt = d.box({ id: 'pt', x: cx - 135, y: row.pt, w: 270, h, lines: [{ text: s.pt }] });
  const disk = d.box({ id: 'disk', x: cx - 70, y: row.disk, w: 140, h, lines: [{ text: s.disk }] });
  const memory = d.box({ id: 'memory', x: 532, y: row.tlb, w: 140, h: row.pt + h - row.tlb, lines: [{ text: s.memory }] });

  d.arrow({ id: 'a-addr', from: { el: address, side: 'right' }, to: { el: tlb, side: 'left' } });
  d.arrow({ id: 'a-hit', from: { el: tlb, side: 'right' }, to: { el: memory, side: 'left', pos: center(tlb) }, color: C.accent, strokeWidth: 3.5 });
  d.text({ id: 'hit', text: s.hit, size: SUB_SIZE, cx: (tlb.x + tlb.width + memory.x) / 2, y: center(tlb) - 38, color: C.accent });
  d.arrow({ id: 'a-miss', from: { el: tlb, side: 'bottom' }, to: { el: pt, side: 'top' } });
  d.text({ id: 'miss', text: s.miss, size: SUB_SIZE, x: cx + 14, cy: (tlb.y + h + pt.y) / 2, color: C.muted });
  d.arrow({ id: 'a-frame', from: { el: pt, side: 'right' }, to: { el: memory, side: 'left', pos: center(pt) } });
  d.arrow({ id: 'a-fault', from: { el: pt, side: 'bottom' }, to: { el: disk, side: 'top' }, dashed: true, color: C.muted });
  d.text({ id: 'fault', text: s.fault, size: SUB_SIZE, x: cx + 14, cy: (pt.y + h + disk.y) / 2, color: C.muted });
  return d.toExcalidraw();
}
