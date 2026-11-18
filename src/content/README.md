# src/content: all the text on the site

One JSON per section, all shaped `{ "en": ..., "es": ... }`. EN and ES live in the same file, so change both or Spanish keeps the old text.
JSON can't have comments, so this page says what the keys mean.

`index.ts` merges these files for the app. Only touch it when adding a new section.

## Which file feeds which card

| Card | File | What's inside |
| --- | --- | --- |
| Hello | `site.json` | `meta`: `name`, `role`, `tagline`, `location`, `title` (browser tab), `description` (search result text). `links`: `email`, `linkedin`, `github`, `cv` |
| About me | `about.json` | `lead` (big sentence), `points` (numbered list) |
| Experience | `experience.json` | list of entries: `period`, `role`, `org`, `place`, `logo`, `bullets` |
| Things I work with | `skills.json` | `groups` (each has `title` and `items`), `other` (dashed tags), `languages` (one line) |
| Education | `education.json` | list of entries: `period`, `title`, `org`, `place`, `logo`, `url`, `urlOn`, `bullets` |
| Projects | `projects.json` | `groups`, `items` (the project cards), `art` (picture descriptions), `diagramNotes` (what each diagram box says when tapped) |
| Rowing | `rowing.json` | `lead`, `rosterUrl`, `rosterLabel`, `medals` |
| Learning | `learning.json` | `lead`, `points` (bullets) |
| Leadership | `leadership.json` | `lead`, `items` (like experience entries, plus `text` and `photos`) |
| Contact | `contact.json` | `lead` (the line above the email). Email and buttons come from `site.json` |

`interface.json` is everything that isn't a section: button labels, the corner badge ring text, picture descriptions, and the list of menu cards.

## Timeline entry keys (experience, education, leadership)

- `period`: the date line above the heading.
- `role` (experience) or `title` (education, leadership): the heading.
- `org`, `place`: the grey line under it.
- `logo`: `itti`, `marietta`, `cambridge`, `cristorey` or `techo`. The list is `LOGOS` in `src/components/ui.tsx`.
- `url`: link on the org name. With `"urlOn": "title"` the heading is the link instead.
- `bullets`: the list under the heading. `text`: one paragraph instead of a list.
- `photos` (leadership only): `"techo1"` and/or `"techo2"`. The files are named in `src/components/Timeline.tsx`.

## Project keys (`projects.json`, `items`)

- `id`: also the picture file name. Don't rename it without renaming the pictures.
- `group`: has to match one of the `groups` ids above it (`itti`, `rowing`, `systems`, `web`).
- `title`, `tag` (small line above the title), `text` (short paragraph), `details` (bullets).
- `stack`: tech names, shown as plain text tags.
- `legal` (highlighted box) and `note` (small grey text): optional.
- `live` and `code`: optional buttons. `codeLabel` replaces "View code".
- `image`: `"webp"` for the screenshot projects (catch, forecast, dashboard). Leave it out for diagrams (SVG). The `portfolio` item, last card in Web, is about this site and is a diagram.
- `art` at the end: screen reader text for each picture, `"art": { "<id>": { "label": "..." } }`.
- `diagramNotes`, after `art`: one short sentence per diagram box, shown when someone taps it in the big diagram: `"diagramNotes": { "<project id>": { "<box id>": "..." } }`. The box id is the name before `["` in the `.mmd` file (`T` in `T["TLB<br/>16 entries"]`). `npm run check-notes` checks every box has a note in both languages.
- `pictureSizes.json` (this folder) isn't text. `npm run pictures` writes it with each diagram's size, so the page saves room for it. Don't edit it by hand.

## Medal keys (`rowing.json`)

`medals`: `["silver"]`, `["bronze"]` or both (two medals side by side). `label` (the big word), `event`, `place`, `year`.

## `interface.json` keys

- `ui`: buttons and labels. `badgeRing` is the text spinning around the corner badge, `badgeLabel` is what a screen reader says for it.
  `reel*` keys are the photo reel labels. `reelCounter` keeps `{n}` and `{total}` in place.
  `diagramExplore` is the small badge on diagram pictures, `diagramHint` is the line under a big diagram before a box is tapped, and `zoomIn`, `zoomOut`, `zoomReset` are its zoom buttons.
- `alt`: picture descriptions for the portrait, rowing photos, logos and the two TECHO photos.
- `sections`: the menu cards, in order (that's the order around the spiral). Each has `id` and `title`.
  The `id` has to exist in `src/sections/registry.tsx` and `src/spiral/cardFaces.ts`.
