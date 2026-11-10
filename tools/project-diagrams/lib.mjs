// Tiny helper library that emits valid Excalidraw JSON ("Clean" style: roughness 0).
// All diagrams share this palette and these primitives.

export const C = {
  bg: '#0c0c0c',
  panel: '#171717',
  panel2: '#262626',
  line: '#e5e5e5',
  text: '#f5f5f5',
  muted: '#a3a3a3',
  accent: '#ffffff', // emphasis = white + heavier stroke (no colour accent)
  green: '#4ade80',
  amber: '#fbbf24',
  red: '#f87171',
};

export const FONT_FAMILY = 2; // Helvetica: a normal sans in any SVG viewer
export const LINE_HEIGHT = 1.15;
export const FONT_SIZE = 28; // phone: 28px of 720 is ~12px in a 319px card
export const SUB_SIZE = 28;

// Helvetica/Arial advance widths (per 1000 em) for ASCII 32..126.
const W = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556,
  1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556,
  333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556,
  556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
];
const BASE = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ñ: 'n', ü: 'u', Á: 'A', É: 'E', Í: 'I', Ó: 'O', Ú: 'U', Ñ: 'N' };

export function textWidth(str, size = FONT_SIZE) {
  let total = 0;
  for (const ch of str) {
    const c = BASE[ch] ?? ch;
    const code = c.codePointAt(0);
    if (code >= 32 && code <= 126) total += W[code - 32];
    else if (c === '·') total += 278;
    else if (c === '¿' || c === '¡') total += 556;
    else total += 556;
  }
  return (total * size) / 1000;
}

const styleOf = (v) => (v === 'dotted' ? 'dotted' : v ? 'dashed' : 'solid');
const r1 = (n) => Math.round(n * 10) / 10;

function hash(str) {
  let h = 2166136261;
  for (const ch of str) h = Math.imul(h ^ ch.codePointAt(0), 16777619);
  return h >>> 0;
}

const B62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const fracIndex = (i) => 'b' + B62[Math.floor(i / 62)] + B62[i % 62]; // valid fractional indices, sorted

export function createDiagram({ width, height }) {
  const elements = [];
  const byId = new Map();
  let auto = 0;
  const nextId = (p) => `${p}-${++auto}`;

  function push(el) {
    if (byId.has(el.id)) throw new Error(`duplicate id ${el.id}`);
    const h = hash(el.id);
    const full = {
      id: el.id,
      type: el.type,
      x: r1(el.x),
      y: r1(el.y),
      width: r1(el.width),
      height: r1(el.height),
      angle: 0,
      strokeColor: C.line,
      backgroundColor: 'transparent',
      fillStyle: 'solid',
      strokeWidth: 2,
      strokeStyle: 'solid',
      roughness: 0,
      opacity: 100,
      groupIds: [],
      frameId: null,
      index: fracIndex(elements.length),
      roundness: null,
      seed: h,
      version: 1,
      versionNonce: h ^ 0x9e3779b9,
      isDeleted: false,
      boundElements: [],
      updated: 1,
      link: null,
      locked: false,
      ...el.extra,
    };
    elements.push(full);
    byId.set(full.id, full);
    return full;
  }

  const api = {
    width,
    height,
    elements,
    get: (id) => byId.get(id),

    /** Full-size opaque background panel. */
    background() {
      return push({ id: 'bg', type: 'rectangle', x: 0, y: 0, width, height, extra: { backgroundColor: C.bg, strokeColor: 'transparent', strokeWidth: 0 } });
    },

    /** Rounded (or square) rectangle. */
    rect({ id = nextId('rect'), x, y, w, h, fill = 'transparent', stroke = C.line, strokeWidth = 2, dashed = false, round = true, groupIds = [] }) {
      return push({
        id, type: 'rectangle', x, y, width: w, height: h,
        extra: {
          backgroundColor: fill, strokeColor: stroke, strokeWidth, groupIds,
          strokeStyle: styleOf(dashed),
          roundness: round ? { type: 3, value: 10 } : null,
        },
      });
    },

    /** Free text. Give x (left) or cx (centre), and y (top) or cy (centre). */
    text({ id = nextId('text'), text, x, y, cx, cy, size = FONT_SIZE, color = C.text, align, groupIds = [] }) {
      const lines = text.split('\n');
      const w = Math.max(...lines.map((l) => textWidth(l, size)));
      const h = size * LINE_HEIGHT * lines.length;
      const left = cx !== undefined ? cx - w / 2 : x;
      const top = cy !== undefined ? cy - h / 2 : y;
      return push({
        id, type: 'text', x: left, y: top, width: Math.ceil(w), height: r1(h),
        extra: {
          strokeColor: color, groupIds,
          text, originalText: text, fontSize: size, fontFamily: FONT_FAMILY,
          textAlign: align ?? (cx !== undefined ? 'center' : 'left'),
          verticalAlign: 'top', containerId: null, autoResize: true, lineHeight: LINE_HEIGHT,
        },
      });
    },

    /**
     * Labelled box: a rectangle plus text lines grouped together.
     * lines: [{ text, color, size, at: 'center' | 'left' | 'right' }]
     */
    box({ id, x, y, w, h, fill = 'transparent', stroke = C.line, strokeWidth = 2, lines, dashed = false, pad = 16 }) {
      const gid = `g-${id}`;
      for (const l of lines) {
        const tw = textWidth(l.text, l.size ?? FONT_SIZE);
        if (tw + 16 > w) throw new Error(`label "${l.text}" (${Math.round(tw)}px) does not fit box ${id} (${w}px)`);
      }
      const rect = api.rect({ id, x, y, w, h, fill, stroke, strokeWidth, dashed, groupIds: [gid] });
      const stack = lines.filter((l) => l.at === undefined || l.at === 'center');
      const stackH = stack.reduce((a, l) => a + (l.size ?? FONT_SIZE) * LINE_HEIGHT, 0);
      let cursor = y + (h - stackH) / 2;
      lines.forEach((l, i) => {
        const size = l.size ?? FONT_SIZE;
        const lh = size * LINE_HEIGHT;
        const common = { id: `${id}-t${i}`, text: l.text, size, color: l.color ?? C.text, groupIds: [gid] };
        if (l.at === 'left') api.text({ ...common, x: x + pad, cy: y + h / 2 });
        else if (l.at === 'right') api.text({ ...common, x: x + w - pad - textWidth(l.text, size), cy: y + h / 2 });
        else {
          api.text({ ...common, cx: x + w / 2, y: cursor });
          cursor += lh;
        }
      });
      return rect;
    },

    /** Circle / dot. Filled dots are white, hollow dots keep the panel colour. */
    dot({ id = nextId('dot'), cx, cy, r = 8, filled = false, stroke = C.line, strokeWidth = 2 }) {
      return push({
        id, type: 'ellipse', x: cx - r, y: cy - r, width: 2 * r, height: 2 * r,
        extra: { strokeColor: stroke, strokeWidth, backgroundColor: filled ? C.accent : C.bg, roundness: { type: 2 } },
      });
    },

    /** Straight line (no arrowhead). points: absolute [[x,y],...] */
    line({ id = nextId('line'), points, color = C.muted, strokeWidth = 2, dashed = false }) {
      return pointsElement({ id, type: 'line', points, color, strokeWidth, dashed, endArrowhead: null });
    },

    /**
     * Straight arrow glued to two shapes. from/to: { el, side: 'top'|'bottom'|'left'|'right', pos? }
     * pos is the absolute x (top/bottom) or y (left/right) along the edge; default is the centre.
     */
    arrow({ id = nextId('arrow'), from, to, via = [], color = C.muted, strokeWidth = 2, dashed = false, head = 'arrow', gap = 3 }) {
      const a = edgePoint(from, gap);
      const b = edgePoint(to, gap);
      const el = pointsElement({
        id, type: 'arrow', points: [a.p, ...via, b.p], color, strokeWidth, dashed, endArrowhead: head,
        extra: {
          startBinding: from.el ? { elementId: from.el.id, focus: a.focus, gap } : null,
          endBinding: to.el ? { elementId: to.el.id, focus: b.focus, gap } : null,
        },
      });
      from.el?.boundElements.push({ id, type: 'arrow' });
      to.el?.boundElements.push({ id, type: 'arrow' });
      return el;
    },

    toExcalidraw() {
      return {
        type: 'excalidraw',
        version: 2,
        source: 'https://excalidraw.com',
        elements,
        appState: { gridSize: null, viewBackgroundColor: C.bg },
        files: {},
      };
    },
  };

  function edgePoint({ el, side, pos, point }, gap) {
    if (!el) return { p: point, focus: 0 };
    const horizontal = side === 'left' || side === 'right';
    const mid = horizontal ? el.y + el.height / 2 : el.x + el.width / 2;
    const at = pos ?? mid;
    const half = (horizontal ? el.height : el.width) / 2;
    const focus = r1(((at - mid) / half) * 1) || 0;
    const p = {
      top: [at, el.y - gap],
      bottom: [at, el.y + el.height + gap],
      left: [el.x - gap, at],
      right: [el.x + el.width + gap, at],
    }[side];
    return { p, focus };
  }

  function pointsElement({ id, type, points, color, strokeWidth, dashed, endArrowhead, extra = {} }) {
    const [x0, y0] = points[0];
    const rel = points.map(([x, y]) => [r1(x - x0), r1(y - y0)]);
    const xs = rel.map((p) => p[0]);
    const ys = rel.map((p) => p[1]);
    return push({
      id, type, x: x0, y: y0,
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys),
      extra: {
        strokeColor: color, strokeWidth, strokeStyle: styleOf(dashed),
        roundness: null, points: rel, lastCommittedPoint: null,
        startBinding: null, endBinding: null,
        startArrowhead: null, endArrowhead,
        ...(type === 'arrow' ? { elbowed: false } : {}),
        ...extra,
      },
    });
  }

  return api;
}

/** Checks the JSON is loadable: unique ids, required fields, bindings point at real elements. */
export function validate(doc) {
  const errors = [];
  if (doc.type !== 'excalidraw' || doc.version !== 2 || !Array.isArray(doc.elements)) errors.push('bad file header');
  const ids = new Set();
  const required = ['id', 'type', 'x', 'y', 'width', 'height', 'angle', 'strokeColor', 'backgroundColor', 'fillStyle',
    'strokeWidth', 'strokeStyle', 'roughness', 'opacity', 'groupIds', 'seed', 'version', 'versionNonce', 'isDeleted', 'boundElements'];
  for (const el of doc.elements) {
    for (const k of required) if (!(k in el)) errors.push(`${el.id}: missing ${k}`);
    if (ids.has(el.id)) errors.push(`duplicate id ${el.id}`);
    ids.add(el.id);
    if (el.roughness !== 0) errors.push(`${el.id}: roughness ${el.roughness}`);
    if (el.type === 'text' && el.fontFamily !== FONT_FAMILY) errors.push(`${el.id}: fontFamily`);
    if (el.type === 'text' && el.fontSize < 24) errors.push(`${el.id}: font size ${el.fontSize} < 24`);
  }
  for (const el of doc.elements) {
    for (const b of [el.startBinding, el.endBinding]) if (b && !ids.has(b.elementId)) errors.push(`${el.id}: binding to missing ${b.elementId}`);
    for (const b of el.boundElements ?? []) if (!ids.has(b.id)) errors.push(`${el.id}: boundElements missing ${b.id}`);
  }
  return errors;
}
