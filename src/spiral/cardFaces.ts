// This is the table for the spiral menu cards: which photo, logo and colours each card face uses.
// Each key is a section id, the same ids as in src/content/interface.json. The title on the card
// comes from interface.json, the drawing code is in cardDrawing.ts, shared fonts and sizes are in cardStyle.ts.
//
// To change a card: edit its entry below and save. Photos and logos are paths inside /public,
// for example /photos/portrait.webp (the file is public/photos/portrait.webp).
// Not every field does something on every card. A photo only shows on intro, about and rowing.
// A logo only shows on experience and education. 'lines' is needed by experience, learning and leadership.
// A background with two colours is a diagonal gradient (projects, learning, leadership).
// Education has three: white centre, then two blues. The skills card gets its tech logos from skills.json.
// A brand new card also needs its own painter in cardDrawing.ts, see START-HERE.md.
import { ACCENT, OFFWHITE } from './cardStyle'

export interface CardFace {
  // Full-photo card. fx/fy (0 to 1) say which part of the photo stays in view when it is cropped.
  photo?: { src: string; fx: number; fy: number }
  // Logo drawn on the card.
  logo?: string
  // Face colour: one colour, or the gradient colours (direction and stops are set in cardDrawing.ts).
  background: string | string[]
  // Colour of the rings or outlines drawn over the background (only cards that have them).
  lines?: string
  // Colour the logo is filled with (only cards whose logo is recoloured).
  logoColor?: string
  // Title and number colour: 'white' on dark faces, 'dark' on light ones.
  titleColor: 'white' | 'dark'
}

export const CARD_FACES: Record<string, CardFace> = {
  intro: {
    photo: { src: '/photos/portrait.webp', fx: 0.5, fy: 0.05 },
    background: '#1a1a19',
    titleColor: 'white',
  },
  about: {
    photo: { src: '/photos/rowing-paraguay.webp', fx: 0.5, fy: 0.5 },
    background: '#1a1a19',
    titleColor: 'white',
  },
  experience: {
    logo: '/logos/itti-white.svg',
    background: '#0add90',
    lines: 'rgba(10,10,10,0.14)',
    logoColor: '#06231a',
    titleColor: 'dark',
  },
  skills: {
    background: '#101010',
    titleColor: 'white',
  },
  education: {
    logo: '/logos/marietta.svg',
    background: ['#ffffff', '#2d6cb3', '#1f5ea8'], // white centre, then the two blues at the edges
    titleColor: 'white',
  },
  projects: {
    background: ['#171d08', '#0d0f06'],
    titleColor: 'white',
  },
  rowing: {
    photo: { src: '/photos/rowing-hocr.webp', fx: 0.18, fy: 0.5 },
    background: '#1a1a19',
    titleColor: 'white',
  },
  learning: {
    background: [ACCENT, '#8fcf3a'],
    lines: 'rgba(10,10,10,0.16)',
    titleColor: 'dark',
  },
  leadership: {
    background: ['#2e2217', '#7a5430'],
    lines: 'rgba(242,240,234,0.22)',
    titleColor: 'white',
  },
  contact: {
    background: OFFWHITE,
    titleColor: 'dark',
  },
}
