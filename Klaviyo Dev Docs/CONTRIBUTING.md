# Klaviyo Dev Docs Contributor Note

## File Naming Convention
Use the following conventions for Markdown filenames in this directory tree:

- Use **Title Case** for major words (e.g., `Introduction to the Klaviyo Object.md`).
- Keep short connecting words lowercase unless they start the filename (e.g., `to`, `and`, `for`, `with`, `a`, `an`, `the`).
- Use **e-commerce** spelling with a hyphen and lowercase `e` in prose and titles.
- Preserve standard technical capitalization:
  - `API` (all caps)
  - `JavaScript` (capital J and S)
  - `Klaviyo` (capital K)
- Prefer readable, canonical wording and fix typos in filenames when discovered.

## Heading Convention
Use a consistent heading hierarchy in all Markdown files under `Klaviyo Dev Docs/`:

- Exactly one `#` title per file.
- Use `##` for primary sections.
- Use `###` for subsections under a `##` section, then continue incrementally (`####`, etc.) as needed.
- Do not wrap headings in bold markers (for example, avoid `## **Heading**`; use `## Heading`).

## Anchor Stability
When adjusting headings, preserve heading text whenever possible so generated table-of-contents anchors remain stable.

- If a heading text change is unavoidable and an old anchor is referenced elsewhere, add a short legacy-anchor note or explicit anchor alias near the updated heading.
- Before finishing, search for `](...#anchor)` references and verify they still resolve.

## Linting
This repo includes a Markdown lint configuration at `.markdownlint.json`.

- `MD001` enforces increment-by-one heading levels.
- `MD003` enforces ATX-style headings (`#` syntax).
- `MD041` enforces a top-level heading in each file.

Run markdownlint from the repository root to validate documentation updates.

## Renames and References
When renaming files, update any internal relative links and index/reference documents that point to old paths.
