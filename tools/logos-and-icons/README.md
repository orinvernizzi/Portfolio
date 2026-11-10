# logos-and-icons

Two helper scripts for the small logos. You only need them when you add or recolour a logo.

- `build-icons.mjs` builds the skill logos in `public/tech-icons/` from the simple-icons and devicon packages. Run `node tools/logos-and-icons/build-icons.mjs`. To add one, add a line to `FROM_SI` in the script (slug, simple-icons name, optional colour), run it, then add a line in `src/lib/techIcons.ts`.
- `make-dark-logos.py` makes the light versions of the Marietta and Cambridge logos used on the black panels. Run `python -I tools/logos-and-icons/make-dark-logos.py` (needs Pillow).

Four icons (athena, dbt, excel, jsonschema) are copied in by hand and the script never touches them. pep9 and sql are small badges the script draws itself.
