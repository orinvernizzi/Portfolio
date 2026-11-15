# project-diagrams

Draws the pictures on the project cards that are diagrams, and the folder map in `docs/`. You only need it when you want to change one of them. The site never runs it.

Each diagram is a short text file written in Mermaid, a way of describing a diagram in words:

- `mermaid/<id>.en.mmd` and `mermaid/<id>.es.mmd`: one diagram per project and language. The ids are orquestador, pep9, vmm, sched, sudoku, db, web and portfolio.
- `mermaid/docs/folder-map.mmd`: the folder map used in START-HERE.md (English only).
- `mermaid/build-mermaid.mjs`: the script that draws them.

## Change or add a diagram

1. Edit the `.mmd` file, in both languages. The text inside the quotes is the label of a box. Write `<br/>` to break a label into two lines.
2. Run `npm run pictures`. For one diagram only: `node tools/project-diagrams/mermaid/build-mermaid.mjs sudoku`.
3. For a new project, copy an existing pair of files to `<id>.en.mmd` and `<id>.es.mmd` and edit them.

The script loads Mermaid from the web and draws in a hidden Edge or Chrome window, so it needs internet and one of those browsers. If either is missing it prints a message and leaves every file as it was.

## What it writes

- `public/project-pictures/<id>.<en|es>.svg`: the picture on the card.
- `src/content/pictureSizes.json`: the size of each picture. The Projects panel reads it so the page keeps the right space while the picture loads.
- `docs/folder-map.svg`: only when you run `npm run folder-map`, or `npm run pictures` (which draws everything).

Do not edit these files by hand. The next run overwrites them.

## Keep diagrams narrow

`MAX_WIDTH` at the top of the script is the widest a card diagram may be, in drawing units: 520. A phone shows the picture about 320 px wide, so a wider drawing would shrink its text below a readable size. A drawing narrower than 440 is centred on a canvas that wide, so the text looks about the same size on every card.

If a diagram is too wide, the script stops and names the file. Nothing is written. Put at most two boxes in a row, shorten the labels, or split a long chain into two rows.

Pictures in `docs/` are read on a computer, so they have their own limit, `MAX_WIDTH_DOCS` (900).

## Look and size of the drawings

The colours and the font size are in `config` near the top of the script (`themeVariables`). Boxes are measured with a wide font and extra spacing, so labels still fit when the viewer's monospace font is wider. The finished SVG has no scripts and no outside links, and each file stays under 40 kB.
