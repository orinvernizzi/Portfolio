# project-screenshots

Makes the three project pictures that are screenshots (catch, dashboard, forecast), in English and Spanish.
You only need it to redo one of those pictures. The site does not use it while running.

- catch: follow `catch/capture.md`, then `python tools/project-screenshots/catch/to-webp.py <folder>`.
- dashboard: open `dashboard/dashboard.html?lang=en` (and `?lang=es`) at 1500x900, save two PNGs, then run `python tools/project-screenshots/dashboard/to-webp.py <folder>`.
- forecast: `python tools/project-screenshots/forecast/forecast.py` draws the chart and saves the WebP files itself (needs matplotlib).

Results land in `public/project-pictures/`. Python needs Pillow for the WebP step.
