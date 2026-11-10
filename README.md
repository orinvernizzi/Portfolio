# Portfolio

Bilingual (EN/ES) personal portfolio with two views: a 3D spiral of cards (React Three Fiber) and a classic single-page list. Built with Vite, React 19, TypeScript and Tailwind 4.

**Want to change something? Read [START-HERE.md](START-HERE.md).**

## Run it

```powershell
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check + production build into dist/
npm run preview   # serve the production build
npm run pictures    # redraw the project diagrams (tools/project-diagrams)
npm run folder-map  # redraw docs/folder-map.svg
```

## Where things live

| What | Where |
| --- | --- |
| All text, EN and ES side by side | `src/content/*.json` (one file per section) |
| Colours, fonts, sizes | `src/styles/theme.css` |
| Animations and effects | `src/styles/effects.css` |
| Menu cards: photo, logo, colours | `src/spiral/cardFaces.ts` |
| Corner badge and photo reel photos | `src/spiral/reel-photos/` |
| Photos, logos, tech icons, project pictures, CVs | `public/photos`, `public/logos`, `public/tech-icons`, `public/project-pictures`, `public/cv` |
| What each opened card looks like | `src/sections/` |
| Scripts that regenerate pictures (optional) | `tools/` |

## Behavior notes

- Default view is the list on screens under 768px, with reduced motion, or without WebGL. The spiral toggle stays available unless WebGL is missing.
- Spiral: wheel, touch/mouse drag or arrow keys move through the cards. Click a card, press Enter, or use the menu to open its panel. Esc closes it.
- The language choice is stored in `localStorage` and falls back to the browser language.

## Deploy to Vercel

It is a plain Vite SPA, so no extra config is needed.

1. Push the repo to GitHub and import it in Vercel.
2. Framework preset: Vite. Build command `npm run build`, output directory `dist`.
3. Deploy.
