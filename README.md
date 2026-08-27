# ITFlow — IT Helpdesk / Issue Tracking (Frontend Chunk 1)

This is the complete frontend UI and architecture for ITFlow, an internal
IT support product. It ships with realistic mock data and a service-layer
architecture so the FastAPI backend + WebSocket server can be wired in
later **without redesigning the UI**.

## Run it

```bash
npm install
npm run dev
```

Open the printed local URL (usually http://localhost:5173). You'll land
on the login screen — pick **Employee demo** or **Admin demo** and hit
Login (authentication is mocked; any email/password works).

```bash
npm run build     # production build → dist/
npm run preview   # serve the production build locally
```

## What's here

- **React + Vite + Tailwind CSS v4 + shadcn-style patterns + React
  Router + Zustand + Recharts + Lucide icons**
- Dark navy/blue "futuristic enterprise" theme by default, with a light
  theme architecture ready (`data-theme` on `<html>`, CSS variables in
  `src/styles/tokens.css`)
- Full employee and admin experiences: dashboards, issue tables, issue
  details with a chat-style communication panel, a drag-and-drop Kanban
  board (`New → Queued → Assigned → In Progress → Waiting → Resolved →
  Closed`), report-a-problem form with live preview, solved-tasks
  history, messages inbox, notifications, performance analytics,
  employee/IT-team management, reports, audit logs, and settings
- A global command palette (`Ctrl/Cmd + K`) and a "+ New Issue" quick
  create modal available from any page
- `src/services/api/*` — mock-data-backed service functions shaped like
  the future FastAPI responses; swap the internals for real `fetch`
  calls later without touching components
- `src/services/websocket/wsClient.js` — placeholder real-time client
  with `on()`, `connect()`, and status events already wired into the
  UI's connection indicator; replace the internals with a real
  `WebSocket` when the backend exists
- `src/store/*` — Zustand stores for UI state, mock auth/role, and
  connection status
- `src/mock/*` — all mock data, separate from components

## Not implemented yet (by design — this is Chunk 1)

FastAPI backend, database, real authentication/JWT, real email, real
WebSocket connection, real Electron packaging, real file storage, and
persistence of settings. Everything is architected so these can be
added in the next chunk without touching the UI structure.
