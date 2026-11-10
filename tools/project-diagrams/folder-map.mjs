// Folder map for START-HERE.md: the main folders on the left, "I want to change..." on the right, arrows between.
// Same look as the project diagrams (white outlines on #0c0c0c, roughness 0), sized for documentation.
// Run: npm run folder-map   (writes docs/folder-map.excalidraw and docs/folder-map.svg, English only).
import { C, createDiagram, SUB_SIZE } from './lib.mjs';

export const id = 'folder-map';
export const size = { width: 1200, height: 800 };
export const strings = { en: {} };

const CAPTION = 24;

const folders = [
  ['public', 'Pictures, logos and the CV files'],
  ['src/content', 'All the text, English and Spanish'],
  ['src/sections', 'Layout of each opened card'],
  ['src/spiral', 'Menu cards and the photo reel'],
  ['src/styles', 'Colours, fonts and animations'],
  ['tools', 'Optional: redraws pictures'],
];

// label, then the arrows: [folder row, y along that folder's right edge]
const wants = [
  ['Project pictures', [[0, 105]]],
  ['Links, email and CV', [[0, 160], [1, 232]]],
  ['Text of every card', [[1, 275]]],
  ['Layout of an opened card', [[2, 366]]],
  ['Picture on a menu card', [[3, 465]]],
  ['Photos in the reel', [[3, 505]]],
  ['Colours and fonts', [[4, 602]]],
];

export function build() {
  const d = createDiagram(size);
  d.background();
  d.text({ id: 'title-left', text: 'Folders', x: 40, y: 26, size: SUB_SIZE, color: C.muted });
  d.text({ id: 'title-right', text: 'I want to change...', x: 760, y: 26, size: SUB_SIZE, color: C.muted });

  const left = folders.map(([name, caption], i) =>
    d.box({
      id: `folder-${i}`, x: 40, y: 80 + i * 118, w: 440, h: 100, strokeWidth: 3,
      lines: [{ text: name, size: SUB_SIZE }, { text: caption, size: CAPTION, color: C.muted }],
    }),
  );

  wants.forEach(([label, targets], i) => {
    const box = d.box({
      id: `want-${i}`, x: 760, y: 80 + i * 100, w: 400, h: 64, fill: C.panel,
      lines: [{ text: label, size: CAPTION }],
    });
    targets.forEach(([row, at], k) => {
      const startAt = box.y + (targets.length === 1 ? 32 : 20 + k * 24);
      d.arrow({
        id: `arrow-${i}-${k}`,
        from: { el: box, side: 'left', pos: startAt },
        to: { el: left[row], side: 'right', pos: at },
        color: C.line,
      });
    });
  });
  return d.toExcalidraw();
}
