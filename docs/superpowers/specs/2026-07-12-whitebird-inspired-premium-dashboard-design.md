# Whitebird-Inspired Premium Dashboard System — Phase 1 Design Spec

Date: 2026-07-12

## Context

The 2026-07-11 redesign (`2026-07-11-premium-monochrome-redesign-design.md`) established
KALNET's current look: a strict black/white/off-white monochrome system, a single
collapsible sidebar, and a `StatCard`/`ChartCard`/`DataTable`/`StatusChip` component
library. It's live across all 5 portals.

The user shared product screenshots and marketing copy from whitebird.ai — an
AI-native, multi-product campus ERP (Iris/Atlas/Pegasus divisions covering
admissions/CRM, ERP/finance/HR, and learning). Two kinds of material were shared:

1. **UI screenshots** of real product surfaces: a payment-reconciliation list
   ("auto-matched to fee demands", 94% confidence, checkmark/pending rows), a
   student directory table (colored two/three-letter section badges, status
   pills, a "CSE-A → CSE-B · Transfer · 14 Aug" transfer indicator), a
   defaulter-escalation panel (horizontal stepper: Reminder → Notice → Penalty →
   Escalate, done/active/pending states, plus a list of severity-tagged items
   each with a colored icon avatar), an AI marks-grading view (annotated exam
   scan + rubric checklist, out of scope for Phase 1 — see Backlog), a result-
   publication pipeline (vertical timeline/stepper with nested progress chips
   like "94 of 96 clear" and "ETA 4 min"), a full finance dashboard (colored
   stat-card icon chips with trend arrows, an area/line trend chart, a
   multi-color donut with a legend, a tabbed pending-fee table, a
   recent-transactions table with payment-mode icons), and an attendance-
   marking page (icon-only primary sidebar + a full contextual secondary
   sidebar for the Attendance module, live-status banners, scoped alerts).
2. **Marketing copy** describing whitebird's full product catalog and its
   "AI built in, not bolted on" narrative: per-page AI agents, a natural-
   language data query box, an AI timetable solver, smart promotion, a bank-
   statement parser, cascading updates ("one change, six consequences"), and a
   universal Command Center (⌘K).

The user wants KALNET to adopt both the visual language (item 1) and, eventually,
a curated set of the AI-native feature concepts (item 2) — scaled across
departments and roles. That combined ask is too large for one spec, so it's
split into a roadmap (below) with only Phase 1 fully designed here.

## Roadmap

**Phase 1 — Premium visual/component system** *(this spec)*. Color, new
component patterns, two-tier navigation, all 5 dashboards rebuilt, and a
visual-only reskin of the existing pages that most closely match the
reference screenshots. No new AI logic or data models — every widget here
renders data KALNET already has mocked.

**Phase 2 — One signature AI-native feature per department** *(future specs,
each brainstormed and speced separately before being built)*:
- **Finance** → Payment Reconciliation: an "auto-matched to fee demands" list
  with a confidence badge, added to Fee Collection — simulated matching of
  incoming payments against outstanding fee demands, with manual override for
  unmatched rows.
- **Academics & Exams** → Result Publication Pipeline: the vertical timeline
  (marks locked → AI validation → moderation → SGPA/CGPA computed → registrar
  sign-off → publish), added to Marks Overview / Report Cards / Exam Schedule.
- **Admin / cross-cutting** → Command Center (⌘K): a global fuzzy search +
  action palette over students, staff, rooms, and subjects, available from
  every portal.

**Backlog** *(named for continuity, not yet speced)*: Smart Promotion (AI
batch promotion decisions), AI Timetable Solver (constraint-based schedule
generation), natural-language data query ("show students with attendance
below 75%"), At-Risk Prediction, Fee Collection Predictor, Smart Exam
Seating, AI marks-grading annotation view, and the "one change, six
consequences" cascading-update demo (`admin/StudentTransfer.tsx` is a natural
home for this — it already models cross-section transfer).

**Phase 3 — cross-module workspace glue** *(optional, only if Phase 1 + 2 land
well)*: deeper interconnection polish — Command Center deep-links into
modules, cascading-update toasts fed by Phase 2 automations, a unified
activity feed.

## Goals (Phase 1)

- Extend the existing categorical chart palette into *content-identity*
  surfaces only (stat-card icon chips, category tags, severity avatars) so
  the app reads as intentionally colorful where color carries meaning — not
  as blanket decoration on structural chrome (see the Color System amendment
  below).
- Add five new reusable components — `CategoryTag`, `PipelineStepper`,
  `SeverityAvatar`, `MetaChip`, and a donut+legend `ChartCard` pattern — used
  consistently wherever the reference patterns apply.
- Replace the single collapsible sidebar with a two-tier navigation shell:
  an always-present icon-only rail plus a contextual secondary sidebar, richer
  for data-heavy modules (Fees, Attendance, Exams, Hostel, Mess). Icons in
  this shell are monochrome, not domain-colored (amendment below).
- Adopt a denser, Linear-inspired layout rhythm — tighter row heights, a
  smaller icon scale for chrome, and an inline metadata-chip pattern for
  list/detail rows — applied through shared components (`DataTable`,
  `PageHeader`, nav) so it reaches every page that already consumes them,
  not just the flagship reskins.
- Rebuild all 5 role dashboards on the restyled component set.
- Reskin the existing pages that are the closest analogs to the reference
  screenshots: Fee Defaulters (escalation stepper), Student Directory /
  Student Transfer (category tags, transfer indicator), Marks Overview /
  Report Cards (visual polish only).

## Non-goals (Phase 1)

- No new AI/automation logic, no new data models — that's Phase 2. Any
  "auto-matched" / "AI validated" style copy is explicitly out of scope here;
  Phase 1 widgets describe what the data *is*, not what an AI *decided*.
- No hand-authored redesign of the remaining ~120 non-flagship list/detail
  pages — they inherit the new nav shell and the denser `DataTable`/
  `PageHeader` defaults automatically, the same way they already inherited
  `DataTable` v2 / `StatusChip` / `PageHeader` v2 in the prior redesign. No
  page-by-page edits beyond the flagship reskins.
- No change to the base neutral surfaces (page background, card white/near-
  black) established in the prior redesign — the color shift is in accents,
  not the underlying two-tone system.
- The AI-grading annotated-exam-paper view is not built in Phase 1 — it's a
  materially different, higher-effort feature (simulated OCR + inline
  annotations) tracked in the Backlog.

## 1. Color System

Reuse of `src/theme/chartPalette.ts`'s existing validated 8-hue categorical
set and 4-color status set, extended from chart-only into UI chrome, with one
firm rule: **the two palettes never mix roles on the same surface.**

- **Status palette** (`good`/`warning`/`serious`/`critical`) stays reserved
  exclusively for state — `StatusChip`, trend arrows, `SeverityAvatar` fill,
  and `PipelineStepper` done/active/pending coloring. This is unchanged from
  today.
- **Domain-identity color** (new): a subset of the categorical palette —
  the hues that don't share a color family with any status meaning (blue,
  aqua-adjacent violet, magenta, plus one or two more once validated) — is
  used for `StatCard` icon chips and `CategoryTag` backgrounds, keyed to data
  domain (Academics, Attendance, Fees, Exams, Hostel, Mess, Transport,
  Staff/HR, Communication). The same domain always renders the same hue
  everywhere it appears (a stat chip, a chart series, a category tag), so
  color becomes a consistent way to recognize a domain at a glance.
- The exact domain → hue table (there are more domains than safe hues) is
  finalized during implementation using the dataviz skill's palette
  validator, the same tool the prior redesign used — not hand-picked here.
- `StatCard`'s existing `color` prop (already supports a resolvable hex/theme
  path) needs no interface change — only the *values* passed to it change
  from `"text.primary"` to real domain hues.
- **Amendment (2026-07-13, Linear-inspired):** domain color is a
  *content-identity* device, not a *chrome* device. It's for things that
  represent a domain (`StatCard` icon chips, `CategoryTag` badges) — not for
  navigation chrome. The current nav rail/sidebar (pre-Phase-1) colors every
  icon by a domain hash (`iconColorFor` in `Layout.tsx`); that's reversed as
  part of this phase. Rail and secondary-sidebar icons go monochrome —
  `sidebarTokens.muted` at rest, `sidebarTokens.activeText` when active — same
  treatment Linear gives Triage/Issues/Cycles/Projects. Color stays reserved
  for two things everywhere in the app: (1) semantic state, via the status
  palette (unchanged), and (2) content identity on data-bearing surfaces
  (stat chips, category tags, chart series) — never on structural UI (nav,
  toolbars, buttons, tabs).

## 2. New Components (`src/components/`)

| Component | Status | Purpose |
|---|---|---|
| `CategoryTag` | New | 2–3 letter colored square badge with tooltip (full name). Used for fee heads, sections, hostel blocks, mess categories, subjects. Props: `label`, `fullName`, `domain` (resolves to a palette hue). |
| `PipelineStepper` | New | Horizontal variant only for now. Steps: `{ label, status: "done" \| "active" \| "pending", timestamp?, detail? }`, colored via the status palette. Used for Fee Defaulters escalation (Reminder → Notice → Penalty → Escalate). A vertical variant is added in Phase 2 when the Result Publication pipeline needs it — not built speculatively here. |
| `SeverityAvatar` | New | Icon inside a colored circle, severity-keyed to the status palette. Used in Fee Defaulters, Leave Requests, Notices. |
| `ChartCard` donut+legend pattern | Extends existing `ChartCard` | Adds an optional legend/breakdown footer (category name, %, amount) below the chart body, replacing bare donuts with no context. |
| `SecondarySidebar` | New | Contextual per-module panel rendered next to the icon rail. Grouped sections + live status indicators for data-heavy modules; a flat page list for simpler ones. |
| `MetaChip` | New (2026-07-13) | Small inline icon+label pill (~24px tall, muted, transparent/low-emphasis background) for entity metadata — status, assignee, date, count — that flows after a row's title instead of consuming a fixed table column. Props: `icon`, `label`, `tone?: "default" \| "muted"`. Linear's pattern for tags/estimates/dates on issue rows; used wherever list/detail rows need to show several small attributes inline without adding table columns. |

`StatCard` and `ChartCard` keep their existing props/interfaces — only their
call sites (dashboards, flagship pages) change what they pass in.

## 3. Navigation (`src/components/Layout.tsx`, `navigation.tsx`)

- Primary rail: 72px, dark (`#0A0A0A`, both modes — unchanged from today's
  sidebar background), icon-only, always present across the whole app for
  every role. Replaces the current single collapsible sidebar entirely.
- Secondary sidebar: slides in next to the rail, contents scoped to the
  active top-level module. For Fees / Attendance / Exams / Hostel / Mess it
  gets grouped sub-sections (mirroring the reference Attendance page's
  LIVE / MARKING / INSIGHTS grouping) and a live-status indicator where one
  exists (e.g., "2 classes scheduled · 0 marked"). Other modules get a plain
  page list — no invented status content where none exists yet.
- `localStorage` persistence of rail collapse state is dropped — the rail no
  longer collapses further than icon-only, since the secondary panel now
  carries the expanded content. Persist the *last active module* per role
  instead, so returning to a portal reopens the same secondary panel.
- Mobile: unchanged full-overlay drawer pattern, restyled to match; the
  two-tier split doesn't apply below the sidebar's mobile breakpoint.

## 4. Dashboards (all 5 roles)

All 5 dashboards (admin, teacher/HOD, staff, parent, student) are rebuilt on
the restyled `StatCard`/`ChartCard` plus the new components where they add
real value — not decoratively. Concretely:

- Stat-card rows use domain-keyed colored icon chips (§1) instead of uniform
  `text.primary`.
- Donut/breakdown charts adopt the legend+amount footer pattern.
- Any list of alert-like items (admin's fee-defaulter watchlist rail, staff
  task lists) uses `SeverityAvatar` + `StatusChip` instead of a plain text
  list.
- Content scope per dashboard is otherwise unchanged from the prior redesign
  spec (§6 of the 2026-07-11 spec) — this phase is a visual upgrade of that
  existing content plan, not a new content plan.

## 5. Flagship page reskins

- **Fee Defaulters** (`admin/FeeDefaulters.tsx`): adopt `PipelineStepper`
  (horizontal) for the escalation state per defaulter or per cohort, and
  `SeverityAvatar` for the per-student list, using the page's existing
  overdue-days/penalty data — no new fields.
- **Student Directory** (`admin/StudentDirectory.tsx`) and **Student
  Transfer** (`admin/StudentTransfer.tsx`): adopt `CategoryTag` for section
  badges and a compact "A → B" transfer indicator for students mid-transfer,
  using existing enrollment/transfer data.
- **Marks Overview / Report Cards**: visual polish only (restyled
  `DataTable`/`StatusChip`/`ChartCard` usage) — no pipeline or AI-grading
  treatment yet.

## 6. Density, Icon Style & Layout Rhythm (amendment, 2026-07-13)

Added after reviewing Linear as a second reference alongside whitebird.ai.
Where whitebird supplied color/component patterns, Linear supplies the
information-density and chrome-icon-style DNA the original spec didn't
address. This section governs both new surfaces (nav, dashboards) and,
via shared components, every inherited page.

- **Icon style is monochrome-dominant.** Structural/chrome icons (nav rail,
  secondary sidebar, toolbars, tabs, buttons) render in a single muted tone
  (`sidebarTokens.muted` at rest / `text` when active) — never a domain hue.
  Color on an icon means something: status (via `statusTokens`) or content
  identity (via `CategoryTag`/`StatCard` domain hues). This supersedes the
  current pre-Phase-1 nav, which colors every rail icon by domain hash — see
  the §1 amendment above.
- **Row heights (density scale):**
  - Nav rail item: 44px (unchanged — icon-only, needs the tap target).
  - Secondary sidebar row: 34px (down from today's 40-44px list rows).
  - `DataTable` row: dense/`small` MUI size becomes the *default* (flip
    `DataTable`'s `dense` prop default from `false` to `true`), not an
    opt-in — matches Linear's ~34-38px rows vs. MUI "medium"'s ~53px.
    Pages that genuinely need more breathing room (e.g. a table with
    multi-line cell content) can still pass `dense={false}` explicitly.
- **Icon size scale:** nav/chrome icons 20px (MUI `fontSize="small"` is
  20px, already the right default — audit call sites for stray `fontSize=
  "medium"` 24px icons in chrome and correct them); inline meta icons
  (`MetaChip`, table cell icons) 16px (`fontSize={16}`); avatars in dense
  contexts 24px (vs. the existing 32-36px `SeverityAvatar` default, which
  stays for emphasis contexts like watchlists).
- **Metadata as inline chips, not columns.** New `MetaChip` component (§2)
  — icon + label, ~24px tall, muted/low-emphasis — for attributes like
  date, count, or type that would otherwise need a dedicated table column.
  Prefer it in flagship reskins and new dashboard widgets; existing table
  columns elsewhere are not being converted (non-goal — see above).
- **Type scale stays mostly as-is.** The existing `PageHeader` (`h4` title,
  14px breadcrumbs, small-caps eyebrow) already matches Linear's "one big
  title, everything else small" hierarchy — no change needed there. Table
  header cells (`MuiTableCell` `head`, 0.7rem uppercase) also already match.
- **Borders/dividers stay minimal.** No new rules or borders between rows —
  density comes from spacing/height, not gridlines. This is already the
  house style (`DataTable` uses hover-only row emphasis); no change needed,
  just don't regress it while touching row heights.

## 7. Rollout order

1. Color tokens: extend `chartPalette.ts` usage into content-identity
   surfaces only (stat-card icon chips, category tags) per the §1 amendment
   — domain → hue mapping validated via the dataviz skill.
2. Density foundation: flip `DataTable`'s dense default, add `MetaChip`.
   Low-risk, highest leverage — reaches ~75 pages immediately.
3. New components: `CategoryTag`, `SeverityAvatar`, `PipelineStepper`,
   donut+legend `ChartCard` extension.
4. Two-tier navigation: `SecondarySidebar`, rework `Layout.tsx`/
   `navigation.tsx` for the icon rail — monochrome chrome icons, §6 row
   heights.
5. Restyle `StatCard`/`ChartCard` call sites with domain color.
6. Rebuild all 5 dashboards.
7. Reskin flagship pages (Fee Defaulters, Student Directory/Transfer, Marks
   Overview/Report Cards).

## Testing / Verification

Same approach as the prior redesign — this stays a frontend-only,
static-data app with no test suite:

- `npm run build` (`tsc -b`) passes with no type errors after each phase step.
- `npm run lint` passes.
- Manual browser walkthrough (via the `run` skill) of all 5 dashboards and
  the 3 reskinned flagship pages, in light and dark mode, at desktop and
  mobile widths — confirming rail/secondary-sidebar behavior, new component
  rendering, chart legends, and no regressions elsewhere.
