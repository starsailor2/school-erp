# App-Wide Component Sweep & Verification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish rolling the premium design system out to every remaining page: adopt `StatusChip` wherever a page hand-rolls a status-colored `Chip`, paginate the large tables that are now genuinely large after the demo-data scale-up, remove leftover hardcoded hex colors, retire the old `KpiCard`, and do a full-app verification pass across all 5 portals in both themes.

**Architecture:** This plan makes **no new components** — it applies the component library built in "Design System Foundation" and the scaled dataset from "Demo Data Restructuring" to the ~105 pages not individually rewritten by "Dashboards & New Modules". Because `PageHeader` and `DataTable` were upgraded **in place** (not renamed) in the Foundation plan, every one of those ~105 pages already inherits the new palette, typography, card style, and table style with **zero page edits** — this plan's job is narrower: replace ad hoc status `Chip`s with `StatusChip`, add pagination where row counts are now large, and clean up stragglers.

**Tech Stack:** React 19, TypeScript (strict), MUI v7.

## Global Constraints

- Depends on all three prior plans being complete.
- **Decision rule for Task 2-5 (StatusChip adoption):** only replace a `Chip` whose `color` prop is computed from a status-like value via a ternary or lookup (fee status, attendance status, task status, student-request status, library status, hostel/mess status) mapping to `"success" | "warning" | "error" | "default"`. Leave alone any `Chip` used decoratively (e.g. displaying an admission number, a role label, a static outlined tag, or a count) — those are not status indicators and must not be touched.
- Every file this plan touches must still compile under `strict`/`noUnusedLocals`/`noUnusedParameters` — removing a `Chip` usage that was the file's only reason to import `Chip` from `@mui/material` requires removing that import too.
- No test framework. Verification per task: `npm run build` + `npm run lint` after each batch, plus a final full manual walkthrough.
- Because file-level details (exact line numbers, exact remaining `Chip`/hex-color counts) will have shifted after the three prior plans execute, **every task's first step is a fresh grep** against the then-current codebase rather than a list frozen at planning time.

---

## Task 1: Paginate large, unfiltered data tables

**Files:** determined by Step 1's grep (see below); expected candidates based on the current codebase include `src/pages/admin/StudentDirectory.tsx`, `src/pages/admin/TeacherDirectory.tsx`, `src/pages/admin/FeeCollection.tsx`, `src/pages/admin/FeeDefaulters.tsx`, `src/pages/admin/FeeReports.tsx`, `src/pages/admin/MarksOverview.tsx`, `src/pages/admin/ReportCards.tsx`, `src/pages/admin/AttendanceReports.tsx`, `src/pages/admin/HomeworkReports.tsx`, `src/pages/admin/PerformanceReports.tsx`, `src/pages/admin/Reports.tsx`, `src/pages/staff/StudentLookup.tsx`, `src/pages/staff/PaymentRecords.tsx`, `src/pages/staff/StudentFeeHistory.tsx`, `src/pages/staff/LibraryRecords.tsx`, `src/pages/staff/TransportReports.tsx`, `src/pages/staff/OperationalReports.tsx`.

**Interfaces:**
- Consumes: `DataTable`'s `pagination`/`pageSize` props (already built into `DataTable` v2 by the Foundation plan — no component change needed here).

- [ ] **Step 1: Find every `DataTable` usage that renders an unfiltered, unpaginated large collection**

Run:

```bash
grep -rl "DataTable" src/pages --include=*.tsx | xargs grep -L "pagination"
```

This lists every page using `DataTable` **without** the `pagination` prop already set. For each file in the result, open it and check what array is passed to `rows`: if it's `students` (450 rows), `fees` (thousands of rows across 12 months), `attendanceRecords` (~90,000 rows), `marks` (~12,150 rows), or any `.filter()`/`.map()` derived from those without a class/section/date narrowing that keeps the result under ~50 rows, it needs pagination. Pages that already narrow to a single class/section/student (e.g. a student profile's own fee history) do not need it — their row count stays small regardless of the dataset scale-up.

- [ ] **Step 2: Add pagination to each qualifying file**

For each qualifying file, add `pagination pageSize={25}` to its `<DataTable ... />` call. Example transformation (illustrative — apply the same one-line addition to every qualifying file found in Step 1):

```tsx
// Before
<DataTable columns={columns} rows={students} onRowClick={(s) => navigate(`/admin/students/${s.id}`)} />

// After
<DataTable columns={columns} rows={students} onRowClick={(s) => navigate(`/admin/students/${s.id}`)} pagination pageSize={25} />
```

- [ ] **Step 3: Verify the build**

Run: `npm run build`
Expected: succeeds with zero errors.

- [ ] **Step 4: Manual visual check**

Run: `npm run dev`, open `/admin/students`. Expected: the table shows 25 rows with pagination controls at the bottom instead of all 450 rows at once; page-size selector offers 10/25/50.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: paginate large data tables after demo-data scale-up"
```

---

## Task 2: StatusChip adoption — Admin pages

**Files:** determined by Step 1's grep (expected: roughly 26 files under `src/pages/admin/`).

**Interfaces:**
- Consumes: `StatusChip` (`@/components/StatusChip`, built in the Foundation plan).

- [ ] **Step 1: Find status-colored Chips in admin pages**

Run:

```bash
grep -rln 'Chip[^/]*color=' src/pages/admin --include=*.tsx
```

- [ ] **Step 2: Apply the transformation pattern to each matched file**

For each file, find every `Chip` whose `color` prop is a ternary/lookup mapping a status string to `"success" | "warning" | "error" | "default"` (per this plan's Global Constraints decision rule) and replace it with `StatusChip`. Worked example — this exact shape appears repeatedly across the codebase (e.g. rendering a fee/attendance/task status column):

```tsx
// Before
<Chip
  label={row.status}
  size="small"
  color={row.status === "paid" ? "success" : row.status === "pending" ? "warning" : "error"}
/>

// After
<StatusChip status={row.status} />
```

Add `import StatusChip from "@/components/StatusChip";` to the file's imports. If the file's only use of MUI's `Chip` was this status rendering, remove `Chip` from the `@mui/material` import line (leave it if the file uses `Chip` elsewhere decoratively, per the Global Constraints rule).

- [ ] **Step 3: Verify the build**

Run: `npm run build`
Expected: succeeds with zero errors (a leftover unused `Chip` import would fail under `noUnusedLocals` — this is the build's way of confirming the import cleanup in Step 2 was done correctly).

- [ ] **Step 4: Manual visual check**

Run: `npm run dev`, spot-check 3-4 of the changed pages (e.g. `/admin/fees/collection`, `/admin/attendance/students`, `/admin/students/requests` if present). Expected: status pills render with icon + label + the correct status color, matching the pattern already visible on the rebuilt dashboards.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: adopt StatusChip across admin pages"
```

---

## Task 3: StatusChip adoption — Teacher pages

**Files:** determined by Step 1's grep (expected: roughly 17 files under `src/pages/teacher/`).

- [ ] **Step 1: Find status-colored Chips in teacher pages**

Run: `grep -rln 'Chip[^/]*color=' src/pages/teacher --include=*.tsx`

- [ ] **Step 2: Apply the same transformation pattern as Task 2, Step 2, to every matched file.**

Pay particular attention to `AttendanceHistory.tsx`, `HomeworkList.tsx`, and `ExamReview.tsx`, which are likely to have attendance-status and grade-band Chips.

- [ ] **Step 3: Verify the build**

Run: `npm run build` — expected to succeed with zero errors.

- [ ] **Step 4: Manual visual check**

Run: `npm run dev`, spot-check `/teacher/attendance/history` and `/teacher/homework/list`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: adopt StatusChip across teacher pages"
```

---

## Task 4: StatusChip adoption — Staff pages

**Files:** determined by Step 1's grep (expected: roughly 6 files under `src/pages/staff/`).

- [ ] **Step 1: Find status-colored Chips in staff pages**

Run: `grep -rln 'Chip[^/]*color=' src/pages/staff --include=*.tsx`

- [ ] **Step 2: Apply the same transformation pattern as Task 2, Step 2, to every matched file.**

- [ ] **Step 3: Verify the build**

Run: `npm run build` — expected to succeed with zero errors.

- [ ] **Step 4: Manual visual check**

Run: `npm run dev`, log in as staff, spot-check `/staff/students/requests` and a fee/library page relevant to the current staff role.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: adopt StatusChip across staff pages"
```

---

## Task 5: StatusChip adoption — Parent and Student pages

**Files:** determined by Step 1's grep (expected: roughly 8 files under `src/pages/parent/` and 6 under `src/pages/student/`).

- [ ] **Step 1: Find status-colored Chips in parent and student pages**

Run: `grep -rln 'Chip[^/]*color=' src/pages/parent src/pages/student --include=*.tsx`

- [ ] **Step 2: Apply the same transformation pattern as Task 2, Step 2, to every matched file.**

`parent/Fees.tsx`, `parent/Attendance.tsx`, `student/Exams.tsx`, and `student/Homework.tsx` are the most likely to have status Chips (fee status, attendance status, grade bands, homework due-status).

- [ ] **Step 3: Verify the build**

Run: `npm run build` — expected to succeed with zero errors.

- [ ] **Step 4: Manual visual check**

Run: `npm run dev`, log in as parent and student, spot-check the fee and homework pages.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: adopt StatusChip across parent and student pages"
```

---

## Task 6: Remove leftover hardcoded hex colors

**Files:** determined by Step 1's grep (expected: roughly 18 files, minus however many were already rewritten by the "Dashboards & New Modules" plan).

**Interfaces:**
- Consumes: MUI theme palette roles (`text.primary`, `success.main`, `warning.main`, `error.main`) which the Foundation plan already wired to the monochrome/status tokens — no new tokens needed here, just removing raw hex strings in favor of these theme-relative references.

- [ ] **Step 1: Find remaining hardcoded hex colors in pages**

Run:

```bash
grep -rlE '"#[0-9a-fA-F]{6}"|"#[0-9a-fA-F]{3}"' src/pages --include=*.tsx
```

- [ ] **Step 2: Replace each hardcoded hex color**

For each match, determine its original semantic intent from context (most of these are legacy `KpiCard`/chart `COLORS` arrays like `"#6366f1"` for indigo, `"#10b981"`/`"#22c55e"` for green/success, `"#f59e0b"` for amber/warning, `"#ef4444"` for red/error, `"#8b5cf6"` for violet) and replace with the theme-relative equivalent:
- Indigo/violet/blue accent on a `StatCard`/icon → drop the `color` prop entirely (defaults to monochrome `text.primary`) unless the surrounding chart already migrated to `getChartPalette(mode).categorical[n]` (for any file with a local `COLORS = ["#6366f1", "#f59e0b", ...]` array feeding a Recharts chart, replace the whole array with `getChartPalette(mode).categorical` — importing `getChartPalette` from `@/theme/chartPalette` and `useColorMode` from `@/context/ColorModeContext` exactly as done in the "Dashboards & New Modules" plan's Task 2).
- Green → `"success.main"` (as a theme path string, consumed the same way the old `KpiCard`'s `resolveColor` helper — now `StatCard`'s — already resolves dot-paths).
- Amber → `"warning.main"`.
- Red → `"error.main"`.

- [ ] **Step 3: Verify the build**

Run: `npm run build` — expected to succeed with zero errors.

- [ ] **Step 4: Manual visual check**

Run: `npm run dev`, spot-check 3-4 changed pages in both light and dark mode — confirm chart colors and icon accents adapt correctly (no chart still frozen on a light-mode-only hex that looks wrong on the dark background).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: replace hardcoded hex colors with theme-relative tokens"
```

---

## Task 7: Retire `KpiCard`

**Files:**
- Modify: `src/pages/teacher/ClassManagement.tsx`
- Delete: `src/components/KpiCard.tsx`

**Interfaces:**
- Consumes: `StatCard` (`@/components/StatCard`).

- [ ] **Step 1: Confirm `ClassManagement.tsx` is the only remaining `KpiCard` consumer**

Run: `grep -rl "KpiCard" src --include=*.tsx`
Expected: only `src/components/KpiCard.tsx` (its own definition) and `src/pages/teacher/ClassManagement.tsx` — the "Dashboards & New Modules" plan already migrated all 5 dashboard files off `KpiCard`. If any other file appears, migrate it the same way as Step 2 before proceeding.

- [ ] **Step 2: Migrate `ClassManagement.tsx` to `StatCard`**

Read the file, then replace each `<KpiCard title=... value=... icon=... color=... onClick=... />` with `<StatCard title=... value=... icon=... onClick=... numericValue={<the same numeric value>} />` (drop the hardcoded `color` prop, matching the pattern used across every dashboard in the prior plan), and change the import from `import { KpiCard } from "@/components/KpiCard";` to `import { StatCard } from "@/components/StatCard";`.

- [ ] **Step 3: Delete `KpiCard.tsx`**

```bash
git rm src/components/KpiCard.tsx
```

- [ ] **Step 4: Verify the build**

Run: `npm run build`
Expected: succeeds with zero errors — confirms no file still references the deleted `KpiCard`.

- [ ] **Step 5: Manual visual check**

Run: `npm run dev`, open `/teacher/class-mgmt`. Expected: stat cards render identically to the dashboard's `StatCard` styling, with count-up animation.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: migrate ClassManagement to StatCard and retire KpiCard"
```

---

## Task 8: Final full-app verification pass

**Files:** none (verification only)

- [ ] **Step 1: Full build**

Run: `npm run build`
Expected: `tsc -b` and `vite build` both succeed with zero errors.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: zero errors.

- [ ] **Step 3: Confirm no stray old patterns remain**

Run:

```bash
grep -rl "KpiCard" src --include=*.tsx --include=*.ts
grep -rlE '"#[0-9a-fA-F]{6}"|"#[0-9a-fA-F]{3}"' src/pages --include=*.tsx
grep -rl "@/data/mock" src --include=*.tsx --include=*.ts
```

Expected: all three commands return no results (empty output / "no matches").

- [ ] **Step 4: Comprehensive manual walkthrough**

Run: `npm run dev`. For **each of the 5 portals** (admin, teacher, staff — cycling through all 6 staff roles, parent, student):
- Open the dashboard and confirm it renders with real data, animations, and no console errors.
- Open at least 3 list/detail pages per portal and confirm: off-white/near-black theme throughout, hairline-bordered cards, `StatusChip` pills where status is shown, paginated tables where row counts are large, no default-MUI blue/indigo/amber anywhere.
- Open every Hostel and Mess page (admin's 8, staff's 4, parent's 2, student's 2) and confirm data renders and permissions are enforced correctly.
- Toggle dark mode from the topbar and re-check at least one page per portal — confirm full-app dark-mode consistency (sidebar, cards, charts, tables, status chips).
- Collapse and expand the sidebar via the rail toggle; confirm the collapsed state persists across a page reload.
- Resize the browser to a mobile width (< 900px) and confirm the temporary drawer opens/closes correctly and pages remain usable.

- [ ] **Step 5: Fix and re-verify anything found broken**

If Step 4 surfaces any visual or functional regression, fix it, re-run Steps 1-2, and re-check the specific broken flow before considering this plan complete.

- [ ] **Step 6: Commit (if any fixes were needed)**

If Step 5 required fixes, stage and commit them with a message describing what was fixed. If nothing was broken, this task requires no commit — the redesign is complete.
