// Deterministic Excalidraw JSON -> standalone SVG (rectangles, lines, arrows, text).
// Covers only what our diagrams use; no external references, no web fonts.

const FONT = 'Helvetica, Arial, sans-serif';
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const n = (v) => +v.toFixed(2);
const paint = (c) => (c === 'transparent' ? 'none' : c);

function cornerRadius(el) {
  if (!el.roundness) return 0;
  const m = Math.min(el.width, el.height);
  const fixed = el.roundness.value ?? 32;
  return m <= fixed / 0.25 ? m * 0.25 : fixed;
}

function dash(el) {
  return el.strokeStyle === 'dashed' ? ` stroke-dasharray="${el.strokeWidth * 4} ${el.strokeWidth * 3}"` : el.strokeStyle === 'dotted' ? ` stroke-dasharray="1 ${el.strokeWidth * 3}" stroke-linecap="round"` : '';
}

function arrowHead(el, tip, from, kind) {
  const size = 12;
  const ang = Math.atan2(tip[1] - from[1], tip[0] - from[0]);
  const spread = Math.PI / 7;
  const p1 = [tip[0] - size * Math.cos(ang - spread), tip[1] - size * Math.sin(ang - spread)];
  const p2 = [tip[0] - size * Math.cos(ang + spread), tip[1] - size * Math.sin(ang + spread)];
  const pts = `${n(tip[0])},${n(tip[1])} ${n(p1[0])},${n(p1[1])} ${n(p2[0])},${n(p2[1])}`;
  if (kind === 'triangle') return `<polygon points="${pts}" fill="${el.strokeColor}" stroke="${el.strokeColor}" stroke-width="1" stroke-linejoin="round"/>`;
  return `<polyline points="${n(p1[0])},${n(p1[1])} ${n(tip[0])},${n(tip[1])} ${n(p2[0])},${n(p2[1])}" fill="none" stroke="${el.strokeColor}" stroke-width="${el.strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

export function toSvg(doc, { width, height }) {
  const out = [];
  for (const el of doc.elements) {
    if (el.isDeleted) continue;
    if (el.type === 'rectangle') {
      const r = cornerRadius(el);
      const sw = el.strokeColor === 'transparent' ? 0 : el.strokeWidth;
      // Inset by half the stroke so the outline stays inside the box, like Excalidraw does.
      out.push(`<rect x="${n(el.x)}" y="${n(el.y)}" width="${n(el.width)}" height="${n(el.height)}"${r ? ` rx="${n(r)}"` : ''} fill="${paint(el.backgroundColor)}" stroke="${paint(el.strokeColor)}"${sw ? ` stroke-width="${sw}"` : ''}${dash(el)}/>`);
    } else if (el.type === 'ellipse') {
      out.push(`<ellipse cx="${n(el.x + el.width / 2)}" cy="${n(el.y + el.height / 2)}" rx="${n(el.width / 2)}" ry="${n(el.height / 2)}" fill="${paint(el.backgroundColor)}" stroke="${paint(el.strokeColor)}" stroke-width="${el.strokeWidth}"/>`);
    } else if (el.type === 'line' || el.type === 'arrow') {
      const pts = el.points.map(([px, py]) => [el.x + px, el.y + py]);
      const last = pts.length - 1;
      let end = pts[last];
      // Stop the shaft short of a filled head so the stroke cap does not poke through.
      if (el.endArrowhead === 'triangle') {
        const a = pts[last - 1];
        const len = Math.hypot(end[0] - a[0], end[1] - a[1]);
        const k = (len - 6) / len;
        end = [a[0] + (end[0] - a[0]) * k, a[1] + (end[1] - a[1]) * k];
      }
      const shaft = [...pts.slice(0, last), end];
      out.push(`<polyline points="${shaft.map((p) => `${n(p[0])},${n(p[1])}`).join(' ')}" fill="none" stroke="${el.strokeColor}" stroke-width="${el.strokeWidth}" stroke-linecap="round" stroke-linejoin="round"${dash(el)}/>`);
      if (el.endArrowhead) out.push(arrowHead(el, pts[last], pts[last - 1], el.endArrowhead));
    } else if (el.type === 'text') {
      const lh = el.fontSize * el.lineHeight;
      const anchor = el.textAlign === 'center' ? 'middle' : el.textAlign === 'right' ? 'end' : 'start';
      const x = el.textAlign === 'center' ? el.x + el.width / 2 : el.textAlign === 'right' ? el.x + el.width : el.x;
      el.text.split('\n').forEach((line, i) => {
        const y = el.y + i * lh + (lh - el.fontSize * 1.117) / 2 + el.fontSize * 0.905;
        out.push(`<text x="${n(x)}" y="${n(y)}" font-family="${FONT}" font-size="${el.fontSize}" fill="${el.strokeColor}" text-anchor="${anchor}" xml:space="preserve">${esc(line)}</text>`);
      });
    } else {
      throw new Error(`svg.mjs: unsupported element type ${el.type}`);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" fill="none">\n${out.join('\n')}\n</svg>\n`;
}
