# Portfolio

My portfolio, in English and Spanish. Two views: a 3D spiral of cards (React Three Fiber) and a plain one-page list. Vite, React 19, TypeScript, Tailwind 4.

**Want to change something? Go to [START-HERE.md](START-HERE.md).**

How the main parts work, with diagrams: [docs/flowcharts/](docs/flowcharts/README.md).

## Run it

```powershell
npm install
npm run dev          # http://localhost:5173
npm run build        # type-check + build into dist/
npm run preview      # serve the build
npm run pictures     # redraw the project diagrams (needs internet and Edge or Chrome)
npm run folder-map   # redraw docs/folder-map.svg
npm run check-notes  # check every diagram box has a note, in EN and ES
```

## Where stuff is

| What | Where |
| --- | --- |
| All the text, EN and ES together | `src/content/*.json` (one per section) |
| Colours, fonts, sizes | `src/styles/theme.css` |
| Animations and effects | `src/styles/effects.css` |
| Menu cards: photo, logo, colours | `src/spiral/cardFaces.ts` |
| Corner badge and photo reel | `src/spiral/badgePhotos.ts` (list) and `public/photos` |
| Photos, logos, tech icons, project pictures, CVs | `public/` |
| How each opened card looks | `src/sections/` |
| Project diagrams (Mermaid text files + the script that draws them) | `tools/project-diagrams/mermaid/` |

## How it behaves

- Under 768px, with reduced motion, or without WebGL it starts on the list. You can still switch to the spiral unless there's no WebGL.
- Spiral: wheel, drag or arrow keys to move. Click a card, hit Enter, or use the menu to open it. Esc closes.
- The language choice is saved in `localStorage`. First visit uses the browser language.

## Deploy

Plain Vite app, no extra config. It's on Vercel: push to `main` and it rebuilds on its own. For a fresh setup, import the repo in Vercel with the Vite preset (build `npm run build`, output `dist`).
