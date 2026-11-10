# How the Catch Analysis picture is made

The app has a dev-only demo mode with invented in-memory data (no account, nothing saved).

1. In the app folder run `node node_modules/vite/bin/vite.js --port 5189` and open `http://localhost:5189/?demo`
   in a 1500x900 browser window.
2. EN: click "Previous week" (the current week is mostly empty), then open the "Stats" menu. Screenshot.
3. ES: Settings, "Español", back to the Week page, "Semana anterior", open "Datos". Screenshot.
4. Save as `catch-en.png` / `catch-es.png`, then `python tools/catch-mock/to-webp.py <folder>`.

No data files are kept here. The card fades the picture into the title with a CSS mask (see Projects.tsx).
