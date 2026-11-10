// Course registration site: browser frame with a sidebar and a form; the home page and stylesheet are Nico's part.
import { C, createDiagram } from './lib.mjs';

export const id = 'web';
export const size = { width: 720, height: 432 };

export const strings = {
  en: { mine: 'my part' },
  es: { mine: 'mi parte' },
};

export function build(s) {
  const d = createDiagram(size);
  d.background();
  const fx = 72, fy = 48, fw = 576, fh = 336;
  d.rect({ id: 'frame', x: fx, y: fy, w: fw, h: fh, stroke: C.line });
  // my part: page header and sidebar (white, heavier)
  d.box({ id: 'header', x: fx + 16, y: fy + 16, w: fw - 32, h: 56, stroke: C.accent, strokeWidth: 3.5, lines: [{ text: s.mine, at: 'left' }], pad: 20 });
  d.rect({ id: 'sidebar', x: fx + 16, y: fy + 88, w: 150, h: fh - 104, stroke: C.accent, strokeWidth: 3.5 });
  for (let i = 0; i < 4; i++) d.rect({ id: `nav-${i}`, x: fx + 38, y: fy + 118 + i * 46, w: 106, h: 20, stroke: C.muted });
  for (let i = 0; i < 3; i++) d.rect({ id: `field-${i}`, x: fx + 190, y: fy + 108 + i * 72, w: fw - 190 - 28, h: 48, stroke: C.muted });
  return d.toExcalidraw();
}
