# Premium Monochrome Redesign — Design Spec

Date: 2026-07-11

## Context

KALNET School ERP is a React 19 + TypeScript + Vite app using MUI v7, Tailwind v4,
Recharts, and Framer Motion (`motion` package — already installed, underused).
It serves 5 role-based portals (admin, teacher, staff, parent, student) across
~130 pages, all reading from a single 559-line `src/data/mock.ts` plus several
`*Store.ts` files in `src/data/`.

The current look uses default MUI indigo/amber accents, a static (non-collapsible)
sidebar, instant-toggle accordions, minimal animation (`KpiCard` is the only
component using `motion`), and ad hoc per-page chart color arrays. The goal is a
premium, polished, black/white/off-white monochrome product — visually anchored
to the KALNET brand's own marketing site (kalnet.co) — with real analytics depth
(charts, trends, breakdowns) across every dashboard, plus two entirely new
modules (Hostel, Mess) that don't exist in the codebase today.

## Goals

- Replace the default-MUI look with a premium monochrome + off-white design
  system, brand-anchored to kalnet.co's actual design tokens.
- Add a collapsible sidebar with animated nested navigation and a redesigned
  topbar.
- Build a reusable component library (stat cards, chart cards, tables, status
  chips) so the look is consistent everywhere and easy to extend.
- Restructure demo data into a dedicated `src/demo-data/` folder, split by
  domain, scaled up to a realistic mid-size school, with genuine time-series
  variation for analytics.
- Add two new modules — Hostel and Mess — with full data models, pages, nav
  entries, and role-based access.
- Rebuild all 5 dashboards with premium, chart-heavy analytics.
- Roll the new component library out to the remaining list/detail pages so the
  whole app is visually consistent.

## Non-goals

- No new external dependencies — MUI, Tailwind, Recharts, and `motion` are
  sufficient for everything specified here.
- No backend/API work — this stays a static demo-data-driven frontend.
- No bespoke, hand-designed layout for every one of the ~130 pages. Dashboards
  and key data-heavy screens (fees, exams, admissions, hostel, mess,
  attendance) get bespoke treatment; the remaining list/table/form pages get
  the shared component library applied (`DataTable` v2, `StatusChip`,
  `PageHeader` v2), which is sufficient to make them look consistent without
  individually redesigning each one.

## 1. Visual Design System

Tokens extracted directly from kalnet.co's production CSS bundle
(`--ed-bg-dark`, `--ed-bg-light`, `--ed-surface-dark`, `--ed-surface-white`,
`--ed-text-primary`, `--ed-text-muted`), validated for chart use via the
dataviz skill's palette validator against these exact surfaces.

### Palette

| Role | Light mode | Dark mode |
|---|---|---|
| Page background | `#FAFAFA` | `#0A0A0A` |
| Surface / card | `#FFFFFF` | `#1A1A1A` |
| Primary text | `#111111` | `#F5F5F4` |
| Muted text | `#666666` | `#9A9A97` |
| Hairline border | `rgba(0,0,0,.08)` | `rgba(255,255,255,.08)` |
| Sidebar (fixed, both modes) | `#0A0A0A` | `#0A0A0A` |

No brand hue is used for emphasis — weight, spacing, and contrast carry it
instead. Status colors (fee paid/pending/overdue, attendance present/absent/
late, library issued/returned/overdue, task/request pending/in-progress/
completed) stay a small reserved palette (muted green/amber/red), always
paired with an icon or text label, never color-alone.

### Chart color tokens

`src/theme/chartPalette.ts` exports the validated 8-hue categorical set (fixed
order, never cycled), a status palette, and a single-hue sequential ramp,
following the dataviz skill's color-formula rules:

- Categorical (light → dark step): blue `#2a78d6`/`#3987e5`, aqua
  `#1baf7a`/`#199e70`, yellow `#eda100`/`#c98500`, green `#008300`/`#008300`,
  violet `#4a3aa7`/`#9085e9`, red `#e34948`/`#e66767`, magenta
  `#e87ba4`/`#d55181`, orange `#eb6834`/`#d95926`.
- Validated with `validate_palette.js` against surfaces `#FAFAFA` (light) and
  `#0A0A0A` (dark): all six checks pass; CVD separation and contrast sit in
  the documented WARN/floor bands for a few slots (aqua, yellow, magenta on
  light; green↔yellow adjacency on dark) — per the skill, this requires
  **visible direct labels or a legend**, never color-alone identification, on
  any chart using those slots.
- Status palette (fixed, never themed): good `#0ca30c`, warning `#fab219`,
  serious `#ec835a`, critical `#d03b3b` — always icon+label paired.
- All charts consume this file rather than defining local `COLORS = [...]`
  arrays (the pattern used today in `admin/Dashboard.tsx`).

### Typography

System sans stack: `"Inter", "SF Pro Display", -apple-system, "Segoe UI",
Arial, sans-serif` (Inter is already the app's font; no new font loading
needed). Headings tighten tracking (`-0.02em`); small uppercase section/eyebrow
labels use wide tracking (`0.08–0.1em`). All metric values and table numeric
columns use `font-variant-numeric: tabular-nums`.

### Shape, elevation, motion

- Border radius: 12px cards/panels, 8px buttons/inputs, pill (9999px) status
  chips and badges — matches kalnet.co's actual radius usage.
- Shadows: soft and minimal (`0 1px 2px rgba(0,0,0,.04)` resting, `0 8px
  24px rgba(0,0,0,.08)` on hover/elevated) — no default MUI heavy elevation.
- Motion: single shared easing `cubic-bezier(.25,.46,.45,.94)` at `.2s`
  (matches kalnet.co). Applied via `motion`:
  - Staggered fade+slide-in for stat/card grids on mount.
  - Animated number count-up on `StatCard` values.
  - Smooth width transition for sidebar collapse/expand.
  - Animated chevron + height transition for nav accordions (replacing MUI's
    instant `Collapse`).
  - Hover-lift (translateY -2px + shadow increase) on interactive cards.
  - Fade transition on route/page change.

## 2. Layout & Navigation

### Sidebar (`src/components/Layout.tsx`, `navigation.tsx`)

- Collapsible between expanded (260px, icon+label) and rail (72px,
  icon-only + tooltip) via a toggle control at the sidebar's bottom edge.
  State persists to `localStorage`, keyed per role (`erp-sidebar-<role>`).
- Fixed dark (`#0A0A0A`) regardless of light/dark app mode.
- Nested sections get animated accordion expand/collapse with a rotating
  chevron, replacing the current instant-toggle `Collapse`.
- Active item indicated by a solid off-white pill, not the current flat
  indigo fill.
- Top-level nav items are grouped under small uppercase divider labels to
  make the long admin list (currently 13 flat top-level items) scannable —
  e.g. "ACADEMICS" (Students, Teachers, Academics, Attendance, Homework,
  Examinations), "OPERATIONS" (Transport, Hostel, Mess, Library-if-applicable),
  "FINANCE" (Fees), "ENGAGEMENT" (Communication), "ADMINISTRATION" (Staff,
  Reports, Settings). Same grouping approach applied to staff nav.
- Mobile: unchanged temporary full-overlay drawer, restyled to match; no
  rail mode on mobile.

### Topbar

- Slimmer bar, off-white/near-black per mode, hairline bottom border.
- Breadcrumb (via `PageHeader`) replaces the redundant persistent app title
  on inner pages.
- Global search (admin/staff), dark/light toggle, notifications badge,
  logout — restyled as consistent ghost icon buttons.

### Page shell

- Max content width constraint on very large viewports (avoid stretched
  empty layouts).
- Consistent padding scale.

## 3. Component Library (`src/components/`)

| Component | Replaces / status | Purpose |
|---|---|---|
| `StatCard` | Replaces `KpiCard.tsx` | Off-white/dark surface, hairline border, animated count-up value, optional trend delta (▲/▼ %, status-colored text only), optional sparkline. |
| `ChartCard` | New | Standard wrapper: eyebrow + title + optional filter control + chart body + legend/footnote. Every Recharts usage adopts this instead of a bare `Paper`. |
| `DataTable` (v2) | Upgrades existing | Adds density option, sticky header, hairline rows (no alternating color bands), `StatusChip`-aware cell rendering, built-in empty/loading state, optional pagination. |
| `StatusChip` | New | One component for every status enum in the app (fee, attendance, library, task/request) — consistent pill + icon per the reserved status palette. |
| `PageHeader` (v2) | Upgrades existing | Eyebrow label + title + optional trend/summary chip + trailing primary action + breadcrumb. |
| `EmptyState` | New | Icon + message + optional CTA, replacing ad hoc "No data found" text scattered per page. |

`src/theme/chartPalette.ts` is the single source of chart color tokens (see
§1). `src/theme.ts` is rewritten for the new palette/typography/shape and MUI
component overrides (buttons, cards, chips, tables) so unstyled MUI defaults
never leak through.

## 4. Demo Data Restructuring

`src/data/mock.ts` and the `*Store.ts` files move into a new `src/demo-data/`
folder, split by domain:

```
src/demo-data/
  academics/       classes.ts, subjects.ts, timetable.ts
  people/          students.ts, parents.ts, teachers.ts, staff.ts
  attendance/      studentAttendance.ts, teacherAttendance.ts
  exams/           exams.ts, marks.ts
  homework/        homework.ts
  fees/            feeStructure.ts, fees.ts, payments.ts, receipts.ts
  transport/       routes.ts, vehicles.ts, drivers.ts, allocations.ts
  hostel/          blocks.ts, rooms.ts, allocations.ts, fees.ts      (new)
  mess/            menu.ts, plans.ts, attendance.ts, billing.ts      (new)
  library/         books.ts, records.ts
  communication/   announcements.ts, notices.ts, messages.ts, notifications.ts
  staffOps/        tasks.ts, studentRequests.ts
  generators/       shared seeded-random helpers (names, dates, distributions)
  index.ts          re-exports everything, mirroring today's `@/data/mock` surface
```

All `@/data/*` imports across the app are updated to `@/demo-data/*`. The old
`src/data/` directory is removed once migration is verified (no dual-source
duplication).

### Scale

Mid-size school: ~450 students, ~35 teachers, ~15 support staff, ~280 parents.
A full 2025–26 academic year of attendance (~200 school days), 12 months of
fee-collection history with realistic monthly seasonality (collection spikes
near term starts), multi-exam mark history (unit tests + mid-term + finals ×
subject × student) so exam analytics shows real trends rather than one
snapshot.

### New: Hostel data model

- `HostelBlock` (id, name, gender, warden staff id)
- `HostelRoom` (id, block id, room no., type: single/double/dorm, capacity)
- `HostelAllocation` (student id, room id, check-in date, status)
- `HostelFee` (student id, amount, due date, status — follows existing `Fee`
  shape/pattern)
- ~120 hostel students seeded from the existing student pool (residential
  subset).

### New: Mess data model

- `MessMenuEntry` (day of week, meal: breakfast/lunch/snacks/dinner, items)
- `MessPlan` (student id, plan type: veg/non-veg, subscription tier)
- `MessAttendance` (student id, date, meal, consumed: boolean)
- `MessBilling` (student id, month, amount, status)

## 5. New Roles & Permissions

Two new `StaffRole` values, following the existing `canViewFeature` /
`StaffPermissionMap` pattern (`src/data/staffPermissions.ts` →
`src/demo-data/...`):

- `hostel_warden` — manage hostel allocation/rooms, view hostel fee status.
- `mess_manager` — manage mess menu/plans, mark daily meal attendance.

`StaffFeature` gains `"hostel"` and `"mess"` entries alongside the existing
`fees`/`transport`/`library`/etc.

## 6. Dashboards

All five dashboards are rebuilt on `StatCard` + `ChartCard` + the shared
chart palette, replacing today's bare `Paper`-based charts and local `COLORS`
arrays.

- **Admin**: hero `StatCard` row with trend deltas (Students, Staff,
  Attendance Today, Fee Collection Rate, Hostel Occupancy, Mess Plans
  Active) → 12-month fee collection trend (line, collected vs. due) →
  30-day attendance trend (line) → class-wise enrollment (bar) → fee status
  breakdown (donut, direct-labeled) → exam performance trend (line, avg
  score per exam) → hostel occupancy by block (bar) → weekly mess
  consumption trend (line) → side rail: recent admissions, fee-defaulter
  watchlist, recent announcements.
- **Teacher/HOD**: class attendance trend, homework completion rate,
  upcoming exams, marks-entry status; HOD adds department syllabus progress
  and cross-class performance comparison.
- **Staff**: role-conditional widgets (accountant → fee charts, transport
  manager → route/vehicle utilization, library staff → circulation stats,
  hostel_warden → occupancy/allocation status, mess_manager → daily
  consumption) plus their task list.
- **Parent**: per-child summary cards (attendance, fees due, upcoming
  exams), plus hostel/mess snapshot for resident children.
- **Student**: personal attendance trend, grade trend across exams (line
  chart replacing today's flat "latest results" list), homework status,
  hostel/mess snapshot if resident.

## 7. New Pages & Routes

Nav group "Operations" gains Hostel and Mess entries.

- **Admin**: Hostel Dashboard, Blocks & Rooms, Room Allocation, Hostel Fee
  Structure; Mess Dashboard, Weekly Menu, Mess Plans, Mess Billing.
- **Staff** (`hostel_warden`): Room Allocation, Roster. (`mess_manager`):
  Daily Meal Attendance, Menu view.
- **Parent/Student**: "My Hostel" (room, roommates, warden contact, dues),
  "My Mess" (current plan, this week's menu, dues).

Routes follow the existing `router.tsx` pattern (`admin/hostel`,
`admin/hostel/rooms`, `admin/mess`, `staff/hostel/...` guarded by
`StaffFeatureGuard` with the new `"hostel"`/`"mess"` features, `parent/hostel`,
`student/hostel`, etc.).

## 8. Rollout Phasing

1. Design tokens: rewrite `theme.ts`, add `chartPalette.ts`.
2. Component library: `StatCard`, `ChartCard`, `DataTable` v2, `StatusChip`,
   `PageHeader` v2, `EmptyState`.
3. Layout & navigation: collapsible sidebar, animated accordions, grouping,
   topbar restyle; add `hostel_warden`/`mess_manager` roles.
4. Demo data restructuring: move/split into `src/demo-data/`, scale up,
   add hostel & mess models; update all imports app-wide.
5. New Hostel & Mess modules: pages + routes for admin/staff/parent/student.
6. Rebuild all 5 dashboards with the new analytics widgets.
7. Sweep remaining list/detail pages to adopt `DataTable` v2 / `StatusChip` /
   `PageHeader` v2 for consistent look app-wide (batched by role/domain).
8. Verification: run the app, check light/dark modes, responsive behavior,
   animations, no regressions across all 5 portals.

## Testing / Verification

This is a frontend-only, static-data app with no existing test suite. Verification
is manual + build-based:

- `npm run build` (runs `tsc -b`) must pass with no type errors after each
  phase.
- `npm run lint` must pass.
- Manual browser walkthrough (via the `run` skill) of all 5 dashboards, the
  new Hostel/Mess pages, and a sample of swept list pages, in both light and
  dark mode, at desktop and mobile widths — confirming sidebar
  collapse/expand, nav accordion animation, chart rendering, and no visual
  regressions.
