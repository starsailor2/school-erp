---
name: run-school-erp
description: Build, launch, and drive the KALNET school-erp app (Vite + React + MUI SPA, 5 role portals - admin/teacher/staff/parent/student). Use when asked to run, start, test, or screenshot this app, or to verify a UI change actually works in the real running app.
---

# Run: school-erp (KALNET)

A Vite + React 19 + MUI v7 single-page app, frontend-only with static demo
data (no backend to start separately). Five role portals - admin, teacher,
staff, parent, student - all reached through one login flow, no real
credential check.

Driven with the generic **browser-driver** skill
(`~/.claude/skills/browser-driver/`) - this file documents this project's
specific URL, login flow, and routes; the driver itself is shared, not
reimplemented here. Read that skill's `SKILL.md` for the full command
reference before using the scripts below.

All paths below are relative to this project's root
(`c:\Users\srish\Downloads\KALNET PRODUCTS\school-erp`), not to this skill
directory.

## Prerequisites

Node v23.6.0 / npm 11.9.0 (whatever's on PATH - no version pin observed
in this repo). Dependencies:

```bash
npm install
```

## Build

```bash
npm run build    # tsc -b && vite build - must exit 0, no TypeScript errors
npm run lint      # eslint . - expect ~3 pre-existing warnings, 0 errors
```

## Run (agent path - drive it)

1. Start the dev server in the background and wait for it to serve:

```bash
(nohup npm run dev > /tmp/vite-dev.log 2>&1 & echo $! > /tmp/vite-dev.pid)
timeout 30 bash -c 'until curl -sf http://localhost:5173 >/dev/null 2>&1; do sleep 1; done'
```

Vite always serves on **5173** in this project (no other process competes
for it in dev). Stop it when done: `kill "$(cat /tmp/vite-dev.pid)"` (also
`pkill -f vite` as a fallback - background npm processes on Windows
sometimes survive the direct kill; see Gotchas).

2. Drive it with the generic driver. The login flow is the same shape for
   every role - only the portal name changes:

```bash
cd ~/.claude/skills/browser-driver
cat <<'EOF' | node driver.mjs --session school-erp
nav http://localhost:5173/
wait-for text=Select Your Portal
click text=Get started
wait-for role=button[name="Sign In"]
click role=button[name="Sign In"]
wait-for text=Admin Dashboard
screenshot admin-dashboard
console errors
quit
EOF
```

This logs into **Admin** (the first portal card) because `click text=Get
started` matches the *first* "Get started" link on the portal-selection
screen. To log into a different role, click that role's name first, e.g.
`click text=Teacher` before `click text=Get started`, or use `nth()`-style
targeting - the portal cards, in order, are: **Admin, Teacher, Student,
Parent, School Staff**. Each role's post-login landing text to `wait-for`:
`Admin Dashboard`, `My Dashboard` (teacher), `Staff Dashboard`,
`Parent Dashboard`, `Student Dashboard`.

Screenshots land at
`~/.claude/skills/browser-driver/sessions/school-erp/screenshots/`.

### Navigating after login

The sidebar is a single unified list: top-level items with sub-pages are
**accordions**, not links - clicking one only expands it, it does not
navigate. Click the item to expand, then click the child page you want:

```
click text=Students
wait-for text=Student Directory
click text=Student Directory
wait-for text=Adm. No.
screenshot student-directory
```

Or skip the sidebar entirely and `nav` straight to a route once logged in
(faster, and avoids the expand-then-click dance):

```
nav http://localhost:5173/admin/students
wait-for text=Adm. No.
```

Route shape is `/<role>/<module>/<page>`, e.g. `/admin/fees/defaulters`,
`/staff/tasks`, `/parent/attendance`. The full route table is in
`src/router.tsx` at the project root.

## Run (human path)

`npm run dev`, open `http://localhost:5173` in a browser, click a portal
card, click "Sign In" (no credentials needed). Ctrl-C to stop.

## Test

No test framework is installed in this repo (static demo-data app by
design). `npm run build` + `npm run lint` are the verification gates; the
driver script above is the closest thing to an integration test.

## Gotchas

- **Sidebar parent items don't navigate on click** - see above. This
  tripped up an earlier version of this skill's own verification script
  (clicked "Teachers", expected a URL change, got none - it just expanded
  the accordion).
- **First navigation to a lazy-loaded route needs `wait-for`, not a fixed
  sleep.** Every page component is `React.lazy()`-loaded; the first visit
  to a given route in a fresh session fetches that chunk and can take
  visibly longer than a short `sleep` - always `wait-for` real page
  content (a heading, a known label) rather than timing it.
- **`npm run dev` backgrounded on Windows can leave orphaned `node.exe`
  processes** even after `kill $(cat pid)` - `pkill -f vite` as a second
  step, or check `tasklist //FI "IMAGENAME eq node.exe"` /
  `Get-CimInstance Win32_Process -Filter "Name='node.exe'"` (PowerShell,
  to see full command lines) if a later `git worktree remove` or similar
  fails with a file-lock error.
- **The `main` content area is its own scroll container**, not the
  window (`overflow: auto` with a fixed height in `Layout.tsx`) - if you
  ever need to check scroll position via `eval`, target
  `document.querySelector("main").scrollTop`, not `window.scrollY`.

## Verified

Ran this session: full login flow to Admin Dashboard (screenshot
confirmed real dashboard content, zero console errors), then a sidebar
navigation flow (expand "Students" → click "Student Directory" → confirm
table content, zero console errors). Both via the browser-driver script
above, `--session school-erp`.
