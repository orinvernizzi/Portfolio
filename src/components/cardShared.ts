// Shared sizes, colors and types for the spiral card artwork.
export const CARD_W = 720
export const CARD_H = 960

export const FONT = '"Inter Variable", Inter, ui-sans-serif, system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
// Card faces keep their own lime accent; the site theme itself is white.
export const ACCENT = '#d9f24f'
export const INK = '#0a0a0a'
export const OFFWHITE = '#f2f0ea'

export interface CardSpec {
  id: string
  title: string
  index: number
  total: number
  chips: string[]
  // Skill logos by chip name: undefined while loading.
  icons?: Map<string, HTMLImageElement>
}

export type Ctx = CanvasRenderingContext2D

export const PHOTOS: Record<string, { src: string; fx: number; fy: number }> = {
  intro: { src: '/img/portrait.webp', fx: 0.5, fy: 0.05 },
  about: { src: '/img/rowing-paraguay.webp', fx: 0.5, fy: 0.5 },
  rowing: { src: '/img/rowing-hocr.webp', fx: 0.18, fy: 0.5 },
}
