# KALNET School ERP

A premium, monochrome-themed school management system with five role-based portals — Admin, Teacher, Staff, Parent, and Student. Built as a fully client-side demo: no backend, no real authentication — every screen runs on generated demo data so the whole app can be explored end to end out of the box.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 + TypeScript 5.8 (strict mode) |
| Build tool | Vite 6 |
| UI components | MUI (Material UI) v7 |
| Styling | Tailwind CSS v4 (utility layer) + MUI theme system |
| Charts | Recharts 2.15 |
| Animation | Motion (Framer Motion) |
| Routing | React Router 7 |
| Linting | ESLint 9 + typescript-eslint |

No server, no database — `localStorage` is used for the handful of screens where an action needs to "persist" (recording a fee payment, assigning a task, applying for leave, etc.), with in-memory demo data as the fallback/seed.

## Getting Started

```bash
npm install
npm run dev       # start the dev server (Vite)
npm run build     # type-check (tsc -b) + production build
npm run preview   # preview the production build locally
npm run lint      # ESLint
```

Open the dev server URL and pick a portal from the landing page — there's no login to get through; selecting a role signs you in as a fixed demo user for that role and drops you straight into its dashboard.

## Demo Logins

Each portal auto-signs in as a fixed demo persona (switchable via the portal-selection screen), so every page has real, connected data to show rather than empty states:

| Role | Demo user | Notes |
|---|---|---|
| Admin | Admin User | Full access to every module |
| Teacher | Mrs Mehta (`t1`) | Can switch between Subject Teacher / Class Teacher / HOD views via the teacher-type switcher in the top bar |
| Staff | Rajesh Kumar (`sf1`) | Accountant role by default; switchable via the staff-role switcher (Accountant, Transport Manager, Library Staff, Office Staff, Hostel Warden, Mess Manager) — each role sees a different nav/permission set |
| Parent | Mr Kumar (`par1`) | Linked to a child with hostel + mess data |
| Student | Amit Kumar (`stu1`) | Guaranteed hostel + mess allocation and a full academic history so nothing on the dashboard is empty |

## Design System

- **Palette**: strict two-tone monochrome per mode — light mode pairs pure white (`#FFFFFF`, elevated surfaces) with off-white (`#F5F5F5`, base/recessed surfaces); dark mode pairs pitch black (`#0A0A0A`) with soft-black (`#1D1D1F`). No other background colors are used anywhere in the app.
- **Accent colors**: nav icons and dashboard stat-card icons draw from a single validated categorical palette (`src/theme/chartPalette.ts`), hashed per feature so the same feature (e.g. "Attendance") keeps the same color everywhere it appears, across every portal.
- **Charts**: all built with Recharts, using the shared palette/tooltip helpers in `src/theme/chartPalette.ts` for consistent grid lines, tooltips, and status colors (paid/pending/overdue, present/absent/late, etc.) across every report.
- **Motion**: consistent easing/duration tokens (`src/theme/tokens.ts`) drive sidebar transitions, card entrances, count-up stat animations, and hover states throughout.
- **Sidebar**: collapsible (rail/expanded), grouped and collapsible nav sections, hover-to-preview when pinned collapsed, and a tree guide-line for nested sub-items.

## Project Structure

```
src/
├── components/       Shared UI: Layout (app shell + sidebar), DataTable, StatCard,
│                      ChartCard, StatusChip, PageHeader, EmptyState, role/type switchers
├── context/           AuthContext (role + demo user state), ColorModeContext (light/dark)
├── theme/              tokens.ts (colors/motion/radii), index.ts (MUI theme), chartPalette.ts
├── demo-data/         Generated demo data, grouped by domain (see below)
├── pages/
│   ├── admin/          53 pages — full school administration
│   ├── teacher/        25 pages — classes, attendance, marks, department tools
│   ├── staff/           26 pages — role-gated operational tools
│   ├── parent/          14 pages — child-scoped views
│   ├── student/         12 pages — self-scoped views
│   └── shared/          Pages reused across multiple portals (e.g. Notifications)
├── router.tsx          All routes, lazy-loaded per page, staff routes gated by permission
└── components/navigation.tsx   Per-role sidebar nav structure (grouped, with children)
```

### Demo data (`src/demo-data/`)

Generated deterministically (seeded PRNG) so the dataset is large and realistic but stable across reloads — 450 students, 35 teachers, 15 non-teaching staff, a full class/section/subject structure, and months of history for attendance, fees, and marks.

| Domain | Covers |
|---|---|
| `academics/` | Classes, sections, subjects, subject allocation, timetable |
| `people/` | Students, parents, teachers, staff |
| `attendance/` | Student and teacher attendance records |
| `exams/` | Exams, marks |
| `fees/` | Fee structure, fee records, payment/receipt history |
| `homework/` | Homework assignments |
| `hostel/` | Blocks, rooms, allocations, hostel fees |
| `mess/` | Weekly menu, meal plans, attendance, billing |
| `transport/` | Routes, vehicles, drivers, student allocations |
| `library/` | Book catalogue and circulation |
| `communication/` | Announcements, messages, notifications, parent-teacher meetings |
| `staffOps/` | Staff tasks, student requests, leave requests |
| `generators/` | Seeded PRNG + name pools used to build every dataset above |

## Portals & Key Modules

**Admin** — students (directory, admissions, transfer, documents), teachers (directory, subject/class-teacher/HOD assignment), academics (classes/sections/subjects/timetable), attendance (student/teacher, reports, analytics), homework monitoring, examinations (setup, schedule, marks, report cards, analytics), fees (structure, collection, defaulters, reports), transport, hostel, mess, communication (announcements, notices, messages, parent notifications), staff directory & roles, staff leave approval, school-wide reports, settings.

**Teacher** — classes/students, attendance (take + history), homework (assign + list), exams (marks entry, results), timetable, announcements, messages, leave requests, parent-teacher meetings, profile; class-teacher and HOD views unlock class management, student performance, parent communication, behaviour notes, and department-level tools (subject allocation, syllabus progress, exam review, department reports).

**Staff** — tasks, student lookup/requests, fee collection/records/receipts (accountant), transport routes/vehicles/drivers (transport manager), library books/issue/return/records (library staff), hostel allocation/roster (hostel warden), mess attendance/menu (mess manager), certificates/ID cards (office staff), leave requests, operational reports. Nav and page access are gated per staff role via `src/data/staffPermissions.ts`.

**Parent** — children overview, attendance, homework, timetable, exams & results, fees, transport, hostel, mess, announcements, messages, parent-teacher meeting requests, profile.

**Student** — profile, attendance, homework, timetable, exams & results (with a printable report card), announcements, messages, library, transport, hostel, mess.

### Notable feature modules

- **Hostel & Mess** — full block/room/allocation model with fee tracking (hostel) and weekly menu/plan/attendance/billing (mess), visible across admin, staff, parent, and student portals.
- **Staff Leave Management** — teachers and staff apply for leave and track status; admin reviews a combined approve/reject queue.
- **Parent-Teacher Meetings** — parents request a meeting with their child's actual class teacher; teachers confirm, decline, or mark it completed.
- **Printable Report Cards** — admin's Report Cards page and the student exam report-card dialog both support browser printing via a scoped print stylesheet.

## Notes for Contributors

- Path alias `@/*` resolves to `src/*` (see `vite.config.ts` / `tsconfig.app.json`).
- TypeScript strict mode is on, including `noUnusedLocals`/`noUnusedParameters` — keep imports and variables clean.
- New nav items must be added in both `src/router.tsx` (route) and `src/components/navigation.tsx` (sidebar entry) for the relevant portal(s).
- Chart colors, icon accents, and status colors should always come from `src/theme/chartPalette.ts` / `src/theme/tokens.ts` rather than new hardcoded hex values, to keep the monochrome-with-accents system consistent.
