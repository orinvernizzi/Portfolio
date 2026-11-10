// Numbers shared by every spiral card drawing: card size, the font, and three colours.
// Which photo, logo and colours each card uses is set in cardFaces.ts, not here.
// ACCENT is the lime green used on the projects, learning and contact cards, and INK and OFFWHITE
// are the dark and light text colours. The site itself is white, these only touch the card faces.
// If you change CARD_W or CARD_H, the drawings in cardDrawing.ts are laid out for 720 x 960, so check every card.
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
