# Design System Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the default-MUI look with a premium monochrome + off-white design system (theme tokens, chart palette, component library, collapsible sidebar navigation) so every existing page in the app instantly inherits the new look with minimal or no page-level changes.

**Architecture:** A new `src/theme/` module supplies color/motion/radius tokens and a validated chart color palette. `PageHeader` and `DataTable` are upgraded **in place** (same import path, same required props, new optional props) so all 111 and 64 existing usages respectively inherit the new look with zero page edits. `StatCard`, `ChartCard`, `StatusChip`, and `EmptyState` are new components adopted by later plans (dashboards, hostel/mess, page sweep). `Layout.tsx` and `navigation.tsx` are rewritten for a collapsible, grouped, animated sidebar. Two new staff roles (`hostel_warden`, `mess_manager`) and two new `StaffFeature`s (`hostel`, `mess`) are added to the permission system so later plans can gate the new modules.

**Tech Stack:** React 19, TypeScript 5.8 (strict), MUI v7 (`@mui/material`, `@mui/icons-material`), `motion` (Framer Motion, imported as `motion/react`), Recharts 2.15, Vite 6, React Router 7.

## Global Constraints

- No new npm dependencies — MUI, `motion`, and Recharts already cover every requirement here.
- Palette (from spec §1): light background `#FAFAFA`, light surface `#FFFFFF`, light text `#111111`/`#666666`; dark background `#0A0A0A`, dark surface `#1A1A1A`, dark text `#F5F5F4`/`#9A9A97`; sidebar fixed `#0A0A0A` in both modes.
- Status colors (fixed, never themed): good `#0ca30c`, warning `#fab219`, serious `#ec835a`, critical `#d03b3b`.
- Chart categorical palette (fixed order, never cycled) — light: `#2a78d6, #1baf7a, #eda100, #008300, #4a3aa7, #e34948, #e87ba4, #eb6834`; dark: `#3987e5, #199e70, #c98500, #008300, #9085e9, #e66767, #d55181, #d95926`.
- Motion easing `cubic-bezier(0.25, 0.46, 0.45, 0.94)`, duration `0.2s`, used everywhere for consistency.
- Radii: 12px cards/panels, 8px buttons/inputs/controls, pill (9999px) chips/badges.
- `@/*` resolves to `src/*` (see `tsconfig.json` / `vite.config.ts`) — do not use relative `../../` imports across top-level folders.
- TypeScript is `strict`, with `noUnusedLocals` and `noUnusedParameters` — every import and parameter must be used.
- No test framework exists in this repo. The verification loop per task is: `npm run build` (runs `tsc -b && vite build`) succeeds with zero errors, `npm run lint` succeeds with zero errors, and (for UI-visible tasks) a manual check via `npm run dev`.

---

## Task 1: Color, motion, and radius tokens

**Files:**
- Create: `src/theme/tokens.ts`

**Interfaces:**
- Produces: `modeTokens: { light: ModeTokens; dark: ModeTokens }`, `sidebarTokens: SidebarTokens`, `statusTokens: { good: string; warning: string; serious: string; critical: string }`, `motionEasing: [number, number, number, number]`, `motionEasingCss: string`, `motionDuration: number`, `radii: { card: number; control: number; pill: number }` — all consumed by Task 2 (`src/theme/index.ts`) and Task 6 (`ChartCard`).

- [ ] **Step 1: Create the tokens file**

```ts
// src/theme/tokens.ts

export interface ModeTokens {
  background: string;
  paper: string;
  textPrimary: string;
  textSecondary: string;
  divider: string;
  hoverOverlay: string;
  selectedOverlay: string;
}

export const modeTokens: Record<"light" | "dark", ModeTokens> = {
  light: {
    background: "#FAFAFA",
    paper: "#FFFFFF",
    textPrimary: "#111111",
    textSecondary: "#666666",
    divider: "rgba(0,0,0,0.08)",
    hoverOverlay: "rgba(0,0,0,0.04)",
    selectedOverlay: "rgba(0,0,0,0.06)",
  },
  dark: {
    background: "#0A0A0A",
    paper: "#1A1A1A",
    textPrimary: "#F5F5F4",
    textSecondary: "#9A9A97",
    divider: "rgba(255,255,255,0.08)",
    hoverOverlay: "rgba(255,255,255,0.06)",
    selectedOverlay: "rgba(255,255,255,0.09)",
  },
};

export interface SidebarTokens {
  background: string;
  text: string;
  muted: string;
  activeBackground: string;
  activeText: string;
  hoverBackground: string;
  divider: string;
}

export const sidebarTokens: SidebarTokens = {
  background: "#0A0A0A",
  text: "#F5F5F4",
  muted: "#8A8A87",
  activeBackground: "#F5F5F4",
  activeText: "#0A0A0A",
  hoverBackground: "rgba(255,255,255,0.06)",
  divider: "rgba(255,255,255,0.08)",
};

export const statusTokens = {
  good: "#0ca30c",
  warning: "#fab219",
  serious: "#ec835a",
  critical: "#d03b3b",
} as const;

export const motionEasing: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];
export const motionEasingCss = "cubic-bezier(0.25, 0.46, 0.45, 0.94)";
export const motionDuration = 0.2;

export const radii = {
  card: 12,
  control: 8,
  pill: 9999,
} as const;
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run build`
Expected: succeeds (this file has no consumers yet, so it just needs to type-check standalone — `tsc -b` will confirm no syntax errors).

- [ ] **Step 3: Commit**

```bash
git add src/theme/tokens.ts
git commit -m "feat: add design system color, motion, and radius tokens"
```

---

## Task 2: Chart color palette

**Files:**
- Create: `src/theme/chartPalette.ts`

**Interfaces:**
- Consumes: `statusTokens` from `src/theme/tokens.ts` (Task 1).
- Produces: `getChartPalette(mode: "light" | "dark"): ChartPalette` where `ChartPalette = { categorical: string[]; status: typeof statusTokens; sequential: Record<number, string>; surface: string; grid: string; axis: string; baseline: string }` — consumed by Task 6 (`ChartCard`) and every dashboard chart in later plans.

- [ ] **Step 1: Create the chart palette file**

```ts
// src/theme/chartPalette.ts
import { statusTokens } from "./tokens";

const categoricalLight = [
  "#2a78d6", // blue
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#008300", // green
  "#4a3aa7", // violet
  "#e34948", // red
  "#e87ba4", // magenta
  "#eb6834", // orange
];

const categoricalDark = [
  "#3987e5", // blue
  "#199e70", // aqua
  "#c98500", // yellow
  "#008300", // green
  "#9085e9", // violet
  "#e66767", // red
  "#d55181", // magenta
  "#d95926", // orange
];

// Single-hue sequential ramp (blue), light -> dark, for magnitude encodings
// (heatmaps, choropleth-style fills). Steps named to match the dataviz
// reference palette exactly.
const sequentialBlue: Record<number, string> = {
  100: "#cde2fb", 150: "#b7d3f6", 200: "#9ec5f4", 250: "#86b6ef",
  300: "#6da7ec", 350: "#5598e7", 400: "#3987e5", 450: "#2a78d6",
  500: "#256abf", 550: "#1c5cab", 600: "#184f95", 650: "#104281", 700: "#0d366b",
};

export interface ChartPalette {
  categorical: string[];
  status: typeof statusTokens;
  sequential: Record<number, string>;
  surface: string;
  grid: string;
  axis: string;
  baseline: string;
}

export function getChartPalette(mode: "light" | "dark"): ChartPalette {
  return {
    categorical: mode === "light" ? categoricalLight : categoricalDark,
    status: statusTokens,
    sequential: sequentialBlue,
    surface: mode === "light" ? "#FAFAFA" : "#0A0A0A",
    grid: mode === "light" ? "#e1e0d9" : "#2c2c2a",
    axis: "#898781",
    baseline: mode === "light" ? "#c3c2b7" : "#383835",
  };
}
```

- [ ] **Step 2: Verify the palette against the app's exact surfaces**

Run (from the dataviz skill's base directory, printed at the top of that skill's instructions in this session):

```bash
node scripts/validate_palette.js "#2a78d6,#1baf7a,#eda100,#008300,#4a3aa7,#e34948,#e87ba4,#eb6834" --mode light --surface "#FAFAFA"
node scripts/validate_palette.js "#3987e5,#199e70,#c98500,#008300,#9085e9,#e66767,#d55181,#d95926" --mode dark --surface "#0A0A0A"
```

Expected: both print `ALL CHECKS PASS` (WARN-level CVD/contrast notes on specific slots are expected and already accounted for — later chart tasks must ship legends/direct labels, never color-alone identification, per the dataviz skill).

- [ ] **Step 3: Commit**

```bash
git add src/theme/chartPalette.ts
git commit -m "feat: add validated chart color palette"
```

---

## Task 3: Rewrite the MUI theme

**Files:**
- Create: `src/theme/index.ts`
- Delete: `src/theme.ts`

**Interfaces:**
- Consumes: `modeTokens`, `sidebarTokens`, `statusTokens`, `motionEasingCss`, `radii` from `src/theme/tokens.ts` (Task 1).
- Produces: `getTheme(mode: "light" | "dark"): Theme`, default export — same signature as the file it replaces, so `src/providers/ThemeProvider.tsx` (which does `import getTheme from "@/theme"`) needs **no changes**: `@/theme` resolves to `src/theme/index.ts` once `src/theme.ts` no longer exists.

- [ ] **Step 1: Delete the old flat theme file**

```bash
git rm src/theme.ts
```

- [ ] **Step 2: Create the new theme module**

```ts
// src/theme/index.ts
import { createTheme } from "@mui/material/styles";
import { modeTokens, sidebarTokens, statusTokens, motionEasingCss, radii } from "./tokens";

const FONT_STACK = '"Inter", "SF Pro Display", -apple-system, "Segoe UI", Arial, sans-serif';

const getTheme = (mode: "light" | "dark") => {
  const t = modeTokens[mode];

  return createTheme({
    palette: {
      mode,
      primary: {
        main: mode === "light" ? "#111111" : "#F5F5F4",
        contrastText: mode === "light" ? "#FFFFFF" : "#0A0A0A",
      },
      secondary: {
        main: t.textSecondary,
      },
      success: { main: statusTokens.good },
      warning: { main: statusTokens.warning },
      error: { main: statusTokens.critical },
      info: { main: "#2a78d6" },
      background: {
        default: t.background,
        paper: t.paper,
      },
      text: {
        primary: t.textPrimary,
        secondary: t.textSecondary,
      },
      divider: t.divider,
      action: {
        hover: t.hoverOverlay,
        selected: t.selectedOverlay,
      },
    },
    typography: {
      fontFamily: FONT_STACK,
      h1: { fontWeight: 700, letterSpacing: "-0.02em" },
      h2: { fontWeight: 700, letterSpacing: "-0.02em" },
      h3: { fontWeight: 700, letterSpacing: "-0.02em" },
      h4: { fontWeight: 700, letterSpacing: "-0.02em" },
      h5: { fontWeight: 600, letterSpacing: "-0.01em" },
      h6: { fontWeight: 600, letterSpacing: "-0.01em" },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600 },
      overline: { fontWeight: 600, letterSpacing: "0.08em" },
    },
    shape: {
      borderRadius: radii.card,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            fontVariantNumeric: "tabular-nums",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
            borderRadius: radii.control,
            transition: `all ${motionEasingCss}`,
            boxShadow: "none",
          },
          containedPrimary: {
            "&:hover": { boxShadow: "none" },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            borderRadius: radii.card,
          },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            border: `1px solid ${t.divider}`,
            borderRadius: radii.card,
            boxShadow:
              mode === "light"
                ? "0 1px 2px rgba(0,0,0,0.04)"
                : "0 1px 2px rgba(0,0,0,0.24)",
            transition: `box-shadow ${motionEasingCss}, transform ${motionEasingCss}`,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: radii.pill,
            fontWeight: 600,
          },
        },
      },
      MuiTextField: {
        defaultProps: { size: "small" },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: radii.control,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: t.paper,
            color: t.textPrimary,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: "none",
            backgroundColor: sidebarTokens.background,
            color: sidebarTokens.text,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: t.divider,
          },
          head: {
            fontWeight: 600,
            color: t.textSecondary,
            textTransform: "uppercase",
            fontSize: "0.7rem",
            letterSpacing: "0.05em",
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: mode === "light" ? "#111111" : "#F5F5F4",
            color: mode === "light" ? "#FFFFFF" : "#0A0A0A",
            fontSize: "0.75rem",
            borderRadius: radii.control,
          },
        },
      },
    },
  });
};

export default getTheme;
```

- [ ] **Step 3: Verify the build**

Run: `npm run build`
Expected: succeeds with zero TypeScript errors. If `ThemeProvider.tsx`'s `import getTheme from "@/theme"` fails to resolve, confirm `src/theme.ts` was actually removed (`git status` should show it deleted, not just modified).

- [ ] **Step 4: Manual visual check**

Run: `npm run dev`, open the app, log in to any portal. Expected: off-white (`#FAFAFA`) background, white cards with hairline borders, no default MUI indigo/amber anywhere, dark sidebar. Toggle dark mode (moon/sun icon in topbar) — background becomes `#0A0A0A`, cards `#1A1A1A`, text off-white.

- [ ] **Step 5: Commit**

```bash
git add src/theme/index.ts
git commit -m "feat: rewrite MUI theme for monochrome premium design system"
```

---

## Task 4: `EmptyState` component

**Files:**
- Create: `src/components/EmptyState.tsx`

**Interfaces:**
- Produces: `EmptyState({ icon?: ReactNode; title: string; description?: string; action?: ReactNode })` — a default export, consumed by Task 7 (`DataTable` v2) and later plans.

- [ ] **Step 1: Create the component**

```tsx
// src/components/EmptyState.tsx
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import { type ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        py: 6,
        px: 2,
        color: "text.secondary",
      }}
    >
      <Box sx={{ fontSize: 40, mb: 1.5, display: "flex", color: "text.disabled" }}>
        {icon ?? <InboxOutlinedIcon fontSize="inherit" />}
      </Box>
      <Typography variant="subtitle1" fontWeight={600} color="text.primary">
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 360 }}>
          {description}
        </Typography>
      )}
      {action && <Box sx={{ mt: 2 }}>{action}</Box>}
    </Box>
  );
}
```

- [ ] **Step 2: Verify the build**

Run: `npm run build`
Expected: succeeds (unused component compiles standalone).

- [ ] **Step 3: Commit**

```bash
git add src/components/EmptyState.tsx
git commit -m "feat: add EmptyState component"
```

---

## Task 5: `StatusChip` component

**Files:**
- Create: `src/components/StatusChip.tsx`

**Interfaces:**
- Consumes: `statusTokens` from `src/theme/tokens.ts` (Task 1).
- Produces: `StatusChip({ status: string; size?: "small" | "medium" })` — a default export. Maps every status string used across the app's types (`FeeStatus`, `AttendanceStatus`, `LibraryRecordStatus`, `TaskStatus`, `StudentRequestStatus`, plus hostel/mess statuses added in later plans) to a consistent icon + label + color. Unknown strings fall back to a neutral gray chip with the raw text, so this component is safe to use everywhere without a mapping error.

- [ ] **Step 1: Create the component**

```tsx
// src/components/StatusChip.tsx
import Chip from "@mui/material/Chip";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ScheduleIcon from "@mui/icons-material/Schedule";
import ErrorIcon from "@mui/icons-material/Error";
import CancelIcon from "@mui/icons-material/Cancel";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import { statusTokens } from "@/theme/tokens";
import type { SvgIconComponent } from "@mui/icons-material";

interface StatusMeta {
  label: string;
  color: string;
  icon: SvgIconComponent;
}

const STATUS_MAP: Record<string, StatusMeta> = {
  // Fees
  paid: { label: "Paid", color: statusTokens.good, icon: CheckCircleIcon },
  pending: { label: "Pending", color: statusTokens.warning, icon: ScheduleIcon },
  overdue: { label: "Overdue", color: statusTokens.critical, icon: ErrorIcon },
  // Attendance
  present: { label: "Present", color: statusTokens.good, icon: CheckCircleIcon },
  absent: { label: "Absent", color: statusTokens.critical, icon: CancelIcon },
  late: { label: "Late", color: statusTokens.warning, icon: HourglassTopIcon },
  // Library
  issued: { label: "Issued", color: statusTokens.warning, icon: ScheduleIcon },
  returned: { label: "Returned", color: statusTokens.good, icon: CheckCircleIcon },
  // Tasks / student requests
  in_progress: { label: "In Progress", color: statusTokens.warning, icon: HourglassTopIcon },
  completed: { label: "Completed", color: statusTokens.good, icon: CheckCircleIcon },
  rejected: { label: "Rejected", color: statusTokens.critical, icon: CancelIcon },
  approved: { label: "Approved", color: statusTokens.good, icon: CheckCircleIcon },
  fulfilled: { label: "Fulfilled", color: statusTokens.good, icon: CheckCircleIcon },
  active: { label: "Active", color: statusTokens.good, icon: CheckCircleIcon },
  inactive: { label: "Inactive", color: statusTokens.serious, icon: CancelIcon },
};

interface StatusChipProps {
  status: string;
  size?: "small" | "medium";
}

export default function StatusChip({ status, size = "small" }: StatusChipProps) {
  const meta = STATUS_MAP[status] ?? {
    label: status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    color: "#898781",
    icon: ScheduleIcon,
  };
  const Icon = meta.icon;

  return (
    <Chip
      size={size}
      icon={<Icon style={{ color: meta.color, fontSize: 16 }} />}
      label={meta.label}
      sx={{
        bgcolor: `${meta.color}1a`, // ~10% alpha
        color: meta.color,
        border: "1px solid",
        borderColor: `${meta.color}33`, // ~20% alpha
        "& .MuiChip-icon": { color: meta.color },
      }}
    />
  );
}
```

- [ ] **Step 2: Verify the build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/StatusChip.tsx
git commit -m "feat: add StatusChip component for consistent status rendering"
```

---

## Task 6: `StatCard` component (animated stat tile)

**Files:**
- Create: `src/components/StatCard.tsx`

**Interfaces:**
- Consumes: `motionEasing`, `motionDuration` from `src/theme/tokens.ts` (Task 1).
- Produces: `StatCard({ title, value, icon, color?, numericValue?, formatValue?, trend?, delay?, onClick? })` — a **named** export `StatCard`, matching `KpiCard`'s existing prop shape (`title`, `value`, `icon`, `color`, `delay`, `onClick`) plus new optional `numericValue`, `formatValue`, `trend` props. Consumed by Plan "Dashboards & New Modules" (not this plan) when the 8 existing `KpiCard` usages are migrated — `KpiCard.tsx` itself is untouched by this plan so nothing breaks in the meantime.

- [ ] **Step 1: Create the component**

```tsx
// src/components/StatCard.tsx
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { type ReactNode, useEffect, useState } from "react";
import { motion, animate } from "motion/react";
import { useTheme, alpha } from "@mui/material/styles";
import { motionEasing, motionDuration } from "@/theme/tokens";
import { statusTokens } from "@/theme/tokens";

interface TrendInfo {
  value: number; // e.g. 4.2 for "4.2%"
  direction: "up" | "down";
  label?: string; // e.g. "vs last month"
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: string;
  numericValue?: number;
  formatValue?: (n: number) => string;
  trend?: TrendInfo;
  delay?: number;
  onClick?: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveColor(theme: any, color: string): string {
  if (color.startsWith("#") || color.startsWith("rgb")) return color;
  const parts = color.split(".");
  let result: unknown = theme.palette;
  for (const p of parts) result = (result as Record<string, unknown>)?.[p];
  return typeof result === "string" ? result : color;
}

function useCountUp(target: number | undefined, duration: number) {
  const [display, setDisplay] = useState(target ?? 0);
  useEffect(() => {
    if (target === undefined) return;
    const controls = animate(0, target, {
      duration,
      ease: motionEasing,
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [target, duration]);
  return display;
}

export function StatCard({
  title,
  value,
  icon,
  color = "text.primary",
  numericValue,
  formatValue,
  trend,
  delay = 0,
  onClick,
}: StatCardProps) {
  const theme = useTheme();
  const resolved = resolveColor(theme, color);
  const animatedValue = useCountUp(numericValue, 0.9);

  const displayValue =
    numericValue !== undefined
      ? formatValue
        ? formatValue(Math.round(animatedValue))
        : Math.round(animatedValue).toLocaleString("en-IN")
      : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: motionDuration * 2, ease: motionEasing }}
      whileHover={onClick ? { y: -3 } : undefined}
      style={{ cursor: onClick ? "pointer" : "default", height: "100%" }}
      onClick={onClick}
    >
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          height: "100%",
          "&:hover": onClick
            ? { boxShadow: (t) => (t.palette.mode === "light" ? "0 8px 24px rgba(0,0,0,0.08)" : "0 8px 24px rgba(0,0,0,0.4)") }
            : {},
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box
            sx={{
              bgcolor: alpha(resolved, 0.1),
              color: resolved,
              p: 1.25,
              borderRadius: 2,
              display: "flex",
            }}
          >
            {icon}
          </Box>
          {trend && (
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.25}
              sx={{ color: trend.direction === "up" ? statusTokens.good : statusTokens.critical }}
            >
              {trend.direction === "up" ? (
                <ArrowUpwardIcon sx={{ fontSize: 14 }} />
              ) : (
                <ArrowDownwardIcon sx={{ fontSize: 14 }} />
              )}
              <Typography variant="caption" fontWeight={700}>
                {trend.value}%
              </Typography>
            </Stack>
          )}
        </Stack>
        <Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h5" fontWeight={700} sx={{ fontVariantNumeric: "tabular-nums" }}>
            {displayValue}
          </Typography>
          {trend?.label && (
            <Typography variant="caption" color="text.secondary">
              {trend.label}
            </Typography>
          )}
        </Box>
      </Paper>
    </motion.div>
  );
}
```

- [ ] **Step 2: Verify the build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/StatCard.tsx
git commit -m "feat: add StatCard component with animated count-up and trend indicator"
```

---

## Task 7: `ChartCard` component

**Files:**
- Create: `src/components/ChartCard.tsx`

**Interfaces:**
- Consumes: `motionEasing`, `motionDuration` from `src/theme/tokens.ts` (Task 1).
- Produces: `ChartCard({ eyebrow?, title, subtitle?, action?, height?, children })` — a **named** export `ChartCard`, consumed by every Recharts usage in the "Dashboards & New Modules" plan.

- [ ] **Step 1: Create the component**

```tsx
// src/components/ChartCard.tsx
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { type ReactNode } from "react";
import { motion } from "motion/react";
import { motionEasing, motionDuration } from "@/theme/tokens";

interface ChartCardProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  height?: number;
  delay?: number;
  children: ReactNode;
}

export function ChartCard({ eyebrow, title, subtitle, action, height = 320, delay = 0, children }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: motionDuration * 2, ease: motionEasing }}
      style={{ height: "100%" }}
    >
      <Paper elevation={0} sx={{ p: 2.5, height: "100%", display: "flex", flexDirection: "column" }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 1.5 }}>
          <Box>
            {eyebrow && (
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ fontSize: "0.65rem", display: "block", lineHeight: 1.6 }}
              >
                {eyebrow}
              </Typography>
            )}
            <Typography variant="subtitle1" fontWeight={600}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          {action}
        </Stack>
        <Box sx={{ flex: 1, minHeight: height, width: "100%" }}>{children}</Box>
      </Paper>
    </motion.div>
  );
}
```

- [ ] **Step 2: Verify the build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/ChartCard.tsx
git commit -m "feat: add ChartCard component for consistent chart presentation"
```

---

## Task 8: Upgrade `DataTable` in place

**Files:**
- Modify: `src/components/DataTable.tsx` (full rewrite, same exported name `DataTable`)

**Interfaces:**
- Consumes: `EmptyState` (Task 4).
- Produces: `DataTable<T>({ columns, rows, onRowClick?, title?, dense?, pagination?, pageSize?, emptyTitle?, emptyDescription? })` — the existing required props (`columns`, `rows`, `onRowClick`, `title`) keep identical names and types, so **all 64 existing call sites continue to work unmodified**. New props are optional with backward-compatible defaults (`dense=false`, `pagination=false`).

- [ ] **Step 1: Replace the file**

```tsx
// src/components/DataTable.tsx
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { type ReactNode, useState } from "react";
import EmptyState from "@/components/EmptyState";

interface Column<T> {
  key: string;
  label: string;
  render?: (row: T, index: number) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  title?: string;
  dense?: boolean;
  pagination?: boolean;
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function DataTable<T extends object>({
  columns,
  rows,
  onRowClick,
  title,
  dense = false,
  pagination = false,
  pageSize = 10,
  emptyTitle = "No data found",
  emptyDescription,
}: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);

  const visibleRows = pagination
    ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : rows;

  return (
    <Paper elevation={0} sx={{ border: 1, borderColor: "divider", overflow: "hidden" }}>
      {title && (
        <Typography variant="subtitle1" fontWeight={600} sx={{ p: 2, pb: 0 }}>
          {title}
        </Typography>
      )}
      <TableContainer>
        <Table size={dense ? "small" : "medium"} stickyHeader={pagination}>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.key}>{col.label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRows.map((row, i) => (
              <TableRow
                key={i}
                hover
                sx={{ cursor: onRowClick ? "pointer" : "default" }}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    {col.render
                      ? col.render(row, i)
                      : ((row as Record<string, ReactNode>)[col.key] ?? null)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} sx={{ border: 0 }}>
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {pagination && rows.length > 0 && (
        <TablePagination
          component="div"
          count={rows.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50]}
        />
      )}
    </Paper>
  );
}
```

- [ ] **Step 2: Verify the build**

Run: `npm run build`
Expected: succeeds with zero errors across all 64 files that import `DataTable` (the prop signature is backward-compatible, so no other files need edits).

- [ ] **Step 3: Manual visual check**

Run: `npm run dev`, navigate to a page using `DataTable` (e.g. `/admin/students`). Expected: table renders as before but with new theme colors (hairline borders, uppercase muted header per Task 3's `MuiTableCell` override); an empty list (e.g. filter to zero results if the page supports it) shows the new `EmptyState` treatment instead of the old "No data found" text.

- [ ] **Step 4: Commit**

```bash
git add src/components/DataTable.tsx
git commit -m "feat: upgrade DataTable with density, pagination, and EmptyState support"
```

---

## Task 9: Upgrade `PageHeader` in place

**Files:**
- Modify: `src/components/PageHeader.tsx` (full rewrite, same exported name `PageHeader`)

**Interfaces:**
- Produces: `PageHeader({ title, breadcrumbs?, action?, eyebrow?, summary? })` — existing props (`title`, `breadcrumbs`, `action`) keep identical names/types, so **all 111 existing call sites continue to work unmodified**. New optional props: `eyebrow` (small uppercase label above the title) and `summary` (a `ReactNode` rendered next to the title, e.g. a trend chip).

- [ ] **Step 1: Replace the file**

```tsx
// src/components/PageHeader.tsx
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import MuiLink from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import { Link } from "react-router-dom";
import { type ReactNode } from "react";

interface Crumb {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  title: string;
  breadcrumbs?: Crumb[];
  action?: ReactNode;
  eyebrow?: string;
  summary?: ReactNode;
}

export function PageHeader({ title, breadcrumbs, action, eyebrow, summary }: PageHeaderProps) {
  return (
    <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 1 }}>
      <Box>
        {breadcrumbs && (
          <Breadcrumbs sx={{ mb: 0.5 }}>
            {breadcrumbs.map((b, i) =>
              b.to ? (
                <MuiLink
                  key={i}
                  component={Link}
                  to={b.to}
                  underline="hover"
                  color="inherit"
                  fontSize={14}
                >
                  {b.label}
                </MuiLink>
              ) : (
                <Typography key={i} fontSize={14} color="text.primary">
                  {b.label}
                </Typography>
              )
            )}
          </Breadcrumbs>
        )}
        {eyebrow && (
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ fontSize: "0.7rem", display: "block", lineHeight: 1.8 }}
          >
            {eyebrow}
          </Typography>
        )}
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Typography variant="h4" fontWeight={700}>
            {title}
          </Typography>
          {summary}
        </Stack>
      </Box>
      {action && <Box>{action}</Box>}
    </Box>
  );
}
```

- [ ] **Step 2: Verify the build**

Run: `npm run build`
Expected: succeeds with zero errors across all 111 files that import `PageHeader`.

- [ ] **Step 3: Manual visual check**

Run: `npm run dev`, open any page. Expected: identical layout to before (since `eyebrow`/`summary` are unset on existing pages), but with the new typography (tighter heading tracking).

- [ ] **Step 4: Commit**

```bash
git add src/components/PageHeader.tsx
git commit -m "feat: upgrade PageHeader with optional eyebrow and summary slots"
```

---

## Task 10: New staff roles and permissions (Hostel, Mess)

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/data/staffPermissions.ts`

**Interfaces:**
- Produces: `StaffRole` gains `"hostel_warden" | "mess_manager"`; `StaffFeature` gains `"hostel" | "mess"`; `staffPermissions` map gains entries for both new roles and both new features across all existing roles. Consumed by the "Demo Data Restructuring" and "Dashboards & New Modules" plans (staff dashboard widgets, `StaffFeatureGuard` usage on new hostel/mess routes) and by Task 11/12 of this plan (nav grouping, staff role switcher).

- [ ] **Step 1: Extend the type definitions**

In `src/types/index.ts`, change line 5:

```ts
export type StaffRole = "accountant" | "transport_manager" | "library_staff" | "office_staff";
```

to:

```ts
export type StaffRole = "accountant" | "transport_manager" | "library_staff" | "office_staff" | "hostel_warden" | "mess_manager";
```

And change line 303:

```ts
export type StaffFeature = "fees" | "transport" | "library" | "student_lookup" | "student_requests" | "communication" | "reports";
```

to:

```ts
export type StaffFeature = "fees" | "transport" | "library" | "student_lookup" | "student_requests" | "communication" | "reports" | "hostel" | "mess";
```

- [ ] **Step 2: Verify the build fails with the expected error**

Run: `npm run build`
Expected: **FAILS** — `src/data/staffPermissions.ts` now has an incomplete `StaffPermissionMap` (missing the two new roles as keys, and missing `hostel`/`mess` as feature keys on the four existing roles). This confirms the type change is wired correctly before we fix it in the next step.

- [ ] **Step 3: Update the permission map**

Replace the full contents of `src/data/staffPermissions.ts`:

```ts
import type { StaffFeature, StaffPermissionMap, StaffRole } from "@/types";

export const staffPermissions: StaffPermissionMap = {
  accountant: {
    fees: "manage",
    transport: "none",
    library: "none",
    student_lookup: "manage",
    student_requests: "view",
    communication: "manage",
    reports: "manage",
    hostel: "view",
    mess: "view",
  },
  transport_manager: {
    fees: "none",
    transport: "manage",
    library: "none",
    student_lookup: "manage",
    student_requests: "view",
    communication: "manage",
    reports: "manage",
    hostel: "none",
    mess: "none",
  },
  library_staff: {
    fees: "none",
    transport: "none",
    library: "manage",
    student_lookup: "manage",
    student_requests: "view",
    communication: "manage",
    reports: "manage",
    hostel: "none",
    mess: "none",
  },
  office_staff: {
    fees: "view",
    transport: "none",
    library: "none",
    student_lookup: "manage",
    student_requests: "manage",
    communication: "manage",
    reports: "view",
    hostel: "view",
    mess: "view",
  },
  hostel_warden: {
    fees: "none",
    transport: "none",
    library: "none",
    student_lookup: "manage",
    student_requests: "view",
    communication: "manage",
    reports: "view",
    hostel: "manage",
    mess: "none",
  },
  mess_manager: {
    fees: "none",
    transport: "none",
    library: "none",
    student_lookup: "view",
    student_requests: "none",
    communication: "manage",
    reports: "view",
    hostel: "none",
    mess: "manage",
  },
};

export function getStaffPermission(staffRole: StaffRole, feature: StaffFeature) {
  return staffPermissions[staffRole][feature];
}

export function canViewFeature(staffRole: StaffRole, feature: StaffFeature) {
  return getStaffPermission(staffRole, feature) !== "none";
}

export function canManageFeature(staffRole: StaffRole, feature: StaffFeature) {
  return getStaffPermission(staffRole, feature) === "manage";
}
```

- [ ] **Step 4: Verify the build passes**

Run: `npm run build`
Expected: succeeds with zero errors.

- [ ] **Step 5: Add the two new roles to the staff role switcher**

Read `src/components/StaffRoleSwitcher.tsx` first to see its exact current structure (it renders a menu of `StaffRole` values with labels), then add `hostel_warden` → "Hostel Warden" and `mess_manager` → "Mess Manager" to its role list/label map following the exact same pattern used for the four existing roles in that file.

- [ ] **Step 6: Manual check**

Run: `npm run dev`, log in as staff, use the staff role switcher. Expected: "Hostel Warden" and "Mess Manager" appear as selectable roles alongside the existing four.

- [ ] **Step 7: Commit**

```bash
git add src/types/index.ts src/data/staffPermissions.ts src/components/StaffRoleSwitcher.tsx
git commit -m "feat: add hostel_warden and mess_manager staff roles with permissions"
```

---

## Task 11: Grouped, Hostel/Mess-aware navigation

**Files:**
- Modify: `src/components/navigation.tsx` (full rewrite)

**Interfaces:**
- Consumes: `canViewFeature` from `src/data/staffPermissions.ts` (existing + Task 10's new features), `Role`/`TeacherType`/`StaffRole` from `src/types` (Task 10).
- Produces: `NavItem` gains an optional `group?: string` field; `getNavItems(role, teacherType?, staffRole?): NavItem[]` keeps its exact existing signature (consumed by `Layout.tsx`, unmodified call site). Admin and staff nav items are annotated with `group` for Task 12's grouped rendering. Hostel and Mess entries are added to admin, staff (conditionally), parent, and student nav lists.

- [ ] **Step 1: Add the `group` field and Hostel/Mess entries**

Read the full current `src/components/navigation.tsx` (already captured above in this session — 308 lines) and rewrite it as follows: add `group?: string;` to the `NavItem` interface; add a `group` value to every admin top-level item (`"Academics"` for Dashboard/Students/Teachers/Academics/Attendance/Homework/Examinations, `"Operations"` for Transport/Hostel/Mess, `"Finance"` for Fees, `"Engagement"` for Communication, `"Administration"` for School Staff/Reports/Settings); add matching `group` values to the staff nav (`"Operations"` for Transport/Hostel/Mess/Library, `"Finance"` for Fees, `"Administration"` for the rest); insert two new admin entries after the Transport block (after line 108's closing `},`):

```ts
{
  label: "Hostel", path: "/admin/hostel", icon: <HotelIcon />, group: "Operations",
  children: [
    { label: "Hostel Dashboard", path: "/admin/hostel" },
    { label: "Blocks & Rooms", path: "/admin/hostel/rooms" },
    { label: "Room Allocation", path: "/admin/hostel/allocation" },
    { label: "Hostel Fee Structure", path: "/admin/hostel/fees" },
  ],
},
{
  label: "Mess", path: "/admin/mess", icon: <RestaurantIcon />, group: "Operations",
  children: [
    { label: "Mess Dashboard", path: "/admin/mess" },
    { label: "Weekly Menu", path: "/admin/mess/menu" },
    { label: "Mess Plans", path: "/admin/mess/plans" },
    { label: "Mess Billing", path: "/admin/mess/billing" },
  ],
},
```

add the corresponding imports at the top of the file:

```ts
import HotelIcon from "@mui/icons-material/Hotel";
import RestaurantIcon from "@mui/icons-material/Restaurant";
```

insert into the staff nav (`case "staff"`, after the existing `library` feature block, before the `office_staff` certificates block):

```ts
if (staffRole && canViewFeature(staffRole, "hostel")) {
  base.push({
    label: "Hostel", path: "/staff/hostel/allocation", icon: <HotelIcon />, group: "Operations",
    children: [
      { label: "Room Allocation", path: "/staff/hostel/allocation" },
      { label: "Roster", path: "/staff/hostel/roster" },
    ],
  });
}

if (staffRole && canViewFeature(staffRole, "mess")) {
  base.push({
    label: "Mess", path: "/staff/mess/attendance", icon: <RestaurantIcon />, group: "Operations",
    children: [
      { label: "Daily Attendance", path: "/staff/mess/attendance" },
      { label: "Weekly Menu", path: "/staff/mess/menu" },
    ],
  });
}
```

add a single flat item to the `parent` nav array (after `"Transport"`, before `"Announcements"`):

```ts
{ label: "My Hostel", path: "/parent/hostel", icon: <HotelIcon /> },
{ label: "My Mess", path: "/parent/mess", icon: <RestaurantIcon /> },
```

and to the `student` nav array (after `"Transport"`):

```ts
{ label: "My Hostel", path: "/student/hostel", icon: <HotelIcon /> },
{ label: "My Mess", path: "/student/mess", icon: <RestaurantIcon /> },
```

- [ ] **Step 2: Verify the build**

Run: `npm run build`
Expected: succeeds with zero errors. (The new routes referenced by these paths don't exist yet — that's fine, React Router doesn't type-check path strings, and the pages are built in the "Hostel & Mess Modules" plan; clicking these links before then will 404 inside the router's `Outlet`, which is expected and acceptable mid-plan.)

- [ ] **Step 3: Commit**

```bash
git add src/components/navigation.tsx
git commit -m "feat: group nav items and add Hostel/Mess navigation entries"
```

---

## Task 12: Collapsible, animated sidebar and restyled topbar

**Files:**
- Modify: `src/components/Layout.tsx` (full rewrite)

**Interfaces:**
- Consumes: `getNavItems` (Task 11, with `group` field), `sidebarTokens`/`motionEasing`/`motionDuration` from `src/theme/tokens.ts` (Task 1).
- Produces: no exported interface change — `Layout` remains the default export used by `src/router.tsx` (unmodified call site). Sidebar collapse state persists to `localStorage` key `erp-sidebar-${role}`.

- [ ] **Step 1: Replace the file**

```tsx
// src/components/Layout.tsx
import { useState, useMemo, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  Avatar,
  Tooltip,
  InputBase,
  Badge,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LogoutIcon from "@mui/icons-material/Logout";
import { AnimatePresence, motion } from "motion/react";
import { useAuth } from "@/context/AuthContext";
import { useColorMode } from "@/context/ColorModeContext";
import TeacherTypeSwitcher from "@/components/TeacherTypeSwitcher";
import StaffRoleSwitcher from "@/components/StaffRoleSwitcher";
import { getNavItems, type NavItem } from "@/components/navigation";
import { getUnreadNotificationCount } from "@/data/notificationStore";
import { sidebarTokens, motionEasing, motionDuration } from "@/theme/tokens";

const DRAWER_WIDTH = 260;
const RAIL_WIDTH = 72;

export default function Layout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { role, teacherType, staffRole, user, logout } = useAuth();
  const { toggleColorMode, mode } = useColorMode();
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem(`erp-sidebar-${role}`) === "collapsed";
  });
  useEffect(() => {
    localStorage.setItem(`erp-sidebar-${role}`, collapsed ? "collapsed" : "expanded");
  }, [collapsed, role]);

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const navItems = useMemo(
    () => getNavItems(role, teacherType, staffRole),
    [role, teacherType, staffRole]
  );

  const groups = useMemo(() => {
    const order: string[] = [];
    const map = new Map<string, NavItem[]>();
    for (const item of navItems) {
      const g = item.group ?? "";
      if (!map.has(g)) {
        map.set(g, []);
        order.push(g);
      }
      map.get(g)!.push(item);
    }
    return order.map((g) => ({ group: g, items: map.get(g)! }));
  }, [navItems]);

  const [unreadNotifications, setUnreadNotifications] = useState(() => getUnreadNotificationCount());

  useEffect(() => {
    const onUpdate = () => setUnreadNotifications(getUnreadNotificationCount());
    window.addEventListener("erp-notifications-updated", onUpdate);
    return () => window.removeEventListener("erp-notifications-updated", onUpdate);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleSubmenu = (label: string) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleNav = (path: string) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  const isActive = (item: NavItem) => {
    if (item.children) {
      return item.children.some((c) => location.pathname === c.path);
    }
    return location.pathname === item.path;
  };

  const portalLabels: Record<string, string> = {
    admin: "Admin Portal",
    teacher: "Teacher Portal",
    staff: "Staff Portal",
    parent: "Parent Portal",
    student: "Student Portal",
  };

  const showRail = collapsed && !isMobile;

  const navButtonSx = (active: boolean) => ({
    mx: 1,
    borderRadius: 1.5,
    mb: 0.25,
    color: sidebarTokens.text,
    justifyContent: showRail ? "center" : "flex-start",
    px: showRail ? 1.5 : 2,
    transition: `background-color ${motionDuration}s ${sidebarTokens.background}`,
    "&:hover": { bgcolor: sidebarTokens.hoverBackground },
    ...(active && {
      bgcolor: sidebarTokens.activeBackground,
      color: sidebarTokens.activeText,
      "&:hover": { bgcolor: sidebarTokens.activeBackground },
      "& .MuiListItemIcon-root": { color: sidebarTokens.activeText },
    }),
  });

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: sidebarTokens.background }}>
      <Box
        sx={{
          p: showRail ? 1.5 : 2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderBottom: `1px solid ${sidebarTokens.divider}`,
          justifyContent: showRail ? "center" : "flex-start",
        }}
      >
        <Avatar sx={{ bgcolor: sidebarTokens.text, color: sidebarTokens.background, width: 36, height: 36, fontSize: 14, fontWeight: 700 }}>
          {user?.name.charAt(0) ?? "U"}
        </Avatar>
        {!showRail && (
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap sx={{ color: sidebarTokens.text }}>
              {user?.name ?? "User"}
            </Typography>
            <Typography variant="caption" noWrap sx={{ color: sidebarTokens.muted }}>
              {portalLabels[role]}
            </Typography>
          </Box>
        )}
      </Box>

      <List sx={{ flex: 1, overflow: "auto", py: 1 }} component="nav">
        {groups.map(({ group, items }) => (
          <Box key={group || "ungrouped"}>
            {group && !showRail && (
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  color: sidebarTokens.muted,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontSize: "0.65rem",
                  px: 2.5,
                  pt: 2,
                  pb: 0.5,
                }}
              >
                {group}
              </Typography>
            )}
            {items.map((item) => {
              const active = isActive(item);
              if (item.children) {
                const open = !showRail && (openMenus[item.label] ?? active);
                return (
                  <Box key={item.label}>
                    <ListItemButton
                      onClick={() => (showRail ? handleNav(item.path) : toggleSubmenu(item.label))}
                      sx={navButtonSx(active)}
                    >
                      <ListItemIcon sx={{ minWidth: showRail ? "auto" : 36, color: "inherit" }}>{item.icon}</ListItemIcon>
                      {!showRail && (
                        <>
                          <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14 }} />
                          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: motionDuration, ease: motionEasing }}>
                            <ExpandMoreIcon fontSize="small" />
                          </motion.div>
                        </>
                      )}
                    </ListItemButton>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: motionDuration, ease: motionEasing }}
                          style={{ overflow: "hidden" }}
                        >
                          <List disablePadding>
                            {item.children.map((child) => {
                              const childActive = location.pathname === child.path;
                              return (
                                <ListItemButton
                                  key={child.path}
                                  onClick={() => handleNav(child.path)}
                                  sx={{
                                    pl: 6.5,
                                    mx: 1,
                                    borderRadius: 1.5,
                                    mb: 0.25,
                                    color: sidebarTokens.muted,
                                    "&:hover": { bgcolor: sidebarTokens.hoverBackground },
                                    ...(childActive && {
                                      bgcolor: sidebarTokens.hoverBackground,
                                      color: sidebarTokens.text,
                                      fontWeight: 600,
                                    }),
                                  }}
                                >
                                  <ListItemText primary={child.label} primaryTypographyProps={{ fontSize: 13 }} />
                                </ListItemButton>
                              );
                            })}
                          </List>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Box>
                );
              }
              return (
                <Tooltip key={item.path} title={showRail ? item.label : ""} placement="right">
                  <ListItemButton onClick={() => handleNav(item.path)} sx={navButtonSx(active)}>
                    <ListItemIcon sx={{ minWidth: showRail ? "auto" : 36, color: "inherit" }}>{item.icon}</ListItemIcon>
                    {!showRail && <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14 }} />}
                  </ListItemButton>
                </Tooltip>
              );
            })}
          </Box>
        ))}
      </List>

      {!isMobile && (
        <Box sx={{ borderTop: `1px solid ${sidebarTokens.divider}`, p: 1 }}>
          <IconButton
            onClick={() => setCollapsed((c) => !c)}
            sx={{ color: sidebarTokens.muted, width: "100%", borderRadius: 1.5, "&:hover": { bgcolor: sidebarTokens.hoverBackground } }}
          >
            {showRail ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Box>
      )}
    </Box>
  );

  const currentWidth = showRail ? RAIL_WIDTH : DRAWER_WIDTH;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          bgcolor: "background.paper",
          color: "text.primary",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" fontWeight={700} sx={{ mr: 2, letterSpacing: "-0.02em" }} noWrap>
            KALNET
          </Typography>

          {(role === "admin" || role === "staff") && (
            <Box
              sx={{
                display: { xs: "none", sm: "flex" },
                alignItems: "center",
                bgcolor: "action.hover",
                borderRadius: 2,
                px: 1.5,
                py: 0.5,
                mr: "auto",
                maxWidth: 320,
                flex: 1,
              }}
            >
              <SearchIcon fontSize="small" sx={{ mr: 0.5, color: "text.secondary" }} />
              <InputBase placeholder="Search students, teachers…" sx={{ flex: 1, fontSize: 14 }} />
            </Box>
          )}

          <Box sx={{ flex: 1 }} />
          {role === "teacher" && <TeacherTypeSwitcher />}
          {role === "staff" && <StaffRoleSwitcher />}
          <Tooltip title="Sign Out">
            <IconButton onClick={handleLogout} sx={{ ml: 0.5 }}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Toggle theme">
            <IconButton onClick={toggleColorMode} sx={{ ml: 0.5 }}>
              {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Notifications">
            <IconButton onClick={() => navigate(`/${role}/notifications`)} sx={{ ml: 0.5 }}>
              <Badge badgeContent={unreadNotifications} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{ "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" } }}
          ModalProps={{ keepMounted: true }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: currentWidth,
            flexShrink: 0,
            transition: `width ${motionDuration}s ${theme.transitions.easing.easeInOut}`,
            "& .MuiDrawer-paper": {
              width: currentWidth,
              boxSizing: "border-box",
              borderRight: "none",
              mt: "64px",
              height: "calc(100% - 64px)",
              transition: `width ${motionDuration}s ${theme.transitions.easing.easeInOut}`,
              overflowX: "hidden",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: "64px",
          ml: { md: `${currentWidth}px` },
          transition: `margin-left ${motionDuration}s ${theme.transitions.easing.easeInOut}`,
          bgcolor: "background.default",
          minHeight: "calc(100vh - 64px)",
          overflow: "auto",
        }}
      >
        <Box sx={{ maxWidth: 1600, mx: "auto" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
```

- [ ] **Step 2: Verify the build**

Run: `npm run build`
Expected: succeeds with zero errors.

- [ ] **Step 3: Manual visual check**

Run: `npm run dev`. Expected: dark (`#0A0A0A`) sidebar in both light and dark app mode; grouped section labels ("ACADEMICS", "OPERATIONS", etc.) above admin/staff nav items; clicking the chevron at the sidebar's bottom collapses it to a 72px icon-only rail with tooltips on hover; the collapse state survives a page reload (persisted via `localStorage`); expanding/collapsing a nested nav section (e.g. "Students") animates height smoothly instead of snapping instantly; content area has a max-width so it doesn't stretch edge-to-edge on a wide monitor.

- [ ] **Step 4: Commit**

```bash
git add src/components/Layout.tsx
git commit -m "feat: collapsible animated sidebar with grouped navigation"
```

---

## Task 13: Full-app verification pass

**Files:** none (verification only)

- [ ] **Step 1: Full build**

Run: `npm run build`
Expected: `tsc -b` and `vite build` both succeed with zero errors.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: zero errors (warnings, if any pre-existed, are unrelated to this plan's changes).

- [ ] **Step 3: Manual walkthrough**

Run: `npm run dev`. For each of the 5 portals (admin, teacher, staff, parent, student — switch via the role switcher on the portal selection screen or `/login`), open the dashboard and at least one list page. Confirm: monochrome/off-white palette throughout, dark fixed sidebar, working collapse/expand, working nav accordions, `StatusChip`-free pages still render correctly (no new component adopted yet — only theme/table/header upgrades), no console errors. Toggle dark mode and repeat the check. Resize the browser to a mobile width and confirm the temporary drawer still works.

- [ ] **Step 4: Commit (if any fixes were needed)**

If Steps 1-3 required fixes, stage and commit them with an appropriate message before moving to the next plan. If no fixes were needed, this task requires no commit.
