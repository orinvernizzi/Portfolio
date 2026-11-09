// One painter per spiral card; returns true when the card background is light.
import { ACCENT, CARD_H, CARD_W, FONT, INK, OFFWHITE, PHOTOS, type CardSpec, type Ctx } from './cardShared'

function cover(ctx: Ctx, img: HTMLImageElement, fx: number, fy: number) {
  const s = Math.max(CARD_W / img.width, CARD_H / img.height)
  const dw = img.width * s
  const dh = img.height * s
  ctx.drawImage(img, -(dw - CARD_W) * fx, -(dh - CARD_H) * fy, dw, dh)
}

function photo(id: string) {
  return (ctx: Ctx, _s: CardSpec, img: HTMLImageElement | null) => {
    ctx.fillStyle = '#1a1a19'
    ctx.fillRect(0, 0, CARD_W, CARD_H)
    const p = PHOTOS[id]
    if (img) cover(ctx, img, p.fx, p.fy)
    return false
  }
}

function tintedLogo(img: HTMLImageElement, w: number, h: number, color: string) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const x = c.getContext('2d')!
  x.drawImage(img, 0, 0, w, h)
  x.globalCompositeOperation = 'source-in'
  x.fillStyle = color
  x.fillRect(0, 0, w, h)
  return c
}

function rings(ctx: Ctx, cx: number, cy: number, color: string, count = 5) {
  ctx.strokeStyle = color
  ctx.lineWidth = 3
  for (let i = 1; i <= count; i++) {
    ctx.beginPath()
    ctx.arc(cx, cy, i * 80, 0, Math.PI * 2)
    ctx.stroke()
  }
}

// Tech logo grid on a flat dark face: 6 columns, centred.
function skillLogos(ctx: Ctx, s: CardSpec) {
  const icons = s.icons
  if (!icons) return // still loading
  const T = 96
  const GAP = 14
  const COLS = 6
  const x0 = (CARD_W - (COLS * T + (COLS - 1) * GAP)) / 2
  s.chips
    .filter((c) => icons.has(c))
    .slice(0, COLS * 5)
    .forEach((chip, i) => {
      const x = x0 + (i % COLS) * (T + GAP)
      const y = 130 + Math.floor(i / COLS) * (T + GAP)
      ctx.fillStyle = '#1f1f1d'
      ctx.strokeStyle = '#34342f'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.roundRect(x, y, T, T, 22)
      ctx.fill()
      ctx.stroke()
      ctx.drawImage(icons.get(chip)!, x + 21, y + 21, T - 42, T - 42)
    })
}

export const PAINTERS: Record<string, (ctx: Ctx, s: CardSpec, img: HTMLImageElement | null) => boolean> = {
  intro: photo('intro'),
  about: photo('about'),
  rowing: photo('rowing'),
  experience(ctx, _s, img) {
    ctx.fillStyle = '#0add90'
    ctx.fillRect(0, 0, CARD_W, CARD_H)
    rings(ctx, CARD_W, 0, 'rgba(10,10,10,0.14)')
    if (img) {
      const w = 460
      const h = Math.round(w * (img.height / img.width || 48 / 84))
      ctx.drawImage(tintedLogo(img, w, h, '#06231a'), (CARD_W - w) / 2, 300, w, h)
    }
    return true
  },
  education(ctx, _s, img) {
    // White centre fading to Marietta blue at the edges; the white title sits on the blue lower part.
    const g = ctx.createRadialGradient(CARD_W / 2, 380, 0, CARD_W / 2, 380, 560)
    g.addColorStop(0, '#ffffff')
    g.addColorStop(0.3, '#ffffff')
    g.addColorStop(0.8, '#2d6cb3')
    g.addColorStop(1, '#1f5ea8')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, CARD_W, CARD_H)
    const shade = ctx.createLinearGradient(0, CARD_H * 0.7, 0, CARD_H)
    shade.addColorStop(0, 'rgba(8,30,70,0)')
    shade.addColorStop(1, 'rgba(8,30,70,0.3)')
    ctx.fillStyle = shade
    ctx.fillRect(0, CARD_H * 0.7, CARD_W, CARD_H * 0.3)
    const top = ctx.createLinearGradient(0, 0, 0, 240)
    top.addColorStop(0, 'rgba(8,30,70,0.7)')
    top.addColorStop(1, 'rgba(8,30,70,0)')
    ctx.fillStyle = top
    ctx.fillRect(0, 0, CARD_W, 240)
    if (img) {
      const w = 520
      const h = Math.round(w * (img.height / img.width))
      ctx.drawImage(img, (CARD_W - w) / 2, 380 - h / 2, w, h)
    }
    return false
  },
  skills(ctx, s) {
    ctx.fillStyle = '#101010'
    ctx.fillRect(0, 0, CARD_W, CARD_H)
    skillLogos(ctx, s)
    return false
  },
  projects(ctx) {
    const g = ctx.createLinearGradient(0, 0, CARD_W, CARD_H)
    g.addColorStop(0, '#171d08')
    g.addColorStop(1, '#0d0f06')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, CARD_W, CARD_H)
    ctx.strokeStyle = 'rgba(217,242,79,0.1)'
    ctx.lineWidth = 2
    for (let i = 1; i < 9; i++) {
      ctx.beginPath()
      ctx.moveTo(0, 150 + i * 56)
      ctx.lineTo(CARD_W, 150 + i * 56)
      ctx.stroke()
    }
    const pts = [0, 0.55, 0.35, 0.6, 0.45, 0.75, 0.62, 0.9].map((v, i) => [60 + i * 86, 560 - v * 320])
    ctx.beginPath()
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y - 40) : ctx.moveTo(x, y - 40)))
    for (let i = pts.length - 1; i >= 0; i--) ctx.lineTo(pts[i][0], pts[i][1] + 40)
    ctx.closePath()
    ctx.fillStyle = 'rgba(217,242,79,0.14)'
    ctx.fill()
    ctx.beginPath()
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
    ctx.strokeStyle = ACCENT
    ctx.lineWidth = 6
    ctx.lineJoin = 'round'
    ctx.stroke()
    pts.forEach(([x, y]) => {
      ctx.fillStyle = INK
      ctx.beginPath()
      ctx.arc(x, y, 11, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = ACCENT
      ctx.lineWidth = 4
      ctx.stroke()
    })
    return false
  },
  learning(ctx) {
    const g = ctx.createLinearGradient(0, 0, CARD_W, CARD_H)
    g.addColorStop(0, ACCENT)
    g.addColorStop(1, '#8fcf3a')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, CARD_W, CARD_H)
    rings(ctx, CARD_W - 40, 220, 'rgba(10,10,10,0.16)', 6)
    return true
  },
  leadership(ctx) {
    const g = ctx.createLinearGradient(0, 0, CARD_W, CARD_H)
    g.addColorStop(0, '#2e2217')
    g.addColorStop(1, '#7a5430')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, CARD_W, CARD_H)
    ctx.strokeStyle = 'rgba(242,240,234,0.22)'
    ctx.lineWidth = 3
    for (let i = 0; i < 5; i++) {
      ctx.beginPath()
      ctx.roundRect(CARD_W - 120 - i * 70, 150 + i * 70, 120 + i * 70, 120 + i * 70, 24)
      ctx.stroke()
    }
    return false
  },
  contact(ctx) {
    ctx.fillStyle = OFFWHITE
    ctx.fillRect(0, 0, CARD_W, CARD_H)
    ctx.fillStyle = ACCENT
    ctx.beginPath()
    ctx.arc(CARD_W - 190, 330, 190, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = INK
    ctx.font = `800 250px ${FONT}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('@', CARD_W - 190, 345)
    return true
  },
}
