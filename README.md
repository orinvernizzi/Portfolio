# Portfolio

Bilingual (EN/ES) personal portfolio with two views: a 3D spiral of cards (React Three Fiber) and a classic single-page list. Built with Vite, React 19, TypeScript and Tailwind 4.

## Run it

```powershell
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build into dist/
npm run preview  # serve the production build
```

## Edit the content

All text lives in two files with the same shape:

- `src/content/en.json`
- `src/content/es.json`

Change text there; both languages update together. Images are in `public/img`, CVs in `public/cv` (the path comes from `links.cv`). To add a section, add it to `sections` in both JSON files and register a component in `src/sections/registry.tsx` (and a card painter in `src/components/cardArt.ts` for the spiral).

## Behavior notes

- Default view is the list on screens under 768px, with reduced motion, or without WebGL. The spiral toggle stays available unless WebGL is missing.
- Spiral: wheel, touch/mouse drag or arrow keys move through the cards. Click a card, press Enter, or use the menu to open its panel. Esc closes it.
- The language choice is stored in `localStorage` and falls back to the browser language.

## Deploy to Vercel

It is a plain Vite SPA, so no extra config is needed.

1. Push the repo to GitHub and import it in Vercel.
2. Framework preset: Vite. Build command `npm run build`, output directory `dist`.
3. Deploy.
