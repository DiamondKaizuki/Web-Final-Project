<!-- Purpose: concise guidance for AI coding agents (Copilot/assistant)
     Focused on the concrete structure and conventions of this repository. -->

# Copilot / Assistant Instructions

This is a small static web app (vanilla HTML/CSS/JS). The repository contains three primary files:

- `index.html` — single-page UI and form elements
- `script.js` — all application logic (state, rendering, persistence)
- `style.css` — presentation and theming

Read this file before making edits so the assistant acts in line with local conventions.

## Big picture

- The app is purely client-side (no build system, no server-side code). You can run it by opening `index.html` in a browser or via a static server.
- App state lives in-memory in a `library` array inside `script.js` and is persisted to `localStorage` under the key `library`. The user's theme is persisted under `theme`.
- UI updates are fully imperative: `renderBooks()` re-creates DOM nodes for the whole library on each change.

## Important files & patterns (examples)

- `script.js` — key functions:
  - `loadLibrary()` — reads `localStorage` and populates `library` (safe JSON parse + Array check).
  - `saveLibrary()` — writes `library` to `localStorage` using `JSON.stringify`.
  - `renderBooks()` — clears `#libraryContainer` and appends cards for each book.
  - `startLinkEdit(book, card, ...)` — inline-edit flow for adding/editing a book's `link`.

- Data shape (example book object created on form submit):
  ```json
  {
    "id": 1660000000000,
    "title": "My Title",
    "author": "Author Name",
    "genre": "",
    "chapter": 1,
    "link": "https://...",
    "read": false
  }
  ```

- DOM conventions:
  - The app is wrapped in `DOMContentLoaded` in `script.js`.
  - Form id: `addBookForm`; container id: `libraryContainer` (it has `aria-live="polite"`).
  - Buttons use classes like `small-btn` and `danger` for styling.

## Developer workflows / how to run & debug

- Running locally (no build):
  - Open `index.html` directly in a browser, or serve with Live Server in VS Code.
  - Quick static server (PowerShell):
    ```powershell
    python -m http.server 8000
    # then open http://localhost:8000/index.html
    ```

- Debugging tips:
  - Use browser DevTools Console to inspect `localStorage.getItem('library')` and `localStorage.getItem('theme')`.
  - To reset state: `localStorage.removeItem('library')` and refresh.
  - To programmatically add/edit items for tests, open Console and manipulate the global `library` variable then call `saveLibrary()` + `renderBooks()`.

## Project-specific conventions and gotchas

- Single-file, imperative style: prefer changes that maintain the current approach (no sudden introduction of frameworks or bundlers).
- Re-render strategy: mutations update `library` then call `saveLibrary()` and `renderBooks()`; follow this sequence when adding features.
- IDs are generated with `Date.now()` in `script.js` — expect numeric timestamps for `id` values.
- Inline editing flows append inputs to a card and rely on `renderBooks()` to reset UI after saving/cancelling. Follow the same pattern for new inline edits.

## Safety & security notes for contributors

- `renderBooks()` sometimes uses `innerHTML` to build the author/genre meta block. When changing this code, prefer `textContent` or element creation to avoid introducing XSS when content may come from external sources.

## Integration points / external dependencies

- There are no external JavaScript libraries or build tools; no package.json. The only external interaction is `window.open()` for book links and `localStorage` for persistence.

## When you change things

- Keep changes minimal and in the same style: small functions, direct DOM manipulation, and the save/render flow.
- If adding new keys to the stored `library` objects, update `loadLibrary()` to handle older stored shapes gracefully.

## Examples of quick tasks (how an assistant should implement them)

- Add a 'Clear All' button: create a button in `index.html`, implement a click handler in `script.js` that calls `library = []; saveLibrary(); renderBooks();` and confirms with `confirm()`.
- Add validation for `link` format: update `startLinkEdit` and the form submit flow to validate URL values before saving (use `input.type='url'` and check `input.validity` or a try/catch on `new URL(value)`).

## If you find existing `.github/copilot-instructions.md` content

- Merge rather than overwrite: preserve any specific guidance already present (this project currently has no agent docs). If you update this file, keep it concise and include at least one in-repo example.

---
If anything here is unclear or you'd like more examples (e.g., exact code snippets from `script.js` to copy/paste for a change), tell me which area to expand and I'll iterate.
