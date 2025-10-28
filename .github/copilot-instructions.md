# Copilot instructions for TalentFlow (talentflow-app)

Quick goal: help an AI coding agent be immediately productive fixing bugs, adding features, and running the app locally.

- Run locally (dev server)
  - Prereqs: Node 16+ and npm.
  - Install and start:
    - npm install
    - npm start
  - If `react-scripts` is missing: npm install react-scripts@5.0.1 --save
  - If you hit MSW import errors (e.g. setupWorker/rest not found): pin `msw` to v1 (we use ^1.2.1).

- Where to look first (key files)
  - src/mock/browser.js — registers MSW worker (imports setupWorker)
  - src/mock/handlers.js — all mocked API routes; controls latency and error simulation (see shouldError())
  - src/db/index.js — Dexie (IndexedDB) database schema and helpers
  - src/data/seed.js — client-side seeding logic used on first load (clear IndexedDB to reseed)
  - src/pages/JobsBoard.js and src/components/Candidates/KanbanBoard.js — examples of drag & drop (react-beautiful-dnd)
  - talentflow-app/package.json — scripts and top-level dependencies

- High-level architecture / why
  - Local-first UI: components call fetch('/api/...') which is intercepted by MSW; MSW handlers read/write Dexie (src/db) so the app feels like a real client/server
  - MSW simulates latency and random write failures (see handlers.js -> shouldError()). Tests and UI rely on optimistic updates with rollback.
  - Large lists use virtualization (react-window) for performance. Drag & drop uses react-beautiful-dnd in JobsBoard/Kanban.

- Typical developer workflows and gotchas
  - Start dev server: npm install && npm start (browser opens at http://localhost:3000)
  - To reset data: clear site storage/IndexedDB in browser devtools and reload — seeding runs client-side.
  - If you add/change MSW handlers, restart the dev server.
  - ESLint warnings are present but do not block runtime; fix unused-vars and missing deps in useEffect as normal.

- Common runtime errors and immediate fixes (examples seen in repo)
  - Cannot find module 'react-beautiful-dnd' => npm install react-beautiful-dnd --save
  - 'setupWorker' or 'rest' not exported from 'msw' => use msw v1 (we pin to ^1.2.1); then npm install
  - 'react-scripts' not recognized => npm install react-scripts@5.0.1 --save

- Project-specific patterns to follow
  - API calls: use fetch('/api/...') (MSW handlers mimic REST endpoints in src/mock)
  - Data shape examples: jobs contain {id, order, status, title}; candidates include {id, stage, name, email}
  - Optimistic updates: UI updates first, then PATCH to /api/...; rollback by re-fetching data on failure (see JobsBoard.handleDragEnd)
  - Artificial errors/latency: controlled in src/mock/handlers.js for resilience testing

- Debugging tips for agents
  - Reproduce errors in browser console first; check stack trace to find the failing module and file path.
  - Grep for a symbol when unsure (e.g., search for "setupWorker" or "react-beautiful-dnd" to find all usages).
  - To re-seed or test persistence edge cases, clear IndexedDB and refresh.

If anything above is unclear or you want this file to include run/debug commands tailored to your OS/shell, tell me which shell and I will add exact commands and quick-fix snippets.
