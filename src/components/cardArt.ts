// Paints the artwork for each spiral card onto a 2D canvas (used as a texture).
import { CARD_H, CARD_W, FONT, INK, OFFWHITE, PHOTOS, type CardSpec, type Ctx } from './cardShared'
import { PAINTERS } from './cardPainters'
import { TECH_ICONS } from '../lib/techIcons'

const LOGOS: Record<string, string> = {
  experience: '/img/itti-white.svg',
  education: '/img/logos/marietta.svg',
}

const imageCache = new Map<string, Promise<HTMLImageElement>>()
function loadImage(src: string) {
  let p = imageCache.get(src)
  if (!p) {
    p = new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })
    imageCache.set(src, p)
  }
  return p
}

// Canvas text only uses a web font once it is loaded, so wait for it first.
async function loadFonts() {
  const sample = 'ÁÉÍÓÚáéíóúñ¿¡Aa'
  try {
    await Promise.all([
      document.fonts.load('800 64px "Inter Variable"', sample),
      document.fonts.load('600 64px "Inter Variable"', sample),
    ])
  } catch {
    // fall back to the system font
  }
}

export async function paintCard(canvas: HTMLCanvasElement, spec: CardSpec, onUpdate: () => void) {
  await loadFonts()
  draw(canvas, spec, null)
  onUpdate()
  if (spec.id === 'skills') return paintSkillIcons(canvas, spec, onUpdate)
  const src = PHOTOS[spec.id]?.src ?? LOGOS[spec.id]
  if (!src) return
  try {
    const img = await loadImage(src)
    draw(canvas, spec, img)
    onUpdate()
  } catch {
    // keep the base artwork if the image fails
  }
}

async function paintSkillIcons(canvas: HTMLCanvasElement, spec: CardSpec, onUpdate: () => void) {
  const icons = new Map<string, HTMLImageElement>()
  await Promise.all(
    spec.chips.map(async (chip) => {
      const t = TECH_ICONS[chip]
      if (!t) return
      try {
        icons.set(chip, await loadImage(`/icons/${t.slug}.svg`))
      } catch {
        // skip logos that fail to load
      }
    }),
  )
  draw(canvas, { ...spec, icons }, null)
  onUpdate()
}

function draw(canvas: HTMLCanvasElement, spec: CardSpec, img: HTMLImageElement | null) {
  canvas.width = CARD_W
  canvas.height = CARD_H
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, CARD_W, CARD_H)
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(0, 0, CARD_W, CARD_H, 36)
  ctx.clip()

  const light = PAINTERS[spec.id]?.(ctx, spec, img) ?? false
  if (PHOTOS[spec.id]) {
    const g = ctx.createLinearGradient(0, CARD_H * 0.5, 0, CARD_H)
    g.addColorStop(0, 'rgba(0,0,0,0)')
    g.addColorStop(1, 'rgba(0,0,0,0.82)')
    ctx.fillStyle = g
    ctx.fillRect(0, CARD_H * 0.5, CARD_W, CARD_H * 0.5)
  }
  label(ctx, spec, light)
  ctx.restore()
}

function label(ctx: Ctx, spec: CardSpec, light: boolean) {
  const fg = light ? INK : OFFWHITE
  const num = String(spec.index + 1).padStart(2, '0')
  ctx.font = `600 28px ${FONT}`
  ctx.textBaseline = 'middle'
  ctx.fillStyle = light ? 'rgba(10,10,10,0.12)' : 'rgba(255,255,255,0.16)'
  ctx.beginPath()
  ctx.roundRect(40, 40, 96, 48, 24)
  ctx.fill()
  ctx.fillStyle = fg
  ctx.textAlign = 'center'
  ctx.fillText(num, 88, 65)

  // Biggest size that fits in two lines and never overflows the card width.
  const maxW = CARD_W - 96
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  let size = 88
  let lines: string[] = []
  for (; size >= 40; size -= 4) {
    ctx.font = `800 ${size}px ${FONT}`
    lines = wrap(ctx, spec.title, maxW)
    if (lines.length <= 2 && lines.every((l) => ctx.measureText(l).width <= maxW)) break
  }
  ctx.fillStyle = fg
  const lineH = size * 0.98
  const startY = CARD_H - 56 - (lines.length - 1) * lineH
  lines.forEach((l, i) => ctx.fillText(l, 48, startY + i * lineH))
}

function wrap(ctx: Ctx, text: string, maxW: number) {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(' ')) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line)
      line = word
    } else line = test
  }
  if (line) lines.push(line)
  return lines
}
