# Dashboards & New Modules Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild all 5 role dashboards with premium, chart-heavy analytics using the new component library, and build the brand-new Hostel and Mess modules (pages + routes) for admin, staff, parent, and student.

**Architecture:** Every dashboard composes `StatCard` (hero metrics), `ChartCard` + Recharts (trends/breakdowns), and the shared `getChartPalette(mode)` (color-by-job: categorical for series identity, status tokens for paid/pending/overdue-style state — never mixed in one chart). Hostel/Mess admin and staff pages reuse `DataTable` v2 + `StatusChip` exactly like existing admin CRUD-style pages (e.g. `TransportRoutes.tsx`) — no new list-page pattern is invented. Parent/Student "My Hostel"/"My Mess" pages are read-only summary views built from `Paper` + `Stack`, matching the existing `student/Profile.tsx`-style detail page pattern.

**Tech Stack:** React 19, TypeScript (strict), MUI v7, Recharts 2.15, `motion/react`, React Router 7.

## Global Constraints

- Depends on both prior plans being complete: "Design System Foundation" (StatCard, ChartCard, DataTable v2, StatusChip, PageHeader v2, collapsible Layout, hostel/mess nav entries, hostel_warden/mess_manager roles) and "Demo Data Restructuring" (all data now under `@/demo-data`, including hostel/mess).
- Color-by-job (dataviz skill, non-negotiable): a chart series encoding **identity** (which class, which block) uses the fixed categorical palette in order (`getChartPalette(mode).categorical[0]`, `[1]`, ...), never cycled arbitrarily. A chart encoding **state** (paid/pending/overdue, present/absent) uses `getChartPalette(mode).status.{good,warning,serious,critical}`, always with a legend or direct labels — never color alone.
- One axis per chart — never a dual-axis chart. Two measures of different scale become two charts or an indexed/grouped view.
- Every chart ships inside a `ChartCard` and includes a visible `<Legend />` for 2+ series (Recharts default) — per the dataviz skill's WARN-relief requirement noted in the Foundation plan.
- `@/*` resolves to `src/*`. TypeScript strict, `noUnusedLocals`, `noUnusedParameters`.
- No test framework. Verification per task: `npm run build`, `npm run lint`, manual check via `npm run dev`.
- New routes follow `src/router.tsx`'s existing lazy-load pattern (`const X = () => L(() => import("@/pages/..."))`) and existing `StaffFeatureGuard` usage (`SG("hostel", <Element />)` / `SG("mess", <Element />)`) for staff routes.

---

## Task 1: Chart tooltip helper (small addition to the chart palette)

**Files:**
- Modify: `src/theme/chartPalette.ts`

**Interfaces:**
- Produces: `getChartTooltipStyle(mode: "light" | "dark"): { contentStyle: object; labelStyle: object }` — passed to every Recharts `<Tooltip>` in this plan so tooltips match the card surface instead of Recharts' default white box.

- [ ] **Step 1: Append the helper to the existing file**

Add to the end of `src/theme/chartPalette.ts` (after `getChartPalette`):

```ts
export function getChartTooltipStyle(mode: "light" | "dark") {
  const surface = mode === "light" ? "#FFFFFF" : "#1A1A1A";
  const border = mode === "light" ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)";
  const text = mode === "light" ? "#111111" : "#F5F5F4";
  return {
    contentStyle: {
      backgroundColor: surface,
      border: `1px solid ${border}`,
      borderRadius: 8,
      fontSize: 13,
      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    },
    labelStyle: { color: text, fontWeight: 600 },
  };
}
```

- [ ] **Step 2: Verify and commit**

Run: `npm run build` — expected to succeed.

```bash
git add src/theme/chartPalette.ts
git commit -m "feat: add chart tooltip styling helper"
```

---

## Task 2: Admin Dashboard rebuild

**Files:**
- Modify: `src/pages/admin/Dashboard.tsx` (full rewrite)

**Interfaces:**
- Consumes: `StatCard` (`@/components/StatCard`), `ChartCard` (`@/components/ChartCard`), `StatusChip` (`@/components/StatusChip`), `PageHeader` (`@/components/PageHeader`), `getChartPalette`/`getChartTooltipStyle` (`@/theme/chartPalette`, Task 1), `useColorMode` (`@/context/ColorModeContext`), and from `@/demo-data`: `students`, `teachers`, `staffMembers`, `classes`, `fees`, `attendanceRecords`, `exams`, `marks`, `announcements`, `hostelAllocations`, `hostelRooms`, `hostelBlocks`, `messPlans`, `messAttendance`, `getClassName`.

- [ ] **Step 1: Rewrite the file**

```tsx
// src/pages/admin/Dashboard.tsx
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Grid, Paper, Typography, Box, Stack, Chip } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import EventNoteIcon from "@mui/icons-material/EventNote";
import PaymentIcon from "@mui/icons-material/Payment";
import HotelIcon from "@mui/icons-material/Hotel";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import { StatCard } from "@/components/StatCard";
import { ChartCard } from "@/components/ChartCard";
import StatusChip from "@/components/StatusChip";
import { PageHeader } from "@/components/PageHeader";
import { getChartPalette, getChartTooltipStyle } from "@/theme/chartPalette";
import { useColorMode } from "@/context/ColorModeContext";
import {
  students, teachers, staffMembers, classes, fees, attendanceRecords,
  announcements, exams, marks, hostelAllocations, hostelRooms, hostelBlocks,
  messPlans, messAttendance, getClassName,
} from "@/demo-data";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { mode } = useColorMode();
  const palette = getChartPalette(mode);
  const tooltipStyle = getChartTooltipStyle(mode);

  const stats = useMemo(() => {
    const totalStudents = students.length;
    const totalStaff = teachers.length + staffMembers.length;

    const todayStr = new Date().toISOString().split("T")[0];
    const todayAtt = attendanceRecords.filter((a) => a.date === todayStr);
    const presentToday = todayAtt.filter((a) => a.status === "present").length;
    const attendancePct = todayAtt.length > 0 ? Math.round((presentToday / todayAtt.length) * 100) : 0;

    const currentMonthFees = fees.filter((f) => {
      const d = new Date(f.due_date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const collected = currentMonthFees.filter((f) => f.status === "paid").length;
    const collectionRate = currentMonthFees.length > 0 ? Math.round((collected / currentMonthFees.length) * 100) : 0;

    const occupiedBeds = hostelAllocations.length;
    const totalBeds = hostelRooms.reduce((s, r) => s + r.capacity, 0);
    const hostelOccupancy = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    return { totalStudents, totalStaff, attendancePct, collectionRate, hostelOccupancy, messPlansActive: messPlans.length };
  }, []);

  const classDistribution = classes.slice(0, 12).map((c) => ({
    name: c.name.replace("Class ", "C"),
    students: c.sections.reduce((sum, s) => sum + s.student_count, 0),
  }));

  const feeStatusData = [
    { name: "Paid", value: fees.filter((f) => f.status === "paid").length, color: palette.status.good },
    { name: "Pending", value: fees.filter((f) => f.status === "pending").length, color: palette.status.warning },
    { name: "Overdue", value: fees.filter((f) => f.status === "overdue").length, color: palette.status.critical },
  ];

  const feeCollectionTrend = useMemo(() => {
    const byMonth = new Map<string, { collected: number; due: number }>();
    for (const f of fees) {
      if (f.fee_type !== "tuition") continue;
      const d = new Date(f.due_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const entry = byMonth.get(key) ?? { collected: 0, due: 0 };
      entry.due += f.amount;
      if (f.status === "paid") entry.collected += f.amount;
      byMonth.set(key, entry);
    }
    return [...byMonth.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([key, v]) => ({
        month: new Date(`${key}-01`).toLocaleDateString("en", { month: "short" }),
        collected: Math.round(v.collected / 1000),
        due: Math.round(v.due / 1000),
      }));
  }, []);

  const attendanceTrend = useMemo(() => {
    const byDate = new Map<string, { present: number; total: number }>();
    for (const a of attendanceRecords) {
      const entry = byDate.get(a.date) ?? { present: 0, total: 0 };
      entry.total += 1;
      if (a.status === "present") entry.present += 1;
      byDate.set(a.date, entry);
    }
    return [...byDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30)
      .map(([date, v]) => ({
        day: new Date(date).toLocaleDateString("en", { day: "2-digit", month: "short" }),
        attendance: Math.round((v.present / v.total) * 100),
      }));
  }, []);

  const examPerformanceTrend = useMemo(() =>
    exams.map((exam) => {
      const examMarks = marks.filter((m) => m.exam_id === exam.id);
      const avg = examMarks.length > 0 ? examMarks.reduce((s, m) => s + m.marks_obtained, 0) / examMarks.length : 0;
      return { name: exam.name, avgScore: Math.round(avg) };
    }), []);

  const hostelByBlock = useMemo(() =>
    hostelBlocks.map((block) => {
      const roomsInBlock = hostelRooms.filter((r) => r.block_id === block.id);
      const capacity = roomsInBlock.reduce((s, r) => s + r.capacity, 0);
      const occupied = hostelAllocations.filter((a) => roomsInBlock.some((r) => r.id === a.room_id)).length;
      return { name: block.name.replace(" Block", ""), occupied, capacity };
    }), []);

  const messConsumptionTrend = useMemo(() => {
    const byDate = new Map<string, number>();
    for (const rec of messAttendance) {
      if (!rec.consumed) continue;
      byDate.set(rec.date, (byDate.get(rec.date) ?? 0) + 1);
    }
    return [...byDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ day: new Date(date).toLocaleDateString("en", { day: "2-digit", month: "short" }), meals: count }));
  }, []);

  const recentAdmissions = students.slice(-5).reverse();
  const feeDefaulters = fees.filter((f) => f.status === "overdue").slice(0, 5);

  return (
    <>
      <PageHeader title="Admin Dashboard" eyebrow="Overview" />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 4, lg: 2 }}>
          <StatCard title="Total Students" value={stats.totalStudents} numericValue={stats.totalStudents} icon={<PeopleIcon />} onClick={() => navigate("/admin/students")} delay={0} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, lg: 2 }}>
          <StatCard title="Total Staff" value={stats.totalStaff} numericValue={stats.totalStaff} icon={<SchoolIcon />} onClick={() => navigate("/admin/staff")} delay={0.05} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, lg: 2 }}>
          <StatCard title="Attendance Today" value={`${stats.attendancePct}%`} numericValue={stats.attendancePct} formatValue={(n) => `${n}%`} icon={<EventNoteIcon />} onClick={() => navigate("/admin/attendance/students")} delay={0.1} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, lg: 2 }}>
          <StatCard title="Fee Collection Rate" value={`${stats.collectionRate}%`} numericValue={stats.collectionRate} formatValue={(n) => `${n}%`} icon={<PaymentIcon />} onClick={() => navigate("/admin/fees/collection")} delay={0.15} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, lg: 2 }}>
          <StatCard title="Hostel Occupancy" value={`${stats.hostelOccupancy}%`} numericValue={stats.hostelOccupancy} formatValue={(n) => `${n}%`} icon={<HotelIcon />} onClick={() => navigate("/admin/hostel")} delay={0.2} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, lg: 2 }}>
          <StatCard title="Mess Plans Active" value={stats.messPlansActive} numericValue={stats.messPlansActive} icon={<RestaurantIcon />} onClick={() => navigate("/admin/mess")} delay={0.25} />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <ChartCard eyebrow="Finance" title="Fee Collection — Last 12 Months" subtitle="Amount in ₹ thousands" delay={0.1}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={feeCollectionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
                <XAxis dataKey="month" stroke={palette.axis} fontSize={12} />
                <YAxis stroke={palette.axis} fontSize={12} />
                <Tooltip {...tooltipStyle} />
                <Legend />
                <Line type="monotone" dataKey="collected" name="Collected" stroke={palette.categorical[0]} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="due" name="Due" stroke={palette.categorical[1]} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ChartCard eyebrow="Finance" title="Fee Status Breakdown" delay={0.15}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={feeStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {feeStatusData.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard eyebrow="Attendance" title="School-wide Attendance — Last 30 Days" delay={0.2}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
                <XAxis dataKey="day" stroke={palette.axis} fontSize={11} interval={4} />
                <YAxis domain={[60, 100]} stroke={palette.axis} fontSize={12} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="attendance" name="Attendance %" stroke={palette.categorical[0]} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard eyebrow="Academics" title="Students per Class" delay={0.25}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
                <XAxis dataKey="name" stroke={palette.axis} fontSize={12} />
                <YAxis stroke={palette.axis} fontSize={12} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="students" name="Students" fill={palette.categorical[0]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <ChartCard eyebrow="Academics" title="Exam Performance Trend" subtitle="Average score across all subjects" delay={0.3}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={examPerformanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
                <XAxis dataKey="name" stroke={palette.axis} fontSize={11} />
                <YAxis domain={[0, 100]} stroke={palette.axis} fontSize={12} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="avgScore" name="Avg Score" stroke={palette.categorical[0]} strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ChartCard eyebrow="Hostel" title="Occupancy by Block" delay={0.35}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hostelByBlock}>
                <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
                <XAxis dataKey="name" stroke={palette.axis} fontSize={11} />
                <YAxis stroke={palette.axis} fontSize={12} />
                <Tooltip {...tooltipStyle} />
                <Legend />
                <Bar dataKey="occupied" name="Occupied" fill={palette.categorical[0]} radius={[4, 4, 0, 0]} />
                <Bar dataKey="capacity" name="Capacity" fill={palette.categorical[1]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ChartCard eyebrow="Mess" title="Meals Served — Last 30 Days" delay={0.4}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={messConsumptionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
                <XAxis dataKey="day" stroke={palette.axis} fontSize={10} interval={4} />
                <YAxis stroke={palette.axis} fontSize={12} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="meals" name="Meals" stroke={palette.categorical[0]} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Recent Admissions</Typography>
            <Stack spacing={0.75}>
              {recentAdmissions.map((s) => (
                <Box key={s.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>{s.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{getClassName(s.class_id)}</Typography>
                  </Box>
                  <Chip label={s.admission_number} size="small" variant="outlined" />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Fee Defaulter Watchlist</Typography>
            <Stack spacing={0.75}>
              {feeDefaulters.map((f) => {
                const student = students.find((s) => s.id === f.student_id);
                return (
                  <Box key={f.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body2" fontWeight={500}>{student?.name ?? f.student_id}</Typography>
                    <StatusChip status="overdue" />
                  </Box>
                );
              })}
              {feeDefaulters.length === 0 && <Typography variant="body2" color="text.secondary">No overdue fees.</Typography>}
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Recent Announcements</Typography>
            <Stack spacing={1}>
              {announcements.slice(0, 3).map((a) => (
                <Box key={a.id}>
                  <Typography variant="body2" fontWeight={500}>{a.title}</Typography>
                  <Typography variant="caption" color="text.secondary">{a.date}</Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
```

- [ ] **Step 2: Verify the build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 3: Manual visual check**

Run: `npm run dev`, open `/admin`. Expected: 6 hero stat cards animate in with count-up; 5 charts render with data spanning real dates (not "Invalid Date"); the fee status donut uses green/amber/red (status colors), all other charts use the categorical blue/aqua sequence; toggling dark mode updates chart colors, grid lines, and tooltip background correctly.

- [ ] **Step 4: Commit**

```bash
git add src/pages/admin/Dashboard.tsx
git commit -m "feat: rebuild admin dashboard with premium analytics"
```

---

## Task 3: Teacher & HOD Dashboard rebuild

**Files:**
- Modify: `src/pages/teacher/Dashboard.tsx` (full rewrite)

**Interfaces:**
- Consumes: `StatCard`, `ChartCard`, `PageHeader`, `getChartPalette`/`getChartTooltipStyle`, `useColorMode`, `useAuth` (now also destructuring `teacherType`), and from `@/demo-data`: `teachers`, `getTeacherClasses`, `students`, `homework`, `getSubjectName`, `getClassName`, `timetable`, `attendanceRecords`, `marks`.

This file already exists with substantial working logic (a full weekly timetable grid, upcoming/overdue homework, per-class attendance rollups, announcements) captured in full during this plan's research. The rewrite below **preserves every existing computation and the entire timetable grid JSX verbatim**, and only (a) swaps `KpiCard` for `StatCard`, (b) adds two new `ChartCard`s, (c) adds an HOD-only cross-class performance chart, (d) updates the data import path to `@/demo-data` (already done app-wide by the "Demo Data Restructuring" plan, so this file already imports from `@/demo-data` by the time this task runs — the block below reflects that).

- [ ] **Step 1: Replace the file**

```tsx
// src/pages/teacher/Dashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid, Paper, Typography, Stack, Box, Chip, Button, Divider,
  Table, TableHead, TableBody, TableRow, TableCell, LinearProgress,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import EventNoteIcon from "@mui/icons-material/EventNote";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import GradeIcon from "@mui/icons-material/Grade";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { StatCard } from "@/components/StatCard";
import { ChartCard } from "@/components/ChartCard";
import { PageHeader } from "@/components/PageHeader";
import { getChartPalette, getChartTooltipStyle } from "@/theme/chartPalette";
import { useColorMode } from "@/context/ColorModeContext";
import { useAuth } from "@/context/AuthContext";
import {
  teachers, getTeacherClasses, students, homework, getSubjectName,
  getClassName, timetable, attendanceRecords, marks,
} from "@/demo-data";
import { ANNOUNCEMENT_STORE_EVENT, getAnnouncements } from "@/demo-data/communication/announcementStore";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { user, teacherType } = useAuth();
  const { mode } = useColorMode();
  const palette = getChartPalette(mode);
  const tooltipStyle = getChartTooltipStyle(mode);
  const [announcementRows, setAnnouncementRows] = useState(() => getAnnouncements());

  useEffect(() => {
    const onUpdate = () => setAnnouncementRows(getAnnouncements());
    window.addEventListener(ANNOUNCEMENT_STORE_EVENT, onUpdate);
    return () => window.removeEventListener(ANNOUNCEMENT_STORE_EVENT, onUpdate);
  }, []);

  const teacher = teachers.find((t) => t.id === user?.id);
  const allocations = teacher ? getTeacherClasses(teacher.id) : [];
  const assignedClassIds = [...new Set(allocations.map((a) => a.class_id))];
  const myStudents = students.filter((s) => assignedClassIds.includes(s.class_id));
  const myHomework = homework.filter((h) => h.teacher_id === teacher?.id);
  const avgAtt = myStudents.length > 0
    ? Math.round(myStudents.reduce((s, st) => s + st.attendance_pct, 0) / myStudents.length)
    : 0;

  const LUNCH_PERIOD = 5;
  const myWeekEntries: Record<string, { period: number; time: string; subject: string; class_name: string; section: string; type: "class" | "lunch" | "free" }[]> = {};
  let maxPeriods = 0;
  for (const day of DAYS) {
    const allDayEntries = timetable[day] ?? [];
    const teacherEntries = allDayEntries.filter((e) => e.teacher === teacher?.name);
    const dayMax = allDayEntries.reduce((m, e) => Math.max(m, e.period), 0);
    if (dayMax > maxPeriods) maxPeriods = dayMax;
    const daySlots: typeof myWeekEntries[string] = [];
    for (let p = 1; p <= dayMax; p++) {
      if (p === LUNCH_PERIOD) {
        daySlots.push({ period: p, time: "12:00 - 12:30", subject: "Lunch Break", class_name: "", section: "", type: "lunch" });
      } else {
        const entry = teacherEntries.find((e) => e.period === p);
        if (entry) {
          daySlots.push({ period: p, time: entry.time, subject: entry.subject, class_name: entry.class_name, section: entry.section, type: "class" });
        } else {
          const anyEntry = allDayEntries.find((e) => e.period === p);
          daySlots.push({ period: p, time: anyEntry?.time ?? "", subject: "Free", class_name: "", section: "", type: "free" });
        }
      }
    }
    myWeekEntries[day] = daySlots;
  }

  const currentHour = new Date().getHours();
  const todayName = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1] ?? "";
  const todayClasses = myWeekEntries[todayName]?.filter((e) => e.type === "class").length ?? 0;

  const today = new Date().toISOString().split("T")[0];
  const upcomingHomework = myHomework
    .filter((h) => h.due_date >= today)
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
    .slice(0, 5);
  const overdueHomework = myHomework.filter((h) => h.due_date < today);

  const teacherAnnouncements = announcementRows
    .filter((a) => a.target === "all" || a.target === "teacher")
    .slice(0, 3);

  const periods = Array.from({ length: maxPeriods || 8 }, (_, i) => i + 1);

  const myStudentIds = new Set(myStudents.map((s) => s.id));
  const classAttendanceTrend = (() => {
    const byDate = new Map<string, { present: number; total: number }>();
    for (const a of attendanceRecords) {
      if (!myStudentIds.has(a.student_id)) continue;
      const entry = byDate.get(a.date) ?? { present: 0, total: 0 };
      entry.total += 1;
      if (a.status === "present") entry.present += 1;
      byDate.set(a.date, entry);
    }
    return [...byDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, v]) => ({
        day: new Date(date).toLocaleDateString("en", { day: "2-digit", month: "short" }),
        attendance: v.total > 0 ? Math.round((v.present / v.total) * 100) : 0,
      }));
  })();

  const homeworkCompletionData = (() => {
    const bySubject = new Map<string, number>();
    for (const h of myHomework) {
      const name = getSubjectName(h.subject_id);
      bySubject.set(name, (bySubject.get(name) ?? 0) + 1);
    }
    return [...bySubject.entries()].map(([subject, assigned]) => ({ subject, assigned }));
  })();

  const crossClassPerformance = (() => {
    return assignedClassIds.map((classId) => {
      const classStudentIds = new Set(students.filter((s) => s.class_id === classId).map((s) => s.id));
      const classMarks = marks.filter((m) => classStudentIds.has(m.student_id));
      const avg = classMarks.length > 0 ? classMarks.reduce((s, m) => s + m.marks_obtained, 0) / classMarks.length : 0;
      return { name: getClassName(classId), avgScore: Math.round(avg) };
    });
  })();

  return (
    <>
      <PageHeader title="My Dashboard" eyebrow="Teacher Portal" />
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
        <Box>
          <Typography variant="h6" fontWeight={600}>
            Good {currentHour < 12 ? "morning" : currentHour < 17 ? "afternoon" : "evening"}, {teacher?.name ?? "Teacher"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {teacher?.teacher_type.replace("_", " ")} · {teacher?.department} · {teacher?.subjects.map(getSubjectName).join(", ")}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button size="small" variant="contained" startIcon={<CheckCircleIcon />} onClick={() => navigate("/teacher/attendance")}>Take Attendance</Button>
          <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => navigate("/teacher/homework")}>Assign Homework</Button>
          <Button size="small" variant="outlined" startIcon={<GradeIcon />} onClick={() => navigate("/teacher/exams")}>Enter Marks</Button>
        </Stack>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard title="Today's Classes" value={todayClasses} numericValue={todayClasses} icon={<ScheduleIcon />} onClick={() => navigate("/teacher/timetable")} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard title="My Students" value={myStudents.length} numericValue={myStudents.length} icon={<PeopleIcon />} onClick={() => navigate("/teacher/students")} delay={0.05} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard title="Pending Homework" value={upcomingHomework.length} numericValue={upcomingHomework.length} icon={<AssignmentIcon />} onClick={() => navigate("/teacher/homework/list")} delay={0.1} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard title="Avg Attendance" value={`${avgAtt}%`} numericValue={avgAtt} formatValue={(n) => `${n}%`} icon={<EventNoteIcon />} onClick={() => navigate("/teacher/attendance/history")} delay={0.15} />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard eyebrow="Attendance" title="My Classes — Attendance Trend (14 days)">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={classAttendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
                <XAxis dataKey="day" stroke={palette.axis} fontSize={11} />
                <YAxis domain={[60, 100]} stroke={palette.axis} fontSize={12} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="attendance" name="Attendance %" stroke={palette.categorical[0]} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard eyebrow="Homework" title="Homework by Subject">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={homeworkCompletionData}>
                <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
                <XAxis dataKey="subject" stroke={palette.axis} fontSize={11} />
                <YAxis stroke={palette.axis} fontSize={12} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="assigned" name="Assigned" fill={palette.categorical[0]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>

      {teacherType === "hod" && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={12}>
            <ChartCard eyebrow="Department" title="Cross-Class Performance Comparison">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={crossClassPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
                  <XAxis dataKey="name" stroke={palette.axis} fontSize={11} />
                  <YAxis domain={[0, 100]} stroke={palette.axis} fontSize={12} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="avgScore" name="Avg Score" fill={palette.categorical[0]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
        </Grid>
      )}

      <Grid container spacing={2}>
        <Grid size={12}>
          <Paper sx={{ p: 2, overflowX: "auto" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CalendarTodayIcon color="primary" />
                <Typography variant="subtitle1" fontWeight={600}>My Weekly Timetable</Typography>
              </Box>
              <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate("/teacher/timetable")}>Full Timetable</Button>
            </Box>
            <Table size="small" sx={{ minWidth: 700 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "action.hover", position: "sticky", left: 0, zIndex: 1 }}>Day</TableCell>
                  {periods.map((p) => {
                    const isLunch = p === LUNCH_PERIOD;
                    return (
                      <TableCell key={p} align="center" sx={{ fontWeight: 700, bgcolor: isLunch ? "action.selected" : "action.hover", minWidth: isLunch ? 70 : 90 }}>
                        {isLunch ? "Lunch" : `P${p}`}<br />
                        <Typography variant="caption" color="text.secondary">
                          {isLunch ? "12:00" : p < LUNCH_PERIOD ? `${7 + p}:00` : `${6 + p}:00`}
                        </Typography>
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {DAYS.map((day) => {
                  const isToday = day === todayName;
                  return (
                    <TableRow key={day} sx={{ bgcolor: isToday ? "action.selected" : "transparent" }}>
                      <TableCell sx={{
                        fontWeight: 600,
                        position: "sticky", left: 0, zIndex: 1,
                        bgcolor: isToday ? "action.selected" : "background.paper",
                        whiteSpace: "nowrap",
                      }}>
                        {day}
                        {isToday && <Chip label="Today" size="small" color="primary" sx={{ ml: 1 }} />}
                      </TableCell>
                      {periods.map((p) => {
                        const entry = myWeekEntries[day]?.find((e) => e.period === p);
                        if (!entry) {
                          return (
                            <TableCell key={p} align="center" sx={{ color: "text.disabled", fontSize: 12 }}>
                              —
                            </TableCell>
                          );
                        }
                        if (entry.type === "lunch") {
                          return (
                            <TableCell key={p} align="center" sx={{ bgcolor: "action.hover" }}>
                              <Typography variant="caption" fontWeight={600} color="warning.main">🍽 Lunch</Typography>
                            </TableCell>
                          );
                        }
                        if (entry.type === "free") {
                          return (
                            <TableCell key={p} align="center" sx={{ bgcolor: "action.hover" }}>
                              <Typography variant="caption" color="success.main" fontWeight={500}>Free</Typography>
                            </TableCell>
                          );
                        }
                        const periodHour = p < LUNCH_PERIOD ? 7 + p : 6 + p;
                        const isNow = isToday && periodHour === currentHour;
                        return (
                          <TableCell key={p} align="center" sx={{
                            ...(isNow && { outline: "2px solid", outlineColor: "primary.main", borderRadius: 1 }),
                          }}>
                            <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                              {entry.class_name}-{entry.section}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                              {entry.subject}
                            </Typography>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <Typography variant="subtitle1" fontWeight={600}>Upcoming Homework</Typography>
              <Button size="small" onClick={() => navigate("/teacher/homework/list")}>View All</Button>
            </Box>
            {overdueHomework.length > 0 && (
              <Chip label={`${overdueHomework.length} overdue`} size="small" color="error" sx={{ mb: 1 }} />
            )}
            <Stack spacing={1.5}>
              {upcomingHomework.map((h) => (
                <Box key={h.id}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>{h.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {getClassName(h.class_id)} · {getSubjectName(h.subject_id)}
                      </Typography>
                    </Box>
                    <Chip
                      label={h.due_date}
                      size="small"
                      color={h.due_date === today ? "warning" : "default"}
                      variant="outlined"
                    />
                  </Box>
                  <Divider sx={{ mt: 1 }} />
                </Box>
              ))}
              {upcomingHomework.length === 0 && (
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 2 }}>
                  No upcoming homework
                </Typography>
              )}
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <Typography variant="subtitle1" fontWeight={600}>My Classes</Typography>
              <Button size="small" onClick={() => navigate("/teacher/classes")}>View All</Button>
            </Box>
            <Stack spacing={1.5}>
              {allocations.slice(0, 5).map((a) => {
                const sectionStudents = students.filter((s) => s.section_id === a.section_id);
                const classAvgAtt = sectionStudents.length > 0
                  ? Math.round(sectionStudents.reduce((s, st) => s + st.attendance_pct, 0) / sectionStudents.length)
                  : 0;
                return (
                  <Box key={a.id}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>{getClassName(a.class_id)}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {getSubjectName(a.subject_id)} · {sectionStudents.length} students
                        </Typography>
                      </Box>
                      <Chip label={`${classAvgAtt}%`} size="small"
                        color={classAvgAtt >= 85 ? "success" : classAvgAtt >= 75 ? "warning" : "error"} />
                    </Box>
                    <LinearProgress variant="determinate" value={classAvgAtt} sx={{ mt: 0.5, height: 4, borderRadius: 2 }} />
                  </Box>
                );
              })}
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <Typography variant="subtitle1" fontWeight={600}>Announcements</Typography>
              <Button size="small" onClick={() => navigate("/teacher/announcements")}>View All</Button>
            </Box>
            <Stack spacing={1}>
              {teacherAnnouncements.map((a) => (
                <Box key={a.id} sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                  <Chip label={a.priority} size="small"
                    color={a.priority === "high" ? "error" : a.priority === "medium" ? "warning" : "default"}
                    sx={{ mt: 0.3, minWidth: 60 }} />
                  <Box>
                    <Typography variant="body2" fontWeight={500}>{a.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{a.date}</Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
```

- [ ] **Step 2: Verify the build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 3: Manual visual check**

Run: `npm run dev`, log in as teacher, switch teacher type (subject/class/HOD) via the teacher type switcher in the topbar. Expected: stat cards animate with real counts; both new charts render with real data; the "Cross-Class Performance Comparison" chart only appears when teacher type is HOD; the weekly timetable grid renders exactly as before.

- [ ] **Step 4: Commit**

```bash
git add src/pages/teacher/Dashboard.tsx
git commit -m "feat: rebuild teacher dashboard with attendance and homework analytics"
```

---

## Task 4: Staff Dashboard rebuild (role-conditional)

**Files:**
- Modify: `src/pages/staff/Dashboard.tsx` (full rewrite)

**Interfaces:**
- Consumes: `StatCard`, `ChartCard`, `PageHeader`, `getChartPalette`/`getChartTooltipStyle`, `useColorMode`, `useAuth` (for `staffRole`), `canViewFeature` (`@/data/staffPermissions`), and from `@/demo-data`: `staffMembers`, `students`, `routes`, `studentTransport`, `libraryBooks`, `announcements`, `hostelAllocations`, `hostelRooms`, `hostelBlocks`, `messAttendance`, plus the moved store functions `getStaffFees`/`getFeePayments` (`@/demo-data/fees/feeTransactionStore`), `getLibraryRecords` (`@/demo-data/library/libraryCirculationStore`), `getStudentRequests` (`@/demo-data/staffOps/studentRequestStore`), `getStaffTasks` (`@/demo-data/staffOps/staffTaskStore`).

This file already exists (captured in full during this plan's research) with a working KPI row, a role-conditional "Quick Workflow" button panel, and three list panels (Today's Tasks, Recent Student Requests, Recent Notices). The rewrite below preserves the Quick Workflow panel and the three list panels **verbatim**, swaps `KpiCard` for `StatCard`, adds two new stat cards for the `hostel_warden`/`mess_manager` roles, and adds a role-conditional chart section.

- [ ] **Step 1: Replace the file**

```tsx
// src/pages/staff/Dashboard.tsx
import { useNavigate } from "react-router-dom";
import { Grid, Paper, Typography, Stack, Box, Chip, Button } from "@mui/material";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import TaskIcon from "@mui/icons-material/Task";
import PeopleIcon from "@mui/icons-material/People";
import PaymentIcon from "@mui/icons-material/Payment";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import HotelIcon from "@mui/icons-material/Hotel";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import { StatCard } from "@/components/StatCard";
import { ChartCard } from "@/components/ChartCard";
import { PageHeader } from "@/components/PageHeader";
import { getChartPalette, getChartTooltipStyle } from "@/theme/chartPalette";
import { useColorMode } from "@/context/ColorModeContext";
import { useAuth } from "@/context/AuthContext";
import { canViewFeature } from "@/data/staffPermissions";
import {
  staffMembers, students, routes, studentTransport, libraryBooks, announcements,
  hostelAllocations, hostelRooms, hostelBlocks, messAttendance,
} from "@/demo-data";
import { getStaffFees, getFeePayments } from "@/demo-data/fees/feeTransactionStore";
import { getLibraryRecords } from "@/demo-data/library/libraryCirculationStore";
import { getStudentRequests } from "@/demo-data/staffOps/studentRequestStore";
import { getStaffTasks } from "@/demo-data/staffOps/staffTaskStore";

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { user, staffRole } = useAuth();
  const { mode } = useColorMode();
  const palette = getChartPalette(mode);
  const tooltipStyle = getChartTooltipStyle(mode);
  const staff = staffMembers.find((s) => s.id === user?.id);

  const pendingFeePayments = getStaffFees().filter((f) => f.status !== "paid").length;
  const feeCollectionsToday = getFeePayments().filter((p) => p.payment_date === new Date().toISOString().split("T")[0]).length;
  const booksIssued = getLibraryRecords().filter((r) => r.status === "issued").length;
  const studentRequestsCount = getStudentRequests().filter((r) => r.status !== "completed").length;
  const todaysTasks = getStaffTasks().filter((t) => t.status !== "completed").slice(0, 4);
  const recentRequests = getStudentRequests().slice(0, 4);

  const totalBeds = hostelRooms.reduce((s, r) => s + r.capacity, 0);
  const hostelOccupied = hostelAllocations.length;

  const feeStatusForStaff = [
    { name: "Paid", value: getStaffFees().filter((f) => f.status === "paid").length, color: palette.status.good },
    { name: "Pending", value: getStaffFees().filter((f) => f.status === "pending").length, color: palette.status.warning },
    { name: "Overdue", value: getStaffFees().filter((f) => f.status === "overdue").length, color: palette.status.critical },
  ];

  const routeUtilization = routes.map((r) => ({
    name: r.name,
    riders: studentTransport.filter((st) => st.route_id === r.id).length,
    capacity: r.capacity,
  }));

  const circulationByCategory = (() => {
    const byCategory = new Map<string, number>();
    for (const b of libraryBooks) {
      byCategory.set(b.category, (byCategory.get(b.category) ?? 0) + (b.total_copies - b.available_copies));
    }
    return [...byCategory.entries()].map(([category, issued]) => ({ category, issued }));
  })();

  const hostelOccupancyForStaff = hostelBlocks.map((block) => {
    const blockRooms = hostelRooms.filter((r) => r.block_id === block.id);
    const capacity = blockRooms.reduce((s, r) => s + r.capacity, 0);
    const occupied = hostelAllocations.filter((a) => blockRooms.some((r) => r.id === a.room_id)).length;
    return { name: block.name.replace(" Block", ""), occupied, capacity };
  });

  const messTrendForStaff = (() => {
    const byDate = new Map<string, number>();
    for (const rec of messAttendance) {
      if (!rec.consumed) continue;
      byDate.set(rec.date, (byDate.get(rec.date) ?? 0) + 1);
    }
    return [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-14).map(([date, count]) => ({
      day: new Date(date).toLocaleDateString("en", { day: "2-digit", month: "short" }),
      meals: count,
    }));
  })();

  return (
    <>
      <PageHeader title="Staff Dashboard" eyebrow="Staff Portal" />
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Welcome, {staff?.name ?? "Staff"} | {staff?.department} | {staffRole.replace("_", " ")}
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard title="Total Students" value={students.length} numericValue={students.length} icon={<PeopleIcon />} onClick={() => navigate("/staff/students")} />
        </Grid>
        {staffRole === "accountant" && (
          <>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard title="Fee Collections Today" value={feeCollectionsToday} numericValue={feeCollectionsToday} icon={<PaymentIcon />} onClick={() => navigate("/staff/fees/records")} delay={0.05} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard title="Pending Fee Payments" value={pendingFeePayments} numericValue={pendingFeePayments} icon={<PaymentIcon />} onClick={() => navigate("/staff/fees/collection")} delay={0.1} />
            </Grid>
          </>
        )}
        {staffRole === "library_staff" && (
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard title="Books Issued" value={booksIssued} numericValue={booksIssued} icon={<MenuBookIcon />} onClick={() => navigate("/staff/library/records")} delay={0.05} />
          </Grid>
        )}
        {staffRole === "transport_manager" && (
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard title="Bus Routes Active" value={routes.length} numericValue={routes.length} icon={<DirectionsBusIcon />} onClick={() => navigate("/staff/transport/routes")} delay={0.05} />
          </Grid>
        )}
        {staffRole === "hostel_warden" && (
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard title="Hostel Occupancy" value={`${totalBeds > 0 ? Math.round((hostelOccupied / totalBeds) * 100) : 0}%`} numericValue={totalBeds > 0 ? Math.round((hostelOccupied / totalBeds) * 100) : 0} formatValue={(n) => `${n}%`} icon={<HotelIcon />} onClick={() => navigate("/staff/hostel/allocation")} delay={0.05} />
          </Grid>
        )}
        {staffRole === "mess_manager" && (
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard title="Meals Served Today" value={messTrendForStaff.at(-1)?.meals ?? 0} numericValue={messTrendForStaff.at(-1)?.meals ?? 0} icon={<RestaurantIcon />} onClick={() => navigate("/staff/mess/attendance")} delay={0.05} />
          </Grid>
        )}
        {(staffRole === "office_staff" || staffRole === "accountant") && (
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard title="Student Requests" value={studentRequestsCount} numericValue={studentRequestsCount} icon={<TaskIcon />} onClick={() => navigate("/staff/students/requests")} delay={0.15} />
          </Grid>
        )}
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {canViewFeature(staffRole, "fees") && staffRole === "accountant" && (
          <Grid size={{ xs: 12, md: 6 }}>
            <ChartCard eyebrow="Finance" title="Collections This Month">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={feeStatusForStaff} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {feeStatusForStaff.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
        )}
        {staffRole === "transport_manager" && (
          <Grid size={{ xs: 12, md: 6 }}>
            <ChartCard eyebrow="Transport" title="Route Utilization">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={routeUtilization}>
                  <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
                  <XAxis dataKey="name" stroke={palette.axis} fontSize={11} />
                  <YAxis stroke={palette.axis} fontSize={12} />
                  <Tooltip {...tooltipStyle} />
                  <Legend />
                  <Bar dataKey="riders" name="Riders" fill={palette.categorical[0]} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="capacity" name="Capacity" fill={palette.categorical[1]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
        )}
        {staffRole === "library_staff" && (
          <Grid size={{ xs: 12, md: 6 }}>
            <ChartCard eyebrow="Library" title="Circulation by Category">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={circulationByCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
                  <XAxis dataKey="category" stroke={palette.axis} fontSize={11} />
                  <YAxis stroke={palette.axis} fontSize={12} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="issued" name="Copies Issued" fill={palette.categorical[0]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
        )}
        {staffRole === "hostel_warden" && (
          <Grid size={{ xs: 12, md: 6 }}>
            <ChartCard eyebrow="Hostel" title="Room Occupancy">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hostelOccupancyForStaff}>
                  <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
                  <XAxis dataKey="name" stroke={palette.axis} fontSize={11} />
                  <YAxis stroke={palette.axis} fontSize={12} />
                  <Tooltip {...tooltipStyle} />
                  <Legend />
                  <Bar dataKey="occupied" name="Occupied" fill={palette.categorical[0]} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="capacity" name="Capacity" fill={palette.categorical[1]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
        )}
        {staffRole === "mess_manager" && (
          <Grid size={{ xs: 12, md: 6 }}>
            <ChartCard eyebrow="Mess" title="Daily Consumption — Last 14 Days">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={messTrendForStaff}>
                  <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
                  <XAxis dataKey="day" stroke={palette.axis} fontSize={11} />
                  <YAxis stroke={palette.axis} fontSize={12} />
                  <Tooltip {...tooltipStyle} />
                  <Line type="monotone" dataKey="meals" name="Meals" stroke={palette.categorical[0]} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
        )}
      </Grid>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>Quick Workflow</Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          {staffRole === "accountant" && (
            <>
              <Button size="small" variant="outlined" onClick={() => navigate("/staff/fees/collection")}>Check Fee Payments</Button>
              <Button size="small" variant="outlined" onClick={() => navigate("/staff/fees/records")}>Record Fee Collection</Button>
              <Button size="small" variant="outlined" onClick={() => navigate("/staff/fees/receipts")}>Generate Receipts</Button>
              <Button size="small" variant="outlined" onClick={() => navigate("/staff/fees/defaulters")}>Review Defaulters</Button>
            </>
          )}
          {staffRole === "transport_manager" && (
            <>
              <Button size="small" variant="outlined" onClick={() => navigate("/staff/transport/routes")}>Check Routes</Button>
              <Button size="small" variant="outlined" onClick={() => navigate("/staff/transport/students")}>Update Student Allocation</Button>
              <Button size="small" variant="outlined" onClick={() => navigate("/staff/transport/vehicles")}>Review Vehicle Status</Button>
            </>
          )}
          {staffRole === "library_staff" && (
            <>
              <Button size="small" variant="outlined" onClick={() => navigate("/staff/library/books")}>Check Books</Button>
              <Button size="small" variant="outlined" onClick={() => navigate("/staff/library/issue")}>Issue Book</Button>
              <Button size="small" variant="outlined" onClick={() => navigate("/staff/library/return")}>Return Book</Button>
              <Button size="small" variant="outlined" onClick={() => navigate("/staff/library/records")}>Library Records</Button>
            </>
          )}
          {staffRole === "office_staff" && (
            <>
              <Button size="small" variant="outlined" onClick={() => navigate("/staff/students")}>Student Lookup</Button>
              <Button size="small" variant="outlined" onClick={() => navigate("/staff/students/requests")}>Admission/Requests</Button>
              <Button size="small" variant="outlined" onClick={() => navigate("/staff/certificates")}>Certificates</Button>
              <Button size="small" variant="outlined" onClick={() => navigate("/staff/id-cards")}>ID Cards</Button>
            </>
          )}
          {staffRole === "hostel_warden" && (
            <>
              <Button size="small" variant="outlined" onClick={() => navigate("/staff/hostel/allocation")}>Room Allocation</Button>
              <Button size="small" variant="outlined" onClick={() => navigate("/staff/hostel/roster")}>View Roster</Button>
            </>
          )}
          {staffRole === "mess_manager" && (
            <>
              <Button size="small" variant="outlined" onClick={() => navigate("/staff/mess/attendance")}>Mark Meal Attendance</Button>
              <Button size="small" variant="outlined" onClick={() => navigate("/staff/mess/menu")}>View Weekly Menu</Button>
            </>
          )}
        </Stack>
      </Paper>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>Today's Tasks</Typography>
            <Stack spacing={1}>
              {todaysTasks.map((t) => (
                <Box key={t.id} sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">{t.title}</Typography>
                  <Chip label={t.status.replace("_", " ")} size="small" />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>Recent Student Requests</Typography>
            <Stack spacing={1}>
              {recentRequests.map((r) => (
                <Box key={r.id} sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">{r.request_type.replace(/_/g, " ")}</Typography>
                  <Chip label={r.status.replace("_", " ")} size="small" />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>Recent Notices</Typography>
            <Stack spacing={1}>
              {announcements.slice(0, 4).map((a) => (
                <Box key={a.id} sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>{a.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{a.content}</Typography>
                  </Box>
                  <Chip label={a.date} size="small" variant="outlined" />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
```

- [ ] **Step 2: Verify the build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 3: Manual visual check**

Run: `npm run dev`, log in as staff, cycle through every staff role via the staff role switcher (accountant, transport_manager, library_staff, office_staff, hostel_warden, mess_manager). Expected: only the stat cards and chart(s) relevant to that role render; the Quick Workflow panel offers role-appropriate actions including the two new hostel/mess role branches.

- [ ] **Step 4: Commit**

```bash
git add src/pages/staff/Dashboard.tsx
git commit -m "feat: rebuild staff dashboard with role-conditional analytics"
```

---

## Task 5: Parent Dashboard rebuild

**Files:**
- Modify: `src/pages/parent/Dashboard.tsx` (full rewrite)

**Interfaces:**
- Consumes: same component set, `useAuth` for `selectedChildId`, and from `@/demo-data`: `getChildrenOfParent`, `getStudentAttendance`, `getStudentFees`, `exams`, `getHostelAllocationForStudent`, `getMessPlanForStudent`, `hostelRooms`, `hostelBlocks`.

- [ ] **Step 1: Read the current file first**

Read `src/pages/parent/Dashboard.tsx` in full — it already resolves the current parent's children via `getChildrenOfParent` and the selected child via `selectedChildId`/`MyChildren.tsx`'s selector pattern. Preserve that resolution logic.

- [ ] **Step 2: Add per-child summary cards and hostel/mess snapshot**

For the currently-selected child, replace the existing KPI cards with `StatCard`s (attendance %, fees due, upcoming exams — same pattern as Task 2). Below them, conditionally render (only if `getHostelAllocationForStudent(child.id)` returns a result):

```tsx
{hostelAllocation && (
  <Grid size={{ xs: 12, md: 6 }}>
    <Paper sx={{ p: 2 }}>
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>Hostel</Typography>
      <Stack spacing={0.5}>
        <Typography variant="body2">Block: {block?.name}</Typography>
        <Typography variant="body2">Room: {room?.room_number} ({room?.type})</Typography>
        <Typography variant="body2">Since: {hostelAllocation.check_in_date}</Typography>
      </Stack>
    </Paper>
  </Grid>
)}
{messPlan && (
  <Grid size={{ xs: 12, md: 6 }}>
    <Paper sx={{ p: 2 }}>
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>Mess Plan</Typography>
      <Stack spacing={0.5}>
        <Typography variant="body2">Plan: {messPlan.plan_type === "veg" ? "Vegetarian" : "Non-Vegetarian"}</Typography>
        <Typography variant="body2">Since: {messPlan.subscribed_since}</Typography>
      </Stack>
    </Paper>
  </Grid>
)}
```

where `block = hostelBlocks.find((b) => b.id === room?.block_id)`, `room = hostelRooms.find((r) => r.id === hostelAllocation?.room_id)`, `messPlan = getMessPlanForStudent(child.id)`.

- [ ] **Step 3: Verify the build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 4: Manual visual check**

Run: `npm run dev`, log in as parent, switch between children (if the parent has multiple) via the existing child selector. Expected: stat cards update per selected child; hostel/mess cards only appear for children who are hostel residents.

- [ ] **Step 5: Commit**

```bash
git add src/pages/parent/Dashboard.tsx
git commit -m "feat: rebuild parent dashboard with hostel and mess snapshot"
```

---

## Task 6: Student Dashboard rebuild

**Files:**
- Modify: `src/pages/student/Dashboard.tsx` (full rewrite)

**Interfaces:**
- Consumes: same component set, and from `@/demo-data`: `getStudentAttendance`, `getStudentMarks`, `exams`, `getHostelAllocationForStudent`, `getMessPlanForStudent`, `hostelRooms`, `hostelBlocks`.

- [ ] **Step 1: Read the current file first**

Read `src/pages/student/Dashboard.tsx` in full (already captured earlier in this session) — preserve its timetable and announcements panels.

- [ ] **Step 2: Replace the "Latest Results" list with a grade trend chart**

Replace the existing `marks.slice(0, 5).map(...)` block with a `ChartCard`:

```tsx
<ChartCard eyebrow="Academics" title="Grade Trend Across Exams">
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={gradeTrend}>
      <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
      <XAxis dataKey="exam" stroke={palette.axis} fontSize={11} />
      <YAxis domain={[0, 100]} stroke={palette.axis} fontSize={12} />
      <Tooltip {...tooltipStyle} />
      <Line type="monotone" dataKey="avgScore" name="Average Score" stroke={palette.categorical[0]} strokeWidth={2} dot={{ r: 4 }} />
    </LineChart>
  </ResponsiveContainer>
</ChartCard>
```

where `gradeTrend = exams.map((exam) => { const examMarks = marks.filter((m) => m.exam_id === exam.id); return { exam: exam.name, avgScore: examMarks.length ? Math.round(examMarks.reduce((s, m) => s + m.marks_obtained, 0) / examMarks.length) : 0 }; })`.

Replace the KPI cards (`Attendance`, `Pending Homework`, `Upcoming Exams`, `Announcements`) with `StatCard`s using `numericValue` for count-up, same as prior tasks.

- [ ] **Step 3: Add hostel/mess snapshot (mirrors Task 5's parent version, using the logged-in student's own id instead of a selected child)**

- [ ] **Step 4: Verify, manual check, and commit**

Run: `npm run build` then `npm run dev` and confirm the grade trend line renders with 3 points (one per exam) and hostel/mess cards appear only if the logged-in student (`stu1` by default) is a hostel resident — if `stu1` isn't in the resident subset, temporarily check with a different student via the role/user switcher if the app exposes one, or trust the conditional logic since it's identical to Task 5's already-verified pattern.

```bash
git add src/pages/student/Dashboard.tsx
git commit -m "feat: rebuild student dashboard with grade trend and hostel/mess snapshot"
```

---

## Task 7: Hostel module — Admin pages

**Files:**
- Create: `src/pages/admin/HostelDashboard.tsx`
- Create: `src/pages/admin/HostelRooms.tsx`
- Create: `src/pages/admin/HostelAllocation.tsx`
- Create: `src/pages/admin/HostelFeeStructure.tsx`

**Interfaces:**
- Consumes: `PageHeader`, `StatCard`, `ChartCard`, `DataTable`, `StatusChip`, `getChartPalette`/`getChartTooltipStyle`, `useColorMode`, and from `@/demo-data`: `hostelBlocks`, `hostelRooms`, `hostelAllocations`, `hostelFees`, `students`, `staffMembers`.

- [ ] **Step 1: `HostelDashboard.tsx` — occupancy overview**

```tsx
// src/pages/admin/HostelDashboard.tsx
import { Grid, Paper, Typography, Stack, Box } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import HotelIcon from "@mui/icons-material/Hotel";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import PersonIcon from "@mui/icons-material/Person";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { ChartCard } from "@/components/ChartCard";
import { getChartPalette, getChartTooltipStyle } from "@/theme/chartPalette";
import { useColorMode } from "@/context/ColorModeContext";
import { hostelBlocks, hostelRooms, hostelAllocations, staffMembers } from "@/demo-data";

export default function HostelDashboard() {
  const { mode } = useColorMode();
  const palette = getChartPalette(mode);
  const tooltipStyle = getChartTooltipStyle(mode);

  const totalBeds = hostelRooms.reduce((s, r) => s + r.capacity, 0);
  const occupied = hostelAllocations.length;
  const vacant = totalBeds - occupied;

  const byBlock = hostelBlocks.map((block) => {
    const rooms = hostelRooms.filter((r) => r.block_id === block.id);
    const capacity = rooms.reduce((s, r) => s + r.capacity, 0);
    const blockOccupied = hostelAllocations.filter((a) => rooms.some((r) => r.id === a.room_id)).length;
    const warden = staffMembers.find((s) => s.id === block.warden_staff_id);
    return { name: block.name, capacity, occupied: blockOccupied, warden: warden?.name ?? "Unassigned" };
  });

  const occupancyPie = [
    { name: "Occupied", value: occupied, color: palette.categorical[0] },
    { name: "Vacant", value: vacant, color: palette.categorical[1] },
  ];

  return (
    <>
      <PageHeader title="Hostel Dashboard" eyebrow="Operations" breadcrumbs={[{ label: "Operations" }, { label: "Hostel" }]} />
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard title="Total Beds" value={totalBeds} numericValue={totalBeds} icon={<HotelIcon />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard title="Occupied Beds" value={occupied} numericValue={occupied} icon={<PersonIcon />} delay={0.05} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard title="Vacant Beds" value={vacant} numericValue={vacant} icon={<MeetingRoomIcon />} delay={0.1} />
        </Grid>
      </Grid>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <ChartCard eyebrow="Occupancy" title="Beds by Block">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byBlock}>
                <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
                <XAxis dataKey="name" stroke={palette.axis} fontSize={11} />
                <YAxis stroke={palette.axis} fontSize={12} />
                <Tooltip {...tooltipStyle} />
                <Legend />
                <Bar dataKey="occupied" name="Occupied" fill={palette.categorical[0]} radius={[4, 4, 0, 0]} />
                <Bar dataKey="capacity" name="Capacity" fill={palette.categorical[1]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ChartCard eyebrow="Occupancy" title="Overall Occupancy">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={occupancyPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {occupancyPie.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>Blocks</Typography>
        <Stack spacing={1.5}>
          {byBlock.map((b) => (
            <Box key={b.name} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1, borderBottom: 1, borderColor: "divider" }}>
              <Box>
                <Typography variant="body2" fontWeight={600}>{b.name}</Typography>
                <Typography variant="caption" color="text.secondary">Warden: {b.warden}</Typography>
              </Box>
              <Typography variant="body2">{b.occupied} / {b.capacity} beds</Typography>
            </Box>
          ))}
        </Stack>
      </Paper>
    </>
  );
}
```

- [ ] **Step 2: `HostelRooms.tsx` — blocks & rooms table**

```tsx
// src/pages/admin/HostelRooms.tsx
import { useState } from "react";
import { Chip } from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { hostelBlocks, hostelRooms, hostelAllocations } from "@/demo-data";

export default function HostelRooms() {
  const [blockFilter] = useState<string | null>(null);

  const rows = hostelRooms
    .filter((r) => !blockFilter || r.block_id === blockFilter)
    .map((r) => {
      const block = hostelBlocks.find((b) => b.id === r.block_id);
      const occupants = hostelAllocations.filter((a) => a.room_id === r.id && a.status === "active").length;
      return { ...r, blockName: block?.name ?? r.block_id, occupants };
    });

  return (
    <>
      <PageHeader title="Blocks & Rooms" eyebrow="Hostel" breadcrumbs={[{ label: "Operations" }, { label: "Hostel", to: "/admin/hostel" }, { label: "Blocks & Rooms" }]} />
      <DataTable
        pagination
        pageSize={25}
        columns={[
          { key: "blockName", label: "Block" },
          { key: "room_number", label: "Room No." },
          { key: "type", label: "Type", render: (r) => <Chip size="small" label={r.type} variant="outlined" /> },
          { key: "capacity", label: "Capacity" },
          { key: "occupants", label: "Occupied", render: (r) => `${r.occupants} / ${r.capacity}` },
        ]}
        rows={rows}
        emptyTitle="No rooms found"
      />
    </>
  );
}
```

- [ ] **Step 3: `HostelAllocation.tsx` — student-room allocation table**

```tsx
// src/pages/admin/HostelAllocation.tsx
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import StatusChip from "@/components/StatusChip";
import { hostelAllocations, hostelRooms, hostelBlocks, students } from "@/demo-data";

export default function HostelAllocation() {
  const rows = hostelAllocations.map((a) => {
    const room = hostelRooms.find((r) => r.id === a.room_id);
    const block = hostelBlocks.find((b) => b.id === room?.block_id);
    const student = students.find((s) => s.id === a.student_id);
    return {
      ...a,
      studentName: student?.name ?? a.student_id,
      roomLabel: room ? `${room.room_number} (${block?.name ?? ""})` : a.room_id,
    };
  });

  return (
    <>
      <PageHeader title="Room Allocation" eyebrow="Hostel" breadcrumbs={[{ label: "Operations" }, { label: "Hostel", to: "/admin/hostel" }, { label: "Room Allocation" }]} />
      <DataTable
        pagination
        pageSize={25}
        columns={[
          { key: "studentName", label: "Student" },
          { key: "roomLabel", label: "Room" },
          { key: "check_in_date", label: "Check-in Date" },
          { key: "status", label: "Status", render: (r) => <StatusChip status={r.status} /> },
        ]}
        rows={rows}
        emptyTitle="No allocations found"
      />
    </>
  );
}
```

- [ ] **Step 4: `HostelFeeStructure.tsx` — fee overview + defaulters**

```tsx
// src/pages/admin/HostelFeeStructure.tsx
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import StatusChip from "@/components/StatusChip";
import { hostelFees, students } from "@/demo-data";

export default function HostelFeeStructure() {
  const currentMonthFees = hostelFees.filter((f) => {
    const d = new Date(f.due_date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const rows = currentMonthFees.map((f) => ({
    ...f,
    studentName: students.find((s) => s.id === f.student_id)?.name ?? f.student_id,
  }));

  return (
    <>
      <PageHeader title="Hostel Fee Structure" eyebrow="Hostel" breadcrumbs={[{ label: "Operations" }, { label: "Hostel", to: "/admin/hostel" }, { label: "Fee Structure" }]} />
      <DataTable
        pagination
        pageSize={25}
        columns={[
          { key: "studentName", label: "Student" },
          { key: "amount", label: "Amount", render: (r) => `₹${r.amount.toLocaleString("en-IN")}` },
          { key: "due_date", label: "Due Date" },
          { key: "status", label: "Status", render: (r) => <StatusChip status={r.status} /> },
        ]}
        rows={rows}
        emptyTitle="No hostel fees for this month"
      />
    </>
  );
}
```

- [ ] **Step 5: Verify the build**

Run: `npm run build` — expected to succeed (routes are wired in Task 13, so these pages aren't reachable via the UI yet, but must compile standalone).

- [ ] **Step 6: Commit**

```bash
git add src/pages/admin/HostelDashboard.tsx src/pages/admin/HostelRooms.tsx src/pages/admin/HostelAllocation.tsx src/pages/admin/HostelFeeStructure.tsx
git commit -m "feat: add admin hostel module pages"
```

---

## Task 8: Hostel module — Staff pages

**Files:**
- Create: `src/pages/staff/HostelAllocation.tsx`
- Create: `src/pages/staff/HostelRoster.tsx`

**Interfaces:**
- Consumes: same as Task 7's `HostelAllocation.tsx` (reuse pattern), plus `hostelBlocks`, `hostelRooms`.

- [ ] **Step 1: `HostelAllocation.tsx` (staff) — identical table to the admin version**

```tsx
// src/pages/staff/HostelAllocation.tsx
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import StatusChip from "@/components/StatusChip";
import { hostelAllocations, hostelRooms, hostelBlocks, students } from "@/demo-data";

export default function StaffHostelAllocation() {
  const rows = hostelAllocations.map((a) => {
    const room = hostelRooms.find((r) => r.id === a.room_id);
    const block = hostelBlocks.find((b) => b.id === room?.block_id);
    const student = students.find((s) => s.id === a.student_id);
    return {
      ...a,
      studentName: student?.name ?? a.student_id,
      roomLabel: room ? `${room.room_number} (${block?.name ?? ""})` : a.room_id,
    };
  });

  return (
    <>
      <PageHeader title="Room Allocation" eyebrow="Hostel" />
      <DataTable
        pagination
        pageSize={25}
        columns={[
          { key: "studentName", label: "Student" },
          { key: "roomLabel", label: "Room" },
          { key: "check_in_date", label: "Check-in Date" },
          { key: "status", label: "Status", render: (r) => <StatusChip status={r.status} /> },
        ]}
        rows={rows}
        emptyTitle="No allocations found"
      />
    </>
  );
}
```

- [ ] **Step 2: `HostelRoster.tsx` — block roster grouped view**

```tsx
// src/pages/staff/HostelRoster.tsx
import { Paper, Typography, Stack, Box, Chip } from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { hostelBlocks, hostelRooms, hostelAllocations, students } from "@/demo-data";

export default function HostelRoster() {
  return (
    <>
      <PageHeader title="Hostel Roster" eyebrow="Hostel" />
      <Stack spacing={2}>
        {hostelBlocks.map((block) => {
          const rooms = hostelRooms.filter((r) => r.block_id === block.id);
          return (
            <Paper key={block.id} sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>{block.name}</Typography>
              <Stack spacing={1}>
                {rooms.map((room) => {
                  const occupants = hostelAllocations
                    .filter((a) => a.room_id === room.id && a.status === "active")
                    .map((a) => students.find((s) => s.id === a.student_id)?.name)
                    .filter((n): n is string => Boolean(n));
                  if (occupants.length === 0) return null;
                  return (
                    <Box key={room.id} sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                      <Chip size="small" label={`Room ${room.room_number}`} />
                      <Typography variant="body2" color="text.secondary">{occupants.join(", ")}</Typography>
                    </Box>
                  );
                })}
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    </>
  );
}
```

- [ ] **Step 3: Verify and commit**

Run: `npm run build` — expected to succeed.

```bash
git add src/pages/staff/HostelAllocation.tsx src/pages/staff/HostelRoster.tsx
git commit -m "feat: add staff hostel allocation and roster pages"
```

---

## Task 9: Hostel module — Parent/Student "My Hostel" page

**Files:**
- Create: `src/pages/parent/Hostel.tsx`
- Create: `src/pages/student/Hostel.tsx`

**Interfaces:**
- Consumes: `getHostelAllocationForStudent`, `getRoommates`, `hostelRooms`, `hostelBlocks`, `staffMembers` from `@/demo-data`; `useAuth` for the target student id (parent: `selectedChildId`; student: `user.id`).

- [ ] **Step 1: `student/Hostel.tsx`**

```tsx
// src/pages/student/Hostel.tsx
import { Paper, Typography, Stack, Box, Avatar, Chip } from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import HotelIcon from "@mui/icons-material/Hotel";
import { useAuth } from "@/context/AuthContext";
import { getHostelAllocationForStudent, getRoommates, hostelRooms, hostelBlocks, staffMembers } from "@/demo-data";

export default function StudentHostel() {
  const { user } = useAuth();
  const allocation = user ? getHostelAllocationForStudent(user.id) : undefined;

  if (!allocation) {
    return (
      <>
        <PageHeader title="My Hostel" eyebrow="Hostel" />
        <Paper sx={{ p: 2 }}>
          <EmptyState icon={<HotelIcon fontSize="inherit" />} title="Not a hostel resident" description="You are not currently allocated to a hostel room." />
        </Paper>
      </>
    );
  }

  const room = hostelRooms.find((r) => r.id === allocation.room_id);
  const block = hostelBlocks.find((b) => b.id === room?.block_id);
  const warden = staffMembers.find((s) => s.id === block?.warden_staff_id);
  const roommates = user ? getRoommates(user.id) : [];

  return (
    <>
      <PageHeader title="My Hostel" eyebrow="Hostel" />
      <Stack spacing={2}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>Room Details</Typography>
          <Stack spacing={0.5}>
            <Typography variant="body2">Block: {block?.name}</Typography>
            <Typography variant="body2">Room: {room?.room_number} ({room?.type})</Typography>
            <Typography variant="body2">Since: {allocation.check_in_date}</Typography>
            <Typography variant="body2">Warden: {warden?.name} ({warden?.email})</Typography>
          </Stack>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>Roommates</Typography>
          {roommates.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No roommates.</Typography>
          ) : (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {roommates.map((r) => (
                <Chip key={r.id} avatar={<Avatar>{r.name.charAt(0)}</Avatar>} label={r.name} variant="outlined" />
              ))}
            </Stack>
          )}
        </Paper>
      </Stack>
    </>
  );
}
```

- [ ] **Step 2: `parent/Hostel.tsx` — identical, but resolves `selectedChildId` instead of `user.id`**

```tsx
// src/pages/parent/Hostel.tsx
import { Paper, Typography, Stack, Chip, Avatar } from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import HotelIcon from "@mui/icons-material/Hotel";
import { useAuth } from "@/context/AuthContext";
import { getHostelAllocationForStudent, getRoommates, hostelRooms, hostelBlocks, staffMembers, students } from "@/demo-data";

export default function ParentHostel() {
  const { selectedChildId } = useAuth();
  const child = students.find((s) => s.id === selectedChildId);
  const allocation = getHostelAllocationForStudent(selectedChildId);

  if (!allocation) {
    return (
      <>
        <PageHeader title="My Hostel" eyebrow="Hostel" />
        <Paper sx={{ p: 2 }}>
          <EmptyState icon={<HotelIcon fontSize="inherit" />} title="Not a hostel resident" description={`${child?.name ?? "This child"} is not currently allocated to a hostel room.`} />
        </Paper>
      </>
    );
  }

  const room = hostelRooms.find((r) => r.id === allocation.room_id);
  const block = hostelBlocks.find((b) => b.id === room?.block_id);
  const warden = staffMembers.find((s) => s.id === block?.warden_staff_id);
  const roommates = getRoommates(selectedChildId);

  return (
    <>
      <PageHeader title="My Hostel" eyebrow="Hostel" />
      <Stack spacing={2}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>Room Details</Typography>
          <Stack spacing={0.5}>
            <Typography variant="body2">Block: {block?.name}</Typography>
            <Typography variant="body2">Room: {room?.room_number} ({room?.type})</Typography>
            <Typography variant="body2">Since: {allocation.check_in_date}</Typography>
            <Typography variant="body2">Warden: {warden?.name} ({warden?.email})</Typography>
          </Stack>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>Roommates</Typography>
          {roommates.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No roommates.</Typography>
          ) : (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {roommates.map((r) => (
                <Chip key={r.id} avatar={<Avatar>{r.name.charAt(0)}</Avatar>} label={r.name} variant="outlined" />
              ))}
            </Stack>
          )}
        </Paper>
      </Stack>
    </>
  );
}
```

- [ ] **Step 3: Verify and commit**

Run: `npm run build` — expected to succeed.

```bash
git add src/pages/student/Hostel.tsx src/pages/parent/Hostel.tsx
git commit -m "feat: add parent/student My Hostel pages"
```

---

## Task 10: Mess module — Admin pages

**Files:**
- Create: `src/pages/admin/MessDashboard.tsx`
- Create: `src/pages/admin/MessMenu.tsx`
- Create: `src/pages/admin/MessPlans.tsx`
- Create: `src/pages/admin/MessBilling.tsx`

**Interfaces:**
- Consumes: `PageHeader`, `StatCard`, `ChartCard`, `DataTable`, `StatusChip`, chart palette helpers, and from `@/demo-data`: `messMenu`, `messPlans`, `messAttendance`, `messBilling`, `students`.

- [ ] **Step 1: `MessDashboard.tsx` — consumption trend + plan distribution**

```tsx
// src/pages/admin/MessDashboard.tsx
import { Grid } from "@mui/material";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import GroupIcon from "@mui/icons-material/Group";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { ChartCard } from "@/components/ChartCard";
import { getChartPalette, getChartTooltipStyle } from "@/theme/chartPalette";
import { useColorMode } from "@/context/ColorModeContext";
import { messPlans, messAttendance } from "@/demo-data";

export default function MessDashboard() {
  const { mode } = useColorMode();
  const palette = getChartPalette(mode);
  const tooltipStyle = getChartTooltipStyle(mode);

  const vegCount = messPlans.filter((p) => p.plan_type === "veg").length;
  const nonVegCount = messPlans.filter((p) => p.plan_type === "non_veg").length;

  const planPie = [
    { name: "Vegetarian", value: vegCount, color: palette.categorical[0] },
    { name: "Non-Vegetarian", value: nonVegCount, color: palette.categorical[1] },
  ];

  const consumptionTrend = (() => {
    const byDate = new Map<string, number>();
    for (const rec of messAttendance) {
      if (!rec.consumed) continue;
      byDate.set(rec.date, (byDate.get(rec.date) ?? 0) + 1);
    }
    return [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({
      day: new Date(date).toLocaleDateString("en", { day: "2-digit", month: "short" }),
      meals: count,
    }));
  })();

  return (
    <>
      <PageHeader title="Mess Dashboard" eyebrow="Operations" breadcrumbs={[{ label: "Operations" }, { label: "Mess" }]} />
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <StatCard title="Active Mess Plans" value={messPlans.length} numericValue={messPlans.length} icon={<RestaurantIcon />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <StatCard title="Vegetarian Plans" value={vegCount} numericValue={vegCount} icon={<GroupIcon />} delay={0.05} />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <ChartCard eyebrow="Consumption" title="Meals Served — Last 30 Days">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={consumptionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
                <XAxis dataKey="day" stroke={palette.axis} fontSize={10} interval={4} />
                <YAxis stroke={palette.axis} fontSize={12} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="meals" name="Meals" stroke={palette.categorical[0]} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ChartCard eyebrow="Plans" title="Plan Distribution">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={planPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {planPie.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>
    </>
  );
}
```

- [ ] **Step 2: `MessMenu.tsx` — weekly menu grid**

```tsx
// src/pages/admin/MessMenu.tsx
import { Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { messMenu } from "@/demo-data";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
const MEALS = ["breakfast", "lunch", "snacks", "dinner"] as const;

export default function MessMenu() {
  return (
    <>
      <PageHeader title="Weekly Menu" eyebrow="Mess" breadcrumbs={[{ label: "Operations" }, { label: "Mess", to: "/admin/mess" }, { label: "Weekly Menu" }]} />
      <Paper sx={{ overflow: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Day</TableCell>
              {MEALS.map((m) => <TableCell key={m} sx={{ textTransform: "capitalize" }}>{m}</TableCell>)}
            </TableRow>
          </TableHead>
          <TableBody>
            {DAYS.map((day) => (
              <TableRow key={day}>
                <TableCell sx={{ fontWeight: 600 }}>{day}</TableCell>
                {MEALS.map((meal) => {
                  const entry = messMenu.find((m) => m.day_of_week === day && m.meal === meal);
                  return (
                    <TableCell key={meal}>
                      <Typography variant="body2">{entry?.items.join(", ") ?? "—"}</Typography>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
}
```

- [ ] **Step 3: `MessPlans.tsx` — student plan table**

```tsx
// src/pages/admin/MessPlans.tsx
import { Chip } from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { messPlans, students } from "@/demo-data";

export default function MessPlans() {
  const rows = messPlans.map((p) => ({
    ...p,
    studentName: students.find((s) => s.id === p.student_id)?.name ?? p.student_id,
  }));

  return (
    <>
      <PageHeader title="Mess Plans" eyebrow="Mess" breadcrumbs={[{ label: "Operations" }, { label: "Mess", to: "/admin/mess" }, { label: "Mess Plans" }]} />
      <DataTable
        pagination
        pageSize={25}
        columns={[
          { key: "studentName", label: "Student" },
          { key: "plan_type", label: "Plan", render: (r) => <Chip size="small" label={r.plan_type === "veg" ? "Vegetarian" : "Non-Vegetarian"} variant="outlined" /> },
          { key: "subscribed_since", label: "Subscribed Since" },
        ]}
        rows={rows}
        emptyTitle="No mess plans found"
      />
    </>
  );
}
```

- [ ] **Step 4: `MessBilling.tsx` — monthly billing table**

```tsx
// src/pages/admin/MessBilling.tsx
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import StatusChip from "@/components/StatusChip";
import { messBilling, students } from "@/demo-data";

export default function MessBilling() {
  const currentMonth = messBilling.length > 0 ? messBilling[messBilling.length - 1].month_label : "";
  const rows = messBilling
    .filter((b) => b.month_label === currentMonth)
    .map((b) => ({ ...b, studentName: students.find((s) => s.id === b.student_id)?.name ?? b.student_id }));

  return (
    <>
      <PageHeader title="Mess Billing" eyebrow="Mess" breadcrumbs={[{ label: "Operations" }, { label: "Mess", to: "/admin/mess" }, { label: "Billing" }]} />
      <DataTable
        pagination
        pageSize={25}
        columns={[
          { key: "studentName", label: "Student" },
          { key: "month_label", label: "Month" },
          { key: "amount", label: "Amount", render: (r) => `₹${r.amount.toLocaleString("en-IN")}` },
          { key: "status", label: "Status", render: (r) => <StatusChip status={r.status} /> },
        ]}
        rows={rows}
        emptyTitle="No billing records for this month"
      />
    </>
  );
}
```

- [ ] **Step 5: Verify and commit**

Run: `npm run build` — expected to succeed.

```bash
git add src/pages/admin/MessDashboard.tsx src/pages/admin/MessMenu.tsx src/pages/admin/MessPlans.tsx src/pages/admin/MessBilling.tsx
git commit -m "feat: add admin mess module pages"
```

---

## Task 11: Mess module — Staff pages

**Files:**
- Create: `src/pages/staff/MessAttendance.tsx`
- Create: `src/pages/staff/MessMenu.tsx`

**Interfaces:**
- Consumes: `messPlans`, `messAttendance`, `messMenu`, `students` from `@/demo-data`.

- [ ] **Step 1: `MessAttendance.tsx` — today's meal attendance by student**

```tsx
// src/pages/staff/MessAttendance.tsx
import { useState } from "react";
import { ToggleButtonGroup, ToggleButton } from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import StatusChip from "@/components/StatusChip";
import { messPlans, messAttendance, students } from "@/demo-data";
import type { MessMeal } from "@/types";

const MEALS: MessMeal[] = ["breakfast", "lunch", "snacks", "dinner"];
const TODAY = new Date().toISOString().split("T")[0];

export default function MessAttendance() {
  const [meal, setMeal] = useState<MessMeal>("lunch");

  const rows = messPlans.map((plan) => {
    const record = messAttendance.find((a) => a.student_id === plan.student_id && a.date === TODAY && a.meal === meal);
    return {
      studentName: students.find((s) => s.id === plan.student_id)?.name ?? plan.student_id,
      planType: plan.plan_type,
      consumed: record?.consumed ?? false,
    };
  });

  return (
    <>
      <PageHeader
        title="Daily Meal Attendance"
        eyebrow="Mess"
        action={
          <ToggleButtonGroup size="small" value={meal} exclusive onChange={(_, v) => v && setMeal(v)}>
            {MEALS.map((m) => (
              <ToggleButton key={m} value={m} sx={{ textTransform: "capitalize" }}>{m}</ToggleButton>
            ))}
          </ToggleButtonGroup>
        }
      />
      <DataTable
        pagination
        pageSize={25}
        columns={[
          { key: "studentName", label: "Student" },
          { key: "planType", label: "Plan" },
          { key: "consumed", label: "Status", render: (r) => <StatusChip status={r.consumed ? "completed" : "pending"} /> },
        ]}
        rows={rows}
        emptyTitle="No mess plans found"
      />
    </>
  );
}
```

- [ ] **Step 2: `MessMenu.tsx` (staff) — read-only weekly menu (reuse the admin table layout verbatim)**

Create `src/pages/staff/MessMenu.tsx` with identical content to `src/pages/admin/MessMenu.tsx` (Task 10, Step 2), only changing the component name to `StaffMessMenu` and dropping the breadcrumbs prop (staff pages in this codebase don't use breadcrumbs — confirm by checking an existing staff page such as `src/pages/staff/LibraryBooks.tsx`'s `PageHeader` usage before finalizing).

- [ ] **Step 3: Verify and commit**

Run: `npm run build` — expected to succeed.

```bash
git add src/pages/staff/MessAttendance.tsx src/pages/staff/MessMenu.tsx
git commit -m "feat: add staff mess attendance and menu pages"
```

---

## Task 12: Mess module — Parent/Student "My Mess" page

**Files:**
- Create: `src/pages/student/Mess.tsx`
- Create: `src/pages/parent/Mess.tsx`

**Interfaces:**
- Consumes: `getMessPlanForStudent`, `messMenu` from `@/demo-data`; `useAuth`.

- [ ] **Step 1: `student/Mess.tsx`**

```tsx
// src/pages/student/Mess.tsx
import { Paper, Typography, Stack, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import { useAuth } from "@/context/AuthContext";
import { getMessPlanForStudent, messMenu } from "@/demo-data";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
const MEALS = ["breakfast", "lunch", "snacks", "dinner"] as const;

export default function StudentMess() {
  const { user } = useAuth();
  const plan = user ? getMessPlanForStudent(user.id) : undefined;

  if (!plan) {
    return (
      <>
        <PageHeader title="My Mess" eyebrow="Mess" />
        <Paper sx={{ p: 2 }}>
          <EmptyState icon={<RestaurantIcon fontSize="inherit" />} title="No active mess plan" description="You are not currently subscribed to a mess plan." />
        </Paper>
      </>
    );
  }

  return (
    <>
      <PageHeader title="My Mess" eyebrow="Mess" />
      <Stack spacing={2}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>My Plan</Typography>
          <Typography variant="body2">Type: {plan.plan_type === "veg" ? "Vegetarian" : "Non-Vegetarian"}</Typography>
          <Typography variant="body2">Subscribed Since: {plan.subscribed_since}</Typography>
        </Paper>
        <Paper sx={{ overflow: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Day</TableCell>
                {MEALS.map((m) => <TableCell key={m} sx={{ textTransform: "capitalize" }}>{m}</TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {DAYS.map((day) => (
                <TableRow key={day}>
                  <TableCell sx={{ fontWeight: 600 }}>{day}</TableCell>
                  {MEALS.map((meal) => {
                    const entry = messMenu.find((m) => m.day_of_week === day && m.meal === meal);
                    return <TableCell key={meal}><Typography variant="body2">{entry?.items.join(", ") ?? "—"}</Typography></TableCell>;
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Stack>
    </>
  );
}
```

- [ ] **Step 2: `parent/Mess.tsx` — identical, resolving `selectedChildId` instead of `user.id`**

Create `src/pages/parent/Mess.tsx` with the same structure as Step 1, replacing `const { user } = useAuth();` / `getMessPlanForStudent(user.id)` with `const { selectedChildId } = useAuth();` / `getMessPlanForStudent(selectedChildId)`, and renaming the component to `ParentMess`.

- [ ] **Step 3: Verify and commit**

Run: `npm run build` — expected to succeed.

```bash
git add src/pages/student/Mess.tsx src/pages/parent/Mess.tsx
git commit -m "feat: add parent/student My Mess pages"
```

---

## Task 13: Wire all new routes

**Files:**
- Modify: `src/router.tsx`

**Interfaces:**
- Consumes: every page component created in Tasks 7-12.
- Produces: no new exported interface — `router` remains the default export consumed by `src/main.tsx` (unmodified call site).

- [ ] **Step 1: Add lazy imports**

In `src/router.tsx`, after the existing `const ParentNotifications = ...` line (admin pages block), add:

```ts
const HostelDashboard = () => L(() => import("@/pages/admin/HostelDashboard"));
const HostelRooms = () => L(() => import("@/pages/admin/HostelRooms"));
const HostelAllocationAdmin = () => L(() => import("@/pages/admin/HostelAllocation"));
const HostelFeeStructure = () => L(() => import("@/pages/admin/HostelFeeStructure"));
const MessDashboard = () => L(() => import("@/pages/admin/MessDashboard"));
const AdminMessMenu = () => L(() => import("@/pages/admin/MessMenu"));
const MessPlans = () => L(() => import("@/pages/admin/MessPlans"));
const MessBilling = () => L(() => import("@/pages/admin/MessBilling"));
```

After the existing `const StaffProfile = ...` line (staff pages block), add:

```ts
const StaffHostelAllocation = () => L(() => import("@/pages/staff/HostelAllocation"));
const HostelRoster = () => L(() => import("@/pages/staff/HostelRoster"));
const StaffMessAttendance = () => L(() => import("@/pages/staff/MessAttendance"));
const StaffMessMenu = () => L(() => import("@/pages/staff/MessMenu"));
```

After the existing `const ParentProfile = ...` line (parent pages block), add:

```ts
const ParentHostel = () => L(() => import("@/pages/parent/Hostel"));
const ParentMess = () => L(() => import("@/pages/parent/Mess"));
```

After the existing `const StudentTransport = ...` line (student pages block), add:

```ts
const StudentHostel = () => L(() => import("@/pages/student/Hostel"));
const StudentMess = () => L(() => import("@/pages/student/Mess"));
```

- [ ] **Step 2: Add route entries**

In the `admin` route group, after `{ path: "admin/transport/drivers", element: <DriverManagement /> },`, add:

```tsx
{ path: "admin/hostel", element: <HostelDashboard /> },
{ path: "admin/hostel/rooms", element: <HostelRooms /> },
{ path: "admin/hostel/allocation", element: <HostelAllocationAdmin /> },
{ path: "admin/hostel/fees", element: <HostelFeeStructure /> },
{ path: "admin/mess", element: <MessDashboard /> },
{ path: "admin/mess/menu", element: <AdminMessMenu /> },
{ path: "admin/mess/plans", element: <MessPlans /> },
{ path: "admin/mess/billing", element: <MessBilling /> },
```

In the `staff` route group, after `{ path: "staff/library/records", element: SG("library", <LibraryRecords />) },`, add:

```tsx
{ path: "staff/hostel/allocation", element: SG("hostel", <StaffHostelAllocation />) },
{ path: "staff/hostel/roster", element: SG("hostel", <HostelRoster />) },
{ path: "staff/mess/attendance", element: SG("mess", <StaffMessAttendance />, "manage") },
{ path: "staff/mess/menu", element: SG("mess", <StaffMessMenu />) },
```

In the `parent` route group, after `{ path: "parent/transport", element: <ParentTransport /> },`, add:

```tsx
{ path: "parent/hostel", element: <ParentHostel /> },
{ path: "parent/mess", element: <ParentMess /> },
```

In the `student` route group, after `{ path: "student/transport", element: <StudentTransport /> },`, add:

```tsx
{ path: "student/hostel", element: <StudentHostel /> },
{ path: "student/mess", element: <StudentMess /> },
```

- [ ] **Step 3: Verify the build**

Run: `npm run build`
Expected: succeeds with zero errors.

- [ ] **Step 4: Manual walkthrough**

Run: `npm run dev`. Click every new nav entry added in the "Design System Foundation" plan's Task 11 (Hostel, Mess under admin; Hostel, Mess under staff for hostel_warden/mess_manager roles; My Hostel, My Mess for parent and student). Expected: every link now resolves to a real page (no more 404s inside the `Outlet`), each page renders its data correctly, and `StaffFeatureGuard` correctly blocks a staff role without `hostel`/`mess` permission (e.g. switch to `library_staff` and confirm `/staff/hostel/allocation` redirects to `/staff`).

- [ ] **Step 5: Commit**

```bash
git add src/router.tsx
git commit -m "feat: wire hostel and mess routes for all portals"
```

---

## Task 14: Full-app verification pass

**Files:** none (verification only)

- [ ] **Step 1: Full build**

Run: `npm run build`
Expected: `tsc -b` and `vite build` both succeed with zero errors.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: zero errors.

- [ ] **Step 3: Manual walkthrough**

Run: `npm run dev`. For each of the 5 portals, open the dashboard and confirm every chart renders real data (no empty/NaN charts), animations run smoothly, and dark mode renders correctly. Open every new hostel/mess page across admin, staff (all 6 staff roles), parent, and student. Confirm no console errors anywhere.

- [ ] **Step 4: Commit (if any fixes were needed)**

If Steps 1-3 required fixes, stage and commit them. If no fixes were needed, this task requires no commit.
