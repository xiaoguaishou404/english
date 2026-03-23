# AGENTS.md

## Cursor Cloud specific instructions

### Overview

This is a static single-page web application for learning the 3000 most frequent English words ("3000 高频词"). It has **no build tools, no package manager, no dependencies, and no backend**. The entire app is 4 files: `index.html`, `app.js`, `styles.css`, and `data/words.json`.

### Running the app

The app uses `fetch()` to load `data/words.json`, so it **must** be served over HTTP (not `file://`). Start any static file server from the workspace root:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080` in a browser.

### Key caveats

- **No linter, no tests, no build step**: There is no `package.json`, no test framework, and no lint configuration. Static analysis is limited to what a browser console or generic JS linter would catch.
- **All state is in `localStorage`**: Progress and notes persist in the browser. There is no server-side storage.
- **Modern CSS nesting**: `styles.css` uses native CSS nesting, which requires a recent browser (Chrome 120+, Firefox 117+).
