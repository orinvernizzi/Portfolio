# project-diagrams

Draws the diagram pictures on the project cards, plus the folder map in `docs/`. Only needed when changing one. The site never runs it.

Each diagram is a short Mermaid text file (a diagram written in words):

- `mermaid/<id>.en.mmd` and `mermaid/<id>.es.mmd`: one per project and language. Ids: orquestador, pep9, vmm, sched, sudoku, db, web.
- `mermaid/docs/folder-map.mmd`: the folder map in START-HERE.md (English only).
- `mermaid/build-mermaid.mjs`: the script that draws them.

## Change or add a diagram

1. Edit the `.mmd`, both languages. Text inside the quotes = box label. `<br/>` splits a label into two lines.
2. Run `npm run pictures`. Just one: `node tools/project-diagrams/mermaid/build-mermaid.mjs sudoku`.
3. New project: copy a pair to `<id>.en.mmd` and `<id>.es.mmd` and edit them.

The script loads Mermaid from the web and draws in a hidden Edge or Chrome window, so it needs internet and one of those. Missing either? It says so and leaves every file alone.

## What it writes

- `public/project-pictures/<id>.<en|es>.svg`: the card picture.
- `src/content/pictureSizes.json`: each picture's size, so the Projects panel saves the right space while it loads.
- `docs/folder-map.svg`: only with `npm run folder-map` or `npm run pictures` (which draws everything).

Don't edit these by hand, the next run overwrites them.

## Keep diagrams narrow

`MAX_WIDTH` at the top of the script is the widest a card diagram can be: 520 drawing units. A phone shows it about 320 px wide, so anything wider makes the text unreadable. Anything narrower than 440 gets centred on a 440 canvas so text looks the same size on every card.

Too wide? The script stops, names the file, writes nothing. Max two boxes per row, shorter labels, or split a long chain into two rows.

`docs/` pictures are read on a computer, so they get their own limit, `MAX_WIDTH_DOCS` (900).

## Look and size

Colours and font size are in `config` near the top of the script (`themeVariables`). Boxes are measured with a wide font and extra spacing so labels still fit if the viewer's monospace font is wider. The SVGs have no scripts and no outside links, and each stays under 40 kB.
