# AGENTS.md

## Cursor Cloud specific instructions

This is a static web application (no build step, no package manager, no dependencies). The 4 source files are:

- `index.html` — entry point
- `app.js` — vanilla JS application logic
- `styles.css` — CSS (uses native nesting)
- `data/words.json` — word data (12 batches, ~3000 words total)

### Running the dev server

A local HTTP server is **required** because the app uses `fetch()` to load `data/words.json`. Opening `index.html` via `file://` will fail with a CORS error.

```sh
python3 -m http.server 8080
```

Then open `http://localhost:8080` in Chrome.

### Lint / Test / Build

There are no lint, test, or build scripts. The project has no `package.json`, no CI config, and no automated tests.

### Key app behaviors for manual testing

- **Batch switching**: click batch pills at the top (第 1 批 … 第 12 批).
- **Mark word as known**: right-click a word card.
- **Record interaction (shrink card)**: left-click a word card.
- **Add note**: click a word card, then type in the input that appears.
- **Filter**: use 全部 / 未掌握 / 已掌握 / 有备注 buttons.
- All state is persisted in `localStorage`.
