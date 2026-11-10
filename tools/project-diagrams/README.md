# project-diagrams

Draws the 7 project pictures that are diagrams (orquestador, pep9, vmm, sched, sudoku, db, web), in English and Spanish.
You only need it when you want to change one of those pictures. The site does not use it while running.

Each `<id>.mjs` describes one diagram (its text is in the `strings` at the top). Run `npm run pictures` to redraw all of them,
or `node tools/project-diagrams/build.mjs sudoku` for one. It writes the editable `sources/<id>.<lang>.excalidraw` files
and the finished `public/project-pictures/<id>.<lang>.svg`. It needs internet and Edge or Chrome; without them it uses the offline converter.

`folder-map.mjs` is different: it draws the folder map used in START-HERE.md. Run `npm run folder-map`. It writes `docs/folder-map.excalidraw` and `docs/folder-map.svg`.
