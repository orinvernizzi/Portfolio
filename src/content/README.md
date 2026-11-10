# src/content: all the text of the site

One JSON file per section. Every file has the same shape at the top: `{ "en": ..., "es": ... }`.
English and Spanish live side by side in the same file, so change both or Spanish keeps the old text.
JSON cannot hold comments, so this page explains what the keys mean.

`index.ts` merges these files for the app. You never edit it unless you add a new section.

## Which file feeds which card

| Card on the menu | File | What is inside |
| --- | --- | --- |
| Hello | `site.json` | `meta`: `name`, `role`, `tagline`, `location`, `title` (browser tab), `description` (search result text). `links`: `email`, `linkedin`, `github`, `cv` |
| About me | `about.json` | `lead` (big sentence), `points` (numbered list) |
| Experience | `experience.json` | A list of entries: `period`, `role`, `org`, `place`, `logo`, `bullets` |
| Things I work with | `skills.json` | `groups` (each has `title` and `items`), `other` (dashed tags), `languages` (one line) |
| Education | `education.json` | A list of entries: `period`, `title`, `org`, `place`, `logo`, `url`, `urlOn`, `bullets` |
| Projects | `projects.json` | `groups`, `items` (the project cards), `art` (picture descriptions) |
| Rowing | `rowing.json` | `lead`, `rosterUrl`, `rosterLabel`, `medals` |
| Learning | `learning.json` | `lead`, `points` (bulleted list) |
| Leadership | `leadership.json` | `lead`, `items` (entries like the ones in experience, plus `text` and `photos`) |
| Contact | `contact.json` | `lead` (the sentence above the email). The email and buttons come from `site.json` |

`interface.json` is the text that is not a section: button labels, the ring text of the corner badge, picture descriptions, and the list of menu cards.

## Keys inside a timeline entry (experience, education, leadership)

- `period`: the date line above the heading.
- `role` (experience) or `title` (education, leadership): the heading.
- `org`, `place`: the grey line under the heading.
- `logo`: `itti`, `marietta`, `cambridge`, `cristorey` or `techo`. The list is `LOGOS` in `src/components/ui.tsx`.
- `url`: a link on the org name. With `"urlOn": "title"` the heading itself becomes the link.
- `bullets`: the list under the heading. `text`: one paragraph instead of a list.
- `photos` (leadership only): `"techo1"` and/or `"techo2"`. The files are named in `src/components/Timeline.tsx`.

## Keys inside a project (`projects.json`, `items`)

- `id`: also the name of the picture file. Do not rename it without renaming the pictures.
- `group`: must match the `id` of one of the `groups` above it (`itti`, `rowing`, `systems`, `web`).
- `title`, `tag` (small line above the title), `text` (short paragraph), `details` (bullets).
- `stack`: names of the tech tags. They show as plain text tags on the card.
- `legal` (highlighted box) and `note` (small grey text) are optional.
- `live` and `code`: optional buttons. `codeLabel` replaces the words "View code".
- `image`: `"webp"` for the screenshot projects (catch, forecast, dashboard). Leave it out for diagrams, which are SVG.
- `art` at the end of the file describes each picture for screen readers: `"art": { "<id>": { "label": "..." } }`.

## Keys inside a medal (`rowing.json`)

`medals`: `["silver"]`, `["bronze"]` or both (two medals drawn side by side). `label` (the big word), `event`, `place`, `year`.

## Keys in `interface.json`

- `ui`: button and label text. `badgeRing` is the text that runs around the corner badge, and `badgeLabel` is what a screen reader says for the badge.
  The `reel*` keys are the photo reel labels. `reelCounter` keeps `{n}` and `{total}` in place.
- `alt`: picture descriptions for the portrait, the rowing photos, the logos and the two TECHO photos.
- `sections`: the menu cards, in order. Each has `id` and `title`. The order here is the order around the spiral.
  The `id` must exist in `src/sections/registry.tsx` and `src/spiral/cardFaces.ts`.
