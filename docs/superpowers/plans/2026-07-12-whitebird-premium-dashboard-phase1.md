# Whitebird-Inspired Premium Dashboard System — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the Phase 1 visual/component system from `docs/superpowers/specs/2026-07-12-whitebird-inspired-premium-dashboard-design.md`: four new components (`CategoryTag`, `SeverityAvatar`, `PipelineStepper`, a `ChartCard` legend footer), a two-tier icon-rail + contextual-secondary-sidebar navigation shell, and a reskin of the fee defaulter, student directory/transfer, and marks pages that most closely match the whitebird.ai reference screenshots.

**Architecture:** Pure frontend, static-demo-data React 19 + MUI v7 app. New presentational components live in `src/components/`; page-level tasks wire them into existing pages using existing demo-data, no new data models. The navigation rework replaces `src/components/Layout.tsx`'s single collapsible drawer with two permanent `Drawer`s (rail + secondary panel) side by side, driven by the current route rather than manual open/close state.

**Tech Stack:** React 19, MUI v7 (`@mui/material`, `@mui/icons-material`), Recharts v2, `motion` v12 (framer-motion fork), TypeScript 5.8, Vite 6. No new dependencies.

## Revision Notes (2026-07-13 — Linear amendment)

The design spec was amended after reviewing Linear as a second reference (see the spec's §1 amendment and new §6 "Density, Icon Style & Layout Rhythm"). Three rules from that amendment **supersede** the illustrative code in Tasks 1-13 below wherever they conflict — the task bodies were written before the amendment and were not individually rewritten line-by-line, since most of their code (component logic, data wiring) is unaffected. Apply these rules at actual implementation time regardless of what a task's embedded snippet shows:

1. **Chrome icons are monochrome, not domain-colored.** Anywhere a task's embedded code colors a *structural* icon (nav rail, secondary sidebar, AppBar/toolbar buttons — menu, search, theme, logout, notifications) via `getIconAccent(mode, ...)` or the old `iconColorFor` hash, use a monochrome token instead (`sidebarTokens.muted` at rest / `sidebarTokens.text` or `.activeText` when active/hovered — or `text.secondary`/`text.primary` outside the sidebar). `getIconAccent` stays reserved for *content-identity* surfaces: `StatCard` icon chips, `CategoryTag` backgrounds, chart series. Task 6's embedded `Layout.tsx` (railContent icons, AppBar icons) is the main place this applies.
2. **Density numbers:** secondary-sidebar/list rows target 34px (not 40-44px); nav/chrome icons use `fontSize="small"` (20px) not `"medium"` (24px); inline meta icons (new `MetaChip`, table cell icons) are 16px.
3. **`DataTable` is dense by default.** Task 0a below flips this before any other task runs, so every `<DataTable>` call site written in later tasks (Tasks 9-12, and the 5 dashboard rebuilds) inherits dense rows without needing a `dense` prop passed explicitly.

Execute **Task 0a and Task 0b first**, before Task 1 — they're foundational and independent of everything else.

## Global Constraints

- No test framework is installed (no vitest/jest) — verification is `npm run build` (runs `tsc -b`), `npm run lint`, and a manual browser walkthrough via `npm run dev`, per this project's existing convention (see the 2026-07-11 spec's own Testing/Verification section).
- Path alias `@/` maps to `src/` (see existing imports throughout the codebase).
- Do not change base surface colors (`src/theme/tokens.ts` `modeTokens`) — only accent/chrome usage changes in this phase.
- All new domain-colored accents MUST use `getIconAccent(mode, key)` from `src/theme/chartPalette.ts` (already validated, already used by every dashboard's `StatCard` calls). Do not hand-pick new hex values. **Per the Revision Notes above, this applies to content-identity surfaces only — structural/chrome icons (nav, toolbars) are monochrome, not domain-colored.**
- `statusTokens` (`good`/`warning`/`serious`/`critical`, in `src/theme/tokens.ts`) are reserved for state — never reused for domain/category identity.
- Follow the codebase's existing MUI `sx` prop styling convention (no CSS files, no styled-components).

---

### Task 0a: `DataTable` — dense by default

**Files:**
- Modify: `src/components/DataTable.tsx`

**Interfaces:** No prop signature change — `dense?: boolean` still exists for the rare page that needs to opt *out* of density (e.g. a table with multi-line cell content). Its default flips from `false` to `true`.

- [ ] **Step 1: Flip the default**

In `src/components/DataTable.tsx`, change:

```tsx
  dense = false,
```

to:

```tsx
  dense = true,
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run build`
Expected: no TypeScript errors — this is a default-value change only, every existing call site still type-checks.

- [ ] **Step 3: Manual browser verification**

`npm run dev`. Open any page using `DataTable` without an explicit `dense` prop (e.g. `/admin/students`) and confirm rows are visibly tighter (MUI `size="small"`) than before. Spot-check 2-3 more `DataTable` pages across different roles. If any page now looks cramped because its cells hold multi-line content, note it — don't fix it in this task (that page can pass `dense={false}` explicitly later; this task is just the default flip).

- [ ] **Step 4: Commit**

```bash
git add src/components/DataTable.tsx
git commit -m "Make DataTable dense rows the default, Linear-style density"
```

---

### Task 0b: `MetaChip` component

**Files:**
- Create: `src/components/MetaChip.tsx`

**Interfaces:**
- Produces: `MetaChip({ icon: ReactNode; label: string; tone?: "default" | "muted" }): JSX.Element` — small inline icon+label pill, ~24px tall, for entity metadata (date, count, type) that flows after a row's title instead of taking a table column.

- [ ] **Step 1: Write the component**

```tsx
// src/components/MetaChip.tsx
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

interface MetaChipProps {
  icon: ReactNode;
  label: string;
  tone?: "default" | "muted";
}

export function MetaChip({ icon, label, tone = "default" }: MetaChipProps) {
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        height: 24,
        px: 0.75,
        borderRadius: 1,
        color: tone === "muted" ? "text.disabled" : "text.secondary",
        "& .MuiSvgIcon-root": { fontSize: 16 },
      }}
    >
      {icon}
      <Typography variant="caption" sx={{ fontSize: 12, lineHeight: 1 }}>
        {label}
      </Typography>
    </Box>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run build`
Expected: no TypeScript errors (no callers yet).

- [ ] **Step 3: Commit**

```bash
git add src/components/MetaChip.tsx
git commit -m "Add MetaChip component for inline row metadata"
```

---

### Task 1: `CategoryTag` component

**Files:**
- Create: `src/components/CategoryTag.tsx`

**Interfaces:**
- Produces: `CategoryTag({ label: string; fullName?: string; domainKey?: string }): JSX.Element` — a small colored square badge. `label` is the short code shown (e.g. `"C9"`); `fullName`, if provided and different from `label`, shows in a tooltip. `domainKey` (defaults to `label`) is the string hashed by `getIconAccent` for color — pass a stable domain key (e.g. `"fees"`) when you want several different `label`s to share one color.

- [ ] **Step 1: Write the component**

```tsx
// src/components/CategoryTag.tsx
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import { alpha } from "@mui/material/styles";
import { getIconAccent } from "@/theme/chartPalette";
import { useColorMode } from "@/context/ColorModeContext";

interface CategoryTagProps {
  label: string;
  fullName?: string;
  domainKey?: string;
}

export function CategoryTag({ label, fullName, domainKey }: CategoryTagProps) {
  const { mode } = useColorMode();
  const color = getIconAccent(mode, domainKey ?? label);
  const tooltip = fullName && fullName !== label ? fullName : "";

  return (
    <Tooltip title={tooltip}>
      <Box
        component="span"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 40,
          px: 0.75,
          py: 0.25,
          borderRadius: 1.5,
          bgcolor: alpha(color, 0.12),
          color,
          border: "1px solid",
          borderColor: alpha(color, 0.3),
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.03em",
          textTransform: "uppercase",
          lineHeight: 1.6,
        }}
      >
        {label}
      </Box>
    </Tooltip>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run build`
Expected: no TypeScript errors (this file has no callers yet, so this only checks the file itself is well-typed).

- [ ] **Step 3: Commit**

```bash
git add src/components/CategoryTag.tsx
git commit -m "Add CategoryTag component for colored domain/category badges"
```

---

### Task 2: `SeverityAvatar` component

**Files:**
- Create: `src/components/SeverityAvatar.tsx`

**Interfaces:**
- Produces: `SeverityAvatar({ severity: Severity; icon: ReactNode; size?: number }): JSX.Element`, and exports `type Severity = "good" | "warning" | "serious" | "critical"`.

- [ ] **Step 1: Write the component**

```tsx
// src/components/SeverityAvatar.tsx
import Box from "@mui/material/Box";
import { alpha } from "@mui/material/styles";
import type { ReactNode } from "react";
import { statusTokens } from "@/theme/tokens";

export type Severity = "good" | "warning" | "serious" | "critical";

interface SeverityAvatarProps {
  severity: Severity;
  icon: ReactNode;
  size?: number;
}

export function SeverityAvatar({ severity, icon, size = 36 }: SeverityAvatarProps) {
  const color = statusTokens[severity];
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: alpha(color, 0.14),
        color,
        flexShrink: 0,
        "& .MuiSvgIcon-root": { fontSize: size * 0.55 },
      }}
    >
      {icon}
    </Box>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run build`
Expected: no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/SeverityAvatar.tsx
git commit -m "Add SeverityAvatar component for status-colored icon avatars"
```

---

### Task 3: `PipelineStepper` component

**Files:**
- Create: `src/components/PipelineStepper.tsx`

**Interfaces:**
- Produces: `PipelineStepper({ steps: PipelineStep[] }): JSX.Element`, and exports `interface PipelineStep { label: string; status: "done" | "active" | "pending"; timestamp?: string; detail?: string }`.
- Consumes: `statusTokens` (`src/theme/tokens.ts`), `getChartPalette` (`src/theme/chartPalette.ts`), `useColorMode` (`src/context/ColorModeContext`).

- [ ] **Step 1: Write the component**

```tsx
// src/components/PipelineStepper.tsx
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import CheckIcon from "@mui/icons-material/Check";
import { statusTokens } from "@/theme/tokens";
import { getChartPalette } from "@/theme/chartPalette";
import { useColorMode } from "@/context/ColorModeContext";

export interface PipelineStep {
  label: string;
  status: "done" | "active" | "pending";
  timestamp?: string;
  detail?: string;
}

interface PipelineStepperProps {
  steps: PipelineStep[];
}

export function PipelineStepper({ steps }: PipelineStepperProps) {
  const { mode } = useColorMode();
  const activeColor = getChartPalette(mode).categorical[0];

  const colorFor = (status: PipelineStep["status"]) =>
    status === "done" ? statusTokens.good : status === "active" ? activeColor : undefined;

  return (
    <Stack direction="row" alignItems="flex-start" sx={{ width: "100%" }}>
      {steps.map((step, i) => {
        const color = colorFor(step.status);
        const isLast = i === steps.length - 1;
        return (
          <Box key={step.label} sx={{ display: "flex", alignItems: "flex-start", flex: isLast ? "0 0 auto" : 1 }}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 100 }}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: color ?? "transparent",
                  border: color ? "none" : "2px solid",
                  borderColor: "divider",
                }}
              >
                {step.status === "done" && <CheckIcon sx={{ fontSize: 14, color: "background.paper" }} />}
                {step.status === "active" && (
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "background.paper" }} />
                )}
              </Box>
              <Typography
                variant="caption"
                fontWeight={step.status === "pending" ? 500 : 700}
                sx={{ mt: 0.75, textAlign: "center", color: step.status === "pending" ? "text.disabled" : "text.primary" }}
              >
                {step.label}
              </Typography>
              {step.timestamp && (
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                  {step.timestamp}
                </Typography>
              )}
              {step.detail && (
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, textAlign: "center" }}>
                  {step.detail}
                </Typography>
              )}
            </Box>
            {!isLast && (
              <Box
                sx={{
                  flex: 1,
                  height: 2,
                  bgcolor: step.status === "done" ? statusTokens.good : "divider",
                  mt: "11px",
                  minWidth: 24,
                }}
              />
            )}
          </Box>
        );
      })}
    </Stack>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run build`
Expected: no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/PipelineStepper.tsx
git commit -m "Add PipelineStepper component for horizontal escalation pipelines"
```

---

### Task 4: `ChartCard` donut+legend footer

**Files:**
- Modify: `src/components/ChartCard.tsx`

**Interfaces:**
- Produces: adds optional prop `legend?: { label: string; value: string; percent?: number; color: string }[]` to `ChartCardProps`, rendered as a footer below the chart body. All existing props/behavior unchanged.

- [ ] **Step 1: Add the `legend` prop and footer rendering**

Modify `src/components/ChartCard.tsx` — replace the whole file:

```tsx
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { type ReactNode } from "react";
import { motion } from "motion/react";
import { motionEasing, motionDuration } from "@/theme/tokens";

interface ChartCardLegendItem {
  label: string;
  value: string;
  percent?: number;
  color: string;
}

interface ChartCardProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  height?: number;
  delay?: number;
  legend?: ChartCardLegendItem[];
  children: ReactNode;
}

export function ChartCard({ eyebrow, title, subtitle, action, height = 320, delay = 0, legend, children }: ChartCardProps) {
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
        {legend && legend.length > 0 && (
          <Stack
            direction="row"
            flexWrap="wrap"
            useFlexGap
            spacing={1.5}
            sx={{ mt: 1.5, pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}
          >
            {legend.map((item) => (
              <Stack key={item.label} direction="row" alignItems="center" spacing={0.75}>
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: item.color, flexShrink: 0 }} />
                <Typography variant="caption" color="text.secondary">
                  {item.label}
                </Typography>
                <Typography variant="caption" fontWeight={700}>
                  {item.value}
                  {item.percent !== undefined ? ` · ${item.percent}%` : ""}
                </Typography>
              </Stack>
            ))}
          </Stack>
        )}
      </Paper>
    </motion.div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run build`
Expected: no TypeScript errors — `legend` is optional, so every existing `<ChartCard>` call site (all 5 dashboards) still type-checks unchanged.

- [ ] **Step 3: Commit**

```bash
git add src/components/ChartCard.tsx
git commit -m "Add optional legend/breakdown footer to ChartCard"
```

---

### Task 5: `SecondarySidebar` component

**Files:**
- Create: `src/components/SecondarySidebar.tsx`

**Interfaces:**
- Consumes: `NavItem` type (`src/components/navigation.tsx`), `SidebarTokens` type (`src/theme/tokens.ts`).
- Produces: `SecondarySidebar({ activeItem: NavItem | null; groups: { group: string; items: NavItem[] }[]; sidebarTokens: SidebarTokens; currentPath: string; onNavigate: (path: string) => void }): JSX.Element`.
  - If `activeItem` has a non-empty `children` array, renders that module's children flat (contextual mode).
  - Otherwise renders the full `groups` list (grouped, one row per top-level item) — this is the fallback used for routes with no children (e.g. Dashboard) and for roles with no grouped modules at all (parent, student).

- [ ] **Step 1: Write the component**

```tsx
// src/components/SecondarySidebar.tsx
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import type { NavItem } from "@/components/navigation";
import type { SidebarTokens } from "@/theme/tokens";

interface SecondarySidebarProps {
  activeItem: NavItem | null;
  groups: { group: string; items: NavItem[] }[];
  sidebarTokens: SidebarTokens;
  currentPath: string;
  onNavigate: (path: string) => void;
}

const rowSx = (tokens: SidebarTokens, active: boolean) => ({
  mx: 1,
  mb: 0.25,
  borderRadius: 1.5,
  minHeight: 40,
  color: active ? tokens.activeText : tokens.text,
  bgcolor: active ? tokens.activeBackground : "transparent",
  fontWeight: active ? 600 : 500,
  "&:hover": { bgcolor: tokens.hoverBackground, color: tokens.hoverText },
});

export function SecondarySidebar({ activeItem, groups, sidebarTokens, currentPath, onNavigate }: SecondarySidebarProps) {
  const contextual = Boolean(activeItem?.children && activeItem.children.length > 0);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: sidebarTokens.background }}>
      <Box
        sx={{
          p: 2,
          minHeight: 84,
          display: "flex",
          alignItems: "center",
          borderBottom: `1px solid ${sidebarTokens.divider}`,
        }}
      >
        <Typography variant="subtitle1" fontWeight={700} sx={{ color: sidebarTokens.text }}>
          {contextual ? activeItem!.label : "Menu"}
        </Typography>
      </Box>
      <List sx={{ flex: 1, overflow: "auto", py: 1 }}>
        {contextual
          ? activeItem!.children!.map((child) => (
              <ListItemButton
                key={child.path}
                disableRipple
                onClick={() => onNavigate(child.path)}
                sx={rowSx(sidebarTokens, currentPath === child.path)}
              >
                <ListItemText primary={child.label} primaryTypographyProps={{ fontSize: 13 }} />
              </ListItemButton>
            ))
          : groups.map(({ group, items }) => (
              <Box key={group || "ungrouped"}>
                {group && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      px: 2.5,
                      pt: 2,
                      pb: 0.5,
                      color: sidebarTokens.muted,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      fontSize: "0.65rem",
                    }}
                  >
                    {group}
                  </Typography>
                )}
                {items.map((item) => (
                  <ListItemButton
                    key={item.path}
                    disableRipple
                    onClick={() => onNavigate(item.path)}
                    sx={rowSx(sidebarTokens, currentPath === item.path)}
                  >
                    <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 13 }} />
                  </ListItemButton>
                ))}
              </Box>
            ))}
      </List>
    </Box>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run build`
Expected: no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/SecondarySidebar.tsx
git commit -m "Add SecondarySidebar component for contextual per-module navigation"
```

---

### Task 6: Rework `Layout.tsx` into icon rail + secondary sidebar

**Files:**
- Modify: `src/components/Layout.tsx` (full rewrite)

**Interfaces:**
- Consumes: `SecondarySidebar` (Task 5), `getIconAccent` (`src/theme/chartPalette.ts`), `getNavItems`/`NavItem` (`src/components/navigation.tsx` — unchanged), `getSidebarTokens`/`motionEasing`/`motionDuration`/`motionEasingCss` (`src/theme/tokens.ts` — unchanged).
- Removes: the `collapsed`/pin/hover-to-preview rail behavior and its `localStorage` persistence (`erp-sidebar-<role>`) — the rail is now always icon-only on desktop, so there is nothing to persist.

This is the highest-risk task in the plan (it replaces the app's persistent chrome). Read the whole new file before editing so you understand what's intentionally dropped vs. kept.

- [ ] **Step 1: Replace `src/components/Layout.tsx` in full**

```tsx
// src/components/Layout.tsx
import { useMemo, useState, useEffect } from "react";
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
import LogoutIcon from "@mui/icons-material/Logout";
import { AnimatePresence, motion } from "motion/react";
import { useAuth } from "@/context/AuthContext";
import { useColorMode } from "@/context/ColorModeContext";
import TeacherTypeSwitcher from "@/components/TeacherTypeSwitcher";
import StaffRoleSwitcher from "@/components/StaffRoleSwitcher";
import { getNavItems, type NavItem } from "@/components/navigation";
import { SecondarySidebar } from "@/components/SecondarySidebar";
import { getUnreadNotificationCount } from "@/demo-data/communication/notificationStore";
import { getSidebarTokens, motionEasing, motionDuration, motionEasingCss } from "@/theme/tokens";
import { getIconAccent } from "@/theme/chartPalette";

const RAIL_WIDTH = 72;
const SECONDARY_WIDTH = 240;
const MOBILE_DRAWER_WIDTH = 280;
const SIDEBAR_TRANSITION_DURATION = 0.3;
const SIDEBAR_TRANSITION_EASING = [0.22, 1, 0.36, 1] as const;

export default function Layout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { role, teacherType, staffRole, user, logout } = useAuth();
  const { toggleColorMode, mode } = useColorMode();
  const sidebarTokens = getSidebarTokens(mode);
  const navigate = useNavigate();
  const location = useLocation();

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const toggleSubmenu = (label: string) => setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));

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

  // The active module drives the secondary sidebar: whichever top-level item
  // owns the current route (its own path, or one of its children's paths).
  const activeItem = useMemo(
    () =>
      navItems.find(
        (item) => location.pathname === item.path || item.children?.some((c) => location.pathname === c.path)
      ) ?? null,
    [navItems, location.pathname]
  );

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

  const handleNav = (path: string) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  const portalLabels: Record<string, string> = {
    admin: "Admin Portal",
    teacher: "Teacher Portal",
    staff: "Staff Portal",
    parent: "Parent Portal",
    student: "Student Portal",
  };

  const hasActiveChild = (item: NavItem) => item.children?.some((c) => location.pathname === c.path) ?? false;
  const isRailSelected = (item: NavItem) => location.pathname === item.path || hasActiveChild(item);

  const railButtonSx = (active: boolean) => ({
    mx: 1,
    borderRadius: 1.5,
    mb: 0.25,
    minHeight: 44,
    justifyContent: "center",
    px: 1.5,
    color: active ? sidebarTokens.activeText : sidebarTokens.text,
    bgcolor: active ? sidebarTokens.activeBackground : "transparent",
    transition: `background-color ${SIDEBAR_TRANSITION_DURATION}s ${motionEasingCss}, color ${SIDEBAR_TRANSITION_DURATION}s ${motionEasingCss}`,
    "&:hover": { bgcolor: sidebarTokens.hoverBackground, color: sidebarTokens.hoverText },
  });

  const railContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: sidebarTokens.background }}>
      <Box
        sx={{
          p: 2,
          minHeight: 84,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: `1px solid ${sidebarTokens.divider}`,
        }}
      >
        <Avatar sx={{ bgcolor: sidebarTokens.text, color: sidebarTokens.background, width: 36, height: 36, fontSize: 14, fontWeight: 700 }}>
          {user?.name.charAt(0) ?? "U"}
        </Avatar>
      </Box>
      <List sx={{ flex: 1, overflow: "auto", py: 1 }} component="nav">
        {navItems.map((item) => {
          const iconColor = getIconAccent(mode, item.path);
          return (
            <Tooltip key={item.path} title={item.label} placement="right">
              <motion.div whileTap={{ scale: 0.97 }} transition={{ duration: motionDuration, ease: motionEasing }}>
                <ListItemButton disableRipple onClick={() => handleNav(item.path)} sx={railButtonSx(isRailSelected(item))}>
                  <ListItemIcon
                    sx={{
                      minWidth: "auto",
                      color: `${iconColor} !important`,
                      "& .MuiSvgIcon-root": { color: `${iconColor} !important` },
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                </ListItemButton>
              </motion.div>
            </Tooltip>
          );
        })}
      </List>
    </Box>
  );

  const renderMobileNavItem = (item: NavItem) => {
    const selected = isRailSelected(item);
    const iconColor = getIconAccent(mode, item.path);
    const iconSx = {
      minWidth: 36,
      color: `${iconColor} !important`,
      "& .MuiSvgIcon-root": { color: `${iconColor} !important` },
    };
    if (item.children) {
      const open = openMenus[item.label] ?? hasActiveChild(item);
      return (
        <Box key={item.label}>
          <ListItemButton
            disableRipple
            onClick={() => toggleSubmenu(item.label)}
            sx={{
              mx: 1, borderRadius: 1.5, mb: 0.25, minHeight: 44,
              color: selected ? sidebarTokens.activeText : sidebarTokens.text,
              bgcolor: selected ? sidebarTokens.activeBackground : "transparent",
            }}
          >
            <ListItemIcon sx={iconSx}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14 }} />
            <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: SIDEBAR_TRANSITION_DURATION, ease: SIDEBAR_TRANSITION_EASING }}>
              <ExpandMoreIcon fontSize="small" />
            </motion.div>
          </ListItemButton>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: SIDEBAR_TRANSITION_DURATION, ease: SIDEBAR_TRANSITION_EASING }}
                style={{ overflow: "hidden" }}
              >
                {item.children.map((child) => (
                  <ListItemButton
                    key={child.path}
                    disableRipple
                    onClick={() => handleNav(child.path)}
                    sx={{
                      pl: 6.5, mx: 1, borderRadius: 1.5, mb: 0.25, minHeight: 40,
                      color: location.pathname === child.path ? sidebarTokens.activeText : sidebarTokens.muted,
                      bgcolor: location.pathname === child.path ? sidebarTokens.activeBackground : "transparent",
                    }}
                  >
                    <ListItemText primary={child.label} primaryTypographyProps={{ fontSize: 13 }} />
                  </ListItemButton>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      );
    }
    return (
      <ListItemButton
        key={item.path}
        disableRipple
        onClick={() => handleNav(item.path)}
        sx={{
          mx: 1, borderRadius: 1.5, mb: 0.25, minHeight: 44,
          color: selected ? sidebarTokens.activeText : sidebarTokens.text,
          bgcolor: selected ? sidebarTokens.activeBackground : "transparent",
        }}
      >
        <ListItemIcon sx={iconSx}>{item.icon}</ListItemIcon>
        <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14 }} />
      </ListItemButton>
    );
  };

  const mobileDrawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: sidebarTokens.background }}>
      <Box sx={{ p: 2, minHeight: 84, display: "flex", alignItems: "center", gap: 1.5, borderBottom: `1px solid ${sidebarTokens.divider}` }}>
        <Avatar sx={{ bgcolor: sidebarTokens.text, color: sidebarTokens.background, width: 36, height: 36, fontSize: 14, fontWeight: 700 }}>
          {user?.name.charAt(0) ?? "U"}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap sx={{ color: sidebarTokens.text }}>
            {user?.name ?? "User"}
          </Typography>
          <Typography variant="caption" noWrap sx={{ color: sidebarTokens.muted }}>
            {portalLabels[role]}
          </Typography>
        </Box>
      </Box>
      <List sx={{ flex: 1, overflow: "auto", py: 1 }} component="nav">
        {groups.map(({ group, items }) => (
          <Box key={group || "ungrouped"}>
            {group && (
              <Typography
                variant="caption"
                sx={{
                  display: "block", px: 2.5, pt: 2, pb: 0.5,
                  color: sidebarTokens.muted, fontWeight: 700,
                  letterSpacing: "0.08em", textTransform: "uppercase", fontSize: "0.65rem",
                }}
              >
                {group}
              </Typography>
            )}
            {items.map(renderMobileNavItem)}
          </Box>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{ zIndex: theme.zIndex.drawer + 1, bgcolor: "background.paper", color: "text.primary", borderBottom: 1, borderColor: "divider" }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
              <MenuIcon sx={{ color: getIconAccent(mode, "menu") }} />
            </IconButton>
          )}
          <Typography variant="h6" fontWeight={700} sx={{ mr: 2, letterSpacing: "-0.02em" }} noWrap>
            KALNET
          </Typography>

          {(role === "admin" || role === "staff") && (
            <Box
              sx={{
                display: { xs: "none", sm: "flex" }, alignItems: "center",
                bgcolor: "background.default", border: "1px solid", borderColor: "divider",
                borderRadius: 2, px: 1.5, py: 0.5, mr: "auto", maxWidth: 320, flex: 1,
              }}
            >
              <SearchIcon fontSize="small" sx={{ mr: 0.5, color: getIconAccent(mode, "search") }} />
              <InputBase placeholder="Search students, teachers…" sx={{ flex: 1, fontSize: 14, color: "text.primary" }} />
            </Box>
          )}

          <Box sx={{ flex: 1 }} />
          {role === "teacher" && <TeacherTypeSwitcher />}
          {role === "staff" && <StaffRoleSwitcher />}
          <Tooltip title="Sign Out">
            <IconButton onClick={handleLogout} sx={{ ml: 0.5 }}>
              <LogoutIcon sx={{ color: getIconAccent(mode, "logout") }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Toggle theme">
            <IconButton onClick={toggleColorMode} sx={{ ml: 0.5 }}>
              {mode === "dark" ? (
                <Brightness7Icon sx={{ color: getIconAccent(mode, "theme") }} />
              ) : (
                <Brightness4Icon sx={{ color: getIconAccent(mode, "theme") }} />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title="Notifications">
            <IconButton onClick={() => navigate(`/${role}/notifications`)} sx={{ ml: 0.5 }}>
              <Badge badgeContent={unreadNotifications} color="error">
                <NotificationsIcon sx={{ color: getIconAccent(mode, "notifications") }} />
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
          sx={{ "& .MuiDrawer-paper": { width: MOBILE_DRAWER_WIDTH, boxSizing: "border-box" } }}
          ModalProps={{ keepMounted: true }}
        >
          {mobileDrawerContent}
        </Drawer>
      ) : (
        <>
          <Drawer
            variant="permanent"
            sx={{
              width: RAIL_WIDTH,
              flexShrink: 0,
              "& .MuiDrawer-paper": { width: RAIL_WIDTH, boxSizing: "border-box", borderRight: "none", mt: "64px", height: "calc(100% - 64px)" },
            }}
          >
            {railContent}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              width: SECONDARY_WIDTH,
              flexShrink: 0,
              "& .MuiDrawer-paper": {
                width: SECONDARY_WIDTH, boxSizing: "border-box",
                borderRight: `1px solid ${sidebarTokens.divider}`, mt: "64px", height: "calc(100% - 64px)",
              },
            }}
          >
            <SecondarySidebar
              activeItem={activeItem}
              groups={groups}
              sidebarTokens={sidebarTokens}
              currentPath={location.pathname}
              onNavigate={handleNav}
            />
          </Drawer>
        </>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          p: 3,
          mt: "64px",
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

- [ ] **Step 2: Verify it compiles**

Run: `npm run build`
Expected: no TypeScript errors.

- [ ] **Step 3: Verify lint passes**

Run: `npm run lint`
Expected: no errors (unused imports like `ChevronLeftIcon`/`ChevronRightIcon` have been dropped from the import list above — if the linter flags anything else unused, remove it).

- [ ] **Step 4: Manual browser verification**

Run: `npm run dev`, open the app, and check for each of the 5 roles (admin, teacher, staff, parent, student — use the role/type switchers to cover teacher `class_teacher`/`hod` and at least two staff roles):
- The rail (72px, dark) renders on the left with icon-only buttons and tooltips on hover.
- A secondary panel (240px) renders immediately right of the rail. On a route like Fees/Attendance/Exams (admin) it shows that module's children with the correct one highlighted; on Dashboard (or any role with no `children`, e.g. parent/student) it shows the full grouped list instead.
- Clicking a rail icon for a module with children navigates to that module's default page and the secondary panel switches to show its children.
- Main page content is not overlapped by either drawer and is not shifted incorrectly.
- Resize below the `md` breakpoint (or use browser device toolbar) — the rail/secondary panels disappear, the hamburger menu appears, and the temporary mobile drawer shows the full grouped+accordion list as before.
- Theme toggle, notifications badge/navigation, search bar (admin/staff), and logout still work.
- Light and dark mode both render sidebar/topbar colors correctly.

- [ ] **Step 5: Commit**

```bash
git add src/components/Layout.tsx
git commit -m "Replace collapsible sidebar with icon rail + contextual secondary sidebar"
```

---

### Task 7: Admin Dashboard — donut legend + severity watchlist

**Files:**
- Modify: `src/pages/admin/Dashboard.tsx`

**Interfaces:**
- Consumes: `SeverityAvatar` (Task 2), `ChartCard`'s new `legend` prop (Task 4).

- [ ] **Step 1: Add `feeStatusTotal` and pass `legend` to the Fee Status Breakdown chart, convert it to a donut**

In `src/pages/admin/Dashboard.tsx`, find the `feeStatusData` definition (around line 61-65):

```tsx
  const feeStatusData = [
    { name: "Paid", value: fees.filter((f) => f.status === "paid").length, color: palette.status.good },
    { name: "Pending", value: fees.filter((f) => f.status === "pending").length, color: palette.status.warning },
    { name: "Overdue", value: fees.filter((f) => f.status === "overdue").length, color: palette.status.critical },
  ];
```

Add a total right after it:

```tsx
  const feeStatusData = [
    { name: "Paid", value: fees.filter((f) => f.status === "paid").length, color: palette.status.good },
    { name: "Pending", value: fees.filter((f) => f.status === "pending").length, color: palette.status.warning },
    { name: "Overdue", value: fees.filter((f) => f.status === "overdue").length, color: palette.status.critical },
  ];
  const feeStatusTotal = feeStatusData.reduce((s, d) => s + d.value, 0);
```

Then find the "Fee Status Breakdown" `ChartCard` (around line 168-180):

```tsx
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
```

Replace it with:

```tsx
        <Grid size={{ xs: 12, md: 4 }}>
          <ChartCard
            eyebrow="Finance"
            title="Fee Status Breakdown"
            delay={0.15}
            legend={feeStatusData.map((d) => ({
              label: d.name,
              value: `${d.value} fees`,
              percent: feeStatusTotal > 0 ? Math.round((d.value / feeStatusTotal) * 100) : 0,
              color: d.color,
            }))}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={feeStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80}>
                  {feeStatusData.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
```

(`Legend` from recharts stays imported and used elsewhere in this file — e.g. the Fee Collection Trend and Occupancy by Block charts — so don't remove the import.)

- [ ] **Step 2: Add `SeverityAvatar` to the Fee Defaulter Watchlist**

Add the imports near the top of the file, alongside the other icon imports:

```tsx
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
```

and alongside the other `@/components` imports:

```tsx
import { SeverityAvatar } from "@/components/SeverityAvatar";
```

Find the Fee Defaulter Watchlist block (around line 260-276):

```tsx
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
```

Replace it with:

```tsx
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Fee Defaulter Watchlist</Typography>
            <Stack spacing={1}>
              {feeDefaulters.map((f) => {
                const student = students.find((s) => s.id === f.student_id);
                return (
                  <Box key={f.id} sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                    <SeverityAvatar severity="critical" icon={<WarningAmberIcon fontSize="small" />} size={32} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={500} noWrap>{student?.name ?? f.student_id}</Typography>
                      <Typography variant="caption" color="text.secondary">₹{f.amount.toLocaleString()} · {f.fee_type}</Typography>
                    </Box>
                    <StatusChip status="overdue" />
                  </Box>
                );
              })}
              {feeDefaulters.length === 0 && <Typography variant="body2" color="text.secondary">No overdue fees.</Typography>}
            </Stack>
          </Paper>
        </Grid>
```

- [ ] **Step 3: Verify it compiles and lints**

Run: `npm run build && npm run lint`
Expected: no errors.

- [ ] **Step 4: Manual browser verification**

`npm run dev`, open `/admin`, confirm the Fee Status Breakdown chart renders as a donut with a legend row underneath showing label/count/percent for Paid/Pending/Overdue, and the Fee Defaulter Watchlist rows show a red warning-icon avatar, the amount + fee type, and the existing "Overdue" chip. Check both light and dark mode.

- [ ] **Step 5: Commit**

```bash
git add src/pages/admin/Dashboard.tsx
git commit -m "Add donut legend and severity avatars to admin dashboard"
```

---

### Task 8: Staff Dashboard — donut legend + severity-tagged task/request lists

**Files:**
- Modify: `src/pages/staff/Dashboard.tsx`

**Interfaces:**
- Consumes: `ChartCard`'s new `legend` prop (Task 4), `SeverityAvatar`/`Severity` (Task 2), `StatusChip` (existing, `src/components/StatusChip.tsx`).

- [ ] **Step 1: Add a total and pass `legend` to the Collections This Month chart**

Find the `feeStatusForStaff` definition (around line 45-49):

```tsx
  const feeStatusForStaff = [
    { name: "Paid", value: getStaffFees().filter((f) => f.status === "paid").length, color: palette.status.good },
    { name: "Pending", value: getStaffFees().filter((f) => f.status === "pending").length, color: palette.status.warning },
    { name: "Overdue", value: getStaffFees().filter((f) => f.status === "overdue").length, color: palette.status.critical },
  ];
```

Add directly after it:

```tsx
  const feeStatusForStaffTotal = feeStatusForStaff.reduce((s, d) => s + d.value, 0);
```

Find the "Collections This Month" `ChartCard` (around line 135-149):

```tsx
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
```

Replace with:

```tsx
          <Grid size={{ xs: 12, md: 6 }}>
            <ChartCard
              eyebrow="Finance"
              title="Collections This Month"
              legend={feeStatusForStaff.map((d) => ({
                label: d.name,
                value: `${d.value} fees`,
                percent: feeStatusForStaffTotal > 0 ? Math.round((d.value / feeStatusForStaffTotal) * 100) : 0,
                color: d.color,
              }))}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={feeStatusForStaff} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80}>
                    {feeStatusForStaff.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
```

(`Legend` stays imported/used elsewhere in this file — Route Utilization and Room Occupancy bar charts.)

- [ ] **Step 2: Add `SeverityAvatar` + `StatusChip` to Today's Tasks and Recent Student Requests**

Add imports:

```tsx
import { SeverityAvatar, type Severity } from "@/components/SeverityAvatar";
import StatusChip from "@/components/StatusChip";
```

Add a small helper above the component (or right after the imports):

```tsx
function severityForStatus(status: string): Severity {
  if (status === "completed" || status === "approved" || status === "fulfilled") return "good";
  if (status === "rejected") return "critical";
  return "warning";
}
```

Find the Today's Tasks / Recent Student Requests block (around line 265-291):

```tsx
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
```

Replace with:

```tsx
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>Today's Tasks</Typography>
            <Stack spacing={1}>
              {todaysTasks.map((t) => (
                <Box key={t.id} sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                  <SeverityAvatar severity={severityForStatus(t.status)} icon={<TaskIcon fontSize="small" />} size={30} />
                  <Typography variant="body2" sx={{ flex: 1 }}>{t.title}</Typography>
                  <StatusChip status={t.status} />
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
                <Box key={r.id} sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                  <SeverityAvatar severity={severityForStatus(r.status)} icon={<PeopleIcon fontSize="small" />} size={30} />
                  <Typography variant="body2" sx={{ flex: 1 }}>{r.request_type.replace(/_/g, " ")}</Typography>
                  <StatusChip status={r.status} />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
```

(`TaskIcon` and `PeopleIcon` are already imported at the top of this file. `Chip` may become unused by this change — check with the linter in Step 3 and remove the import if so, unless it's still used elsewhere in the file.)

- [ ] **Step 3: Verify it compiles and lints**

Run: `npm run build && npm run lint`
Expected: no errors. If lint flags `Chip` as an unused import, remove it (it is otherwise used nowhere else in this file's JSX beyond the two blocks just replaced — verify by searching the file before removing).

- [ ] **Step 4: Manual browser verification**

`npm run dev`, log in as staff with role `accountant`, open `/staff`, confirm the "Collections This Month" donut shows a legend footer with label/count/percent, and that Today's Tasks / Recent Student Requests rows show a status-colored icon avatar plus the standard `StatusChip` instead of a plain unstyled chip.

- [ ] **Step 5: Commit**

```bash
git add src/pages/staff/Dashboard.tsx
git commit -m "Add donut legend and severity-tagged task/request lists to staff dashboard"
```

---

### Task 9: Fee Defaulters — escalation stepper + severity-tagged rows

**Files:**
- Modify: `src/pages/admin/FeeDefaulters.tsx` (full rewrite)

**Interfaces:**
- Consumes: `PipelineStepper`/`PipelineStep` (Task 3), `SeverityAvatar`/`Severity` (Task 2).
- Escalation stage is derived purely from `overdueDays` (no new data model): `0-7` → `reminder`, `8-15` → `notice`, `16-30` → `penalty`, `31+` → `escalate`.

- [ ] **Step 1: Replace the whole file**

```tsx
// src/pages/admin/FeeDefaulters.tsx
import { useMemo, useState } from "react";
import { Chip, Button, Grid, MenuItem, TextField, Paper, Typography, Stack, Box } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import GavelIcon from "@mui/icons-material/Gavel";
import type { SvgIconComponent } from "@mui/icons-material";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { PipelineStepper, type PipelineStep } from "@/components/PipelineStepper";
import { SeverityAvatar, type Severity } from "@/components/SeverityAvatar";
import { fees, students, getClassName } from "@/demo-data";

type Stage = "reminder" | "notice" | "penalty" | "escalate";
const STAGE_ORDER: Stage[] = ["reminder", "notice", "penalty", "escalate"];
const STAGE_META: Record<Stage, { label: string; icon: SvgIconComponent; severity: Severity }> = {
  reminder: { label: "Reminder", icon: NotificationsActiveIcon, severity: "warning" },
  notice: { label: "Notice", icon: WarningAmberIcon, severity: "warning" },
  penalty: { label: "Penalty", icon: ReportProblemIcon, severity: "serious" },
  escalate: { label: "Escalate", icon: GavelIcon, severity: "critical" },
};

function stageFor(overdueDays: number): Stage {
  if (overdueDays >= 31) return "escalate";
  if (overdueDays >= 16) return "penalty";
  if (overdueDays >= 8) return "notice";
  return "reminder";
}

export default function FeeDefaulters() {
  const [classFilter, setClassFilter] = useState("all");

  const rows = useMemo(
    () =>
      fees
        .filter((f) => f.status === "overdue")
        .map((f) => {
          const student = students.find((s) => s.id === f.student_id);
          const today = new Date();
          const dueDate = new Date(f.due_date);
          const overdueDays = Math.max(0, Math.ceil((+today - +dueDate) / (1000 * 60 * 60 * 24)));
          return {
            ...f,
            studentName: student?.name ?? "—",
            className: student ? getClassName(student.class_id) : "—",
            phone: student?.phone ?? "—",
            overdueDays,
            stage: stageFor(overdueDays),
          };
        })
        .filter((row) => classFilter === "all" || row.className === classFilter),
    [classFilter]
  );

  const classNames = Array.from(new Set(students.map((s) => getClassName(s.class_id))));
  const totalOutstanding = rows.reduce((s, r) => s + r.amount, 0);
  const maxStageIndex = rows.reduce((max, r) => Math.max(max, STAGE_ORDER.indexOf(r.stage)), -1);
  const escalationSteps: PipelineStep[] = STAGE_ORDER.map((stage, i) => ({
    label: STAGE_META[stage].label,
    status: i < maxStageIndex ? "done" : i === maxStageIndex ? "active" : "pending",
    detail: `${rows.filter((r) => r.stage === stage).length} students`,
  }));

  return (
    <>
      <PageHeader
        title="Fee Defaulters"
        breadcrumbs={[
          { label: "Dashboard", to: "/admin" },
          { label: "Fees", to: "/admin/fees" },
          { label: "Defaulters" },
        ]}
      />

      <Paper sx={{ p: 2.5, mb: 2 }}>
        <Typography variant="overline" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
          Defaulters · Grace period over
        </Typography>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          {rows.length} students · ₹{totalOutstanding.toLocaleString()} outstanding
        </Typography>
        {rows.length > 0 && <PipelineStepper steps={escalationSteps} />}
      </Paper>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select size="small" label="Class" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
            <MenuItem value="all">All Classes</MenuItem>
            {classNames.map((name) => <MenuItem key={name} value={name}>{name}</MenuItem>)}
          </TextField>
        </Grid>
      </Grid>

      <DataTable
        pagination
        pageSize={25}
        columns={[
          {
            key: "studentName", label: "Student",
            render: (f) => {
              const StageIcon = STAGE_META[f.stage].icon;
              return (
                <Stack direction="row" alignItems="center" spacing={1.25}>
                  <SeverityAvatar severity={STAGE_META[f.stage].severity} icon={<StageIcon fontSize="small" />} size={32} />
                  <Box>
                    <Typography variant="body2" fontWeight={500}>{f.studentName}</Typography>
                    <Typography variant="caption" color="text.secondary">{f.className}</Typography>
                  </Box>
                </Stack>
              );
            },
          },
          { key: "phone", label: "Phone" },
          { key: "fee_type", label: "Type" },
          { key: "amount", label: "Amount", render: (f) => `₹${f.amount.toLocaleString()}` },
          { key: "due_date", label: "Due Date" },
          { key: "overdueDays", label: "Overdue Days" },
          { key: "stage", label: "Stage", render: (f) => <Chip label={STAGE_META[f.stage].label} size="small" /> },
          { key: "actions", label: "Actions", render: () => <Button size="small" variant="outlined">Send Reminder</Button> },
        ]}
        rows={rows}
      />
    </>
  );
}
```

- [ ] **Step 2: Verify it compiles and lints**

Run: `npm run build && npm run lint`
Expected: no errors.

- [ ] **Step 3: Manual browser verification**

`npm run dev`, open `/admin/fees/defaulters`. Confirm: the summary card shows student count + total outstanding, the horizontal stepper shows Reminder/Notice/Penalty/Escalate with correct done/active/pending states and per-stage student counts, and each table row shows a severity-colored icon avatar next to the student name matching their stage. Change the Class filter and confirm the stepper's counts update. Check light and dark mode.

- [ ] **Step 4: Commit**

```bash
git add src/pages/admin/FeeDefaulters.tsx
git commit -m "Reskin Fee Defaulters with escalation stepper and severity avatars"
```

---

### Task 10: Student Directory — CategoryTag + StatusChip

**Files:**
- Modify: `src/pages/admin/StudentDirectory.tsx`

**Interfaces:**
- Consumes: `CategoryTag` (Task 1), `StatusChip` (existing, `src/components/StatusChip.tsx`).

- [ ] **Step 1: Swap ad hoc Chip colors for `CategoryTag`/`StatusChip`**

Add imports:

```tsx
import StatusChip from "@/components/StatusChip";
import { CategoryTag } from "@/components/CategoryTag";
```

Remove the `feeColor` helper (lines 24-25):

```tsx
  const feeColor = (status: string) =>
    status === "paid" ? "success" : status === "pending" ? "warning" : "error";
```

Find the `columns` array (lines 65-87) and replace the `class_id` and `fee_status` column definitions:

```tsx
          { key: "admission_number", label: "Adm. No." },
          { key: "class_id", label: "Class", render: (s) => getClassName(s.class_id) },
          { key: "roll_number", label: "Roll No." },
          { key: "gender", label: "Gender", render: (s) => s.gender.charAt(0).toUpperCase() + s.gender.slice(1) },
          {
            key: "attendance_pct", label: "Attendance",
            render: (s) => <Chip label={`${s.attendance_pct}%`} size="small" color={s.attendance_pct >= 85 ? "success" : s.attendance_pct >= 75 ? "warning" : "error"} />,
          },
          {
            key: "fee_status", label: "Fees",
            render: (s) => <Chip label={s.fee_status} size="small" color={feeColor(s.fee_status)} />,
          },
```

with:

```tsx
          { key: "admission_number", label: "Adm. No." },
          {
            key: "class_id", label: "Class",
            render: (s) => <CategoryTag label={getClassName(s.class_id).replace("Class ", "C")} fullName={getClassName(s.class_id)} />,
          },
          { key: "roll_number", label: "Roll No." },
          { key: "gender", label: "Gender", render: (s) => s.gender.charAt(0).toUpperCase() + s.gender.slice(1) },
          {
            key: "attendance_pct", label: "Attendance",
            render: (s) => <Chip label={`${s.attendance_pct}%`} size="small" color={s.attendance_pct >= 85 ? "success" : s.attendance_pct >= 75 ? "warning" : "error"} />,
          },
          {
            key: "fee_status", label: "Fees",
            render: (s) => <StatusChip status={s.fee_status} />,
          },
```

- [ ] **Step 2: Verify it compiles and lints**

Run: `npm run build && npm run lint`
Expected: no errors (the removed `feeColor` function must have no remaining references).

- [ ] **Step 3: Manual browser verification**

`npm run dev`, open `/admin/students`. Confirm the Class column shows a colored `CategoryTag` (hover to see the tooltip with the full class name), and the Fees column shows the app's standard `StatusChip` (icon + label) instead of a plain colored chip.

- [ ] **Step 4: Commit**

```bash
git add src/pages/admin/StudentDirectory.tsx
git commit -m "Use CategoryTag and StatusChip in Student Directory"
```

---

### Task 11: Student Transfer — combined transfer indicator

**Files:**
- Modify: `src/pages/admin/StudentTransfer.tsx`

**Interfaces:**
- Consumes: `CategoryTag` (Task 1).

- [ ] **Step 1: Combine the From/To columns into one transfer indicator**

Add imports:

```tsx
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { CategoryTag } from "@/components/CategoryTag";
```

Find the `columns` array (lines 74-90) and replace the `fromClass`/`toClass` column definitions:

```tsx
      <DataTable
        columns={[
          { key: "studentName", label: "Student" },
          { key: "fromClass", label: "From" },
          { key: "toClass", label: "To" },
          { key: "reason", label: "Reason" },
          { key: "date", label: "Date" },
```

with:

```tsx
      <DataTable
        columns={[
          { key: "studentName", label: "Student" },
          {
            key: "transfer", label: "Transfer",
            render: (t) => (
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <CategoryTag label={t.fromClass.replace("Class ", "C")} fullName={t.fromClass} />
                <ArrowForwardIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                <CategoryTag label={t.toClass.replace("Class ", "C")} fullName={t.toClass} />
              </Stack>
            ),
          },
          { key: "reason", label: "Reason" },
          { key: "date", label: "Date" },
```

(`Stack` is already imported in this file for the dialog form — no import change needed for it.)

- [ ] **Step 2: Verify it compiles and lints**

Run: `npm run build && npm run lint`
Expected: no errors.

- [ ] **Step 3: Manual browser verification**

`npm run dev`, open `/admin/students/transfer`. Confirm each row shows two colored `CategoryTag`s with an arrow between them instead of two plain text columns.

- [ ] **Step 4: Commit**

```bash
git add src/pages/admin/StudentTransfer.tsx
git commit -m "Combine From/To columns into a CategoryTag transfer indicator"
```

---

### Task 12: Marks Overview + Report Cards — CategoryTag polish

**Files:**
- Modify: `src/pages/admin/MarksOverview.tsx`
- Modify: `src/pages/admin/ReportCards.tsx`

**Interfaces:**
- Consumes: `CategoryTag` (Task 1).

- [ ] **Step 1: `MarksOverview.tsx` — class column uses `CategoryTag`**

Add the import:

```tsx
import { CategoryTag } from "@/components/CategoryTag";
```

Find the `className` column (line 53):

```tsx
          { key: "className", label: "Class" },
```

Replace with:

```tsx
          {
            key: "className", label: "Class",
            render: (m) => <CategoryTag label={m.className.replace("Class ", "C")} fullName={m.className} />,
          },
```

- [ ] **Step 2: `ReportCards.tsx` — header shows a `CategoryTag` for class**

Add the import:

```tsx
import { CategoryTag } from "@/components/CategoryTag";
```

Find the student header block (lines 61-69):

```tsx
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: "primary.main" }}>{student.name.charAt(0)}</Avatar>
            <Box>
              <Typography variant="h6">{student.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {getClassName(student.class_id)} | Roll No. {student.roll_number} | {student.admission_number}
              </Typography>
            </Box>
          </Box>
```

Replace with:

```tsx
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: "primary.main" }}>{student.name.charAt(0)}</Avatar>
            <Box>
              <Typography variant="h6">{student.name}</Typography>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                <CategoryTag label={getClassName(student.class_id).replace("Class ", "C")} fullName={getClassName(student.class_id)} />
                <Typography variant="body2" color="text.secondary">
                  Roll No. {student.roll_number} | {student.admission_number}
                </Typography>
              </Stack>
            </Box>
          </Box>
```

(`Stack` is already imported in this file.)

- [ ] **Step 3: Verify both files compile and lint**

Run: `npm run build && npm run lint`
Expected: no errors.

- [ ] **Step 4: Manual browser verification**

`npm run dev`. Open `/admin/exams/marks` and confirm the Class column shows a `CategoryTag`. Open `/admin/exams/report-cards`, pick a student, and confirm a `CategoryTag` appears next to the roll number line. Print-preview the report card (the `Print` button) and confirm the tag still renders sensibly.

- [ ] **Step 5: Commit**

```bash
git add src/pages/admin/MarksOverview.tsx src/pages/admin/ReportCards.tsx
git commit -m "Add CategoryTag to Marks Overview and Report Cards"
```

---

### Task 13: Full verification sweep

**Files:** none (verification only)

- [ ] **Step 1: Full build**

Run: `npm run build`
Expected: exits 0, no TypeScript errors anywhere in the project.

- [ ] **Step 2: Full lint**

Run: `npm run lint`
Expected: exits 0, no errors.

- [ ] **Step 3: Manual walkthrough**

Run: `npm run dev`. For each of the 5 roles (admin, teacher [both `class_teacher` and `hod` via the type switcher], staff [at least `accountant`, `hostel_warden`, and one more role via the switcher], parent, student), in both light and dark mode, at both desktop and mobile widths:
- Load the dashboard and confirm it renders with no console errors, colored stat icons, and (where present) donut charts with legends.
- Navigate through the rail + secondary sidebar (or mobile drawer) into at least 2 sub-pages per role and back.
- For admin specifically: visit Fee Defaulters, Student Directory, Student Transfer, Marks Overview, and Report Cards, and confirm the new components (`PipelineStepper`, `SeverityAvatar`, `CategoryTag`) render as expected from Tasks 9-12.

- [ ] **Step 4: Fix any regressions found**

If any step above surfaces a bug, fix it in the relevant file, re-run the affected verification step, and commit the fix separately (`git commit -m "Fix <specific issue> found during Phase 1 verification sweep"`).

- [ ] **Step 5: Final commit**

If Step 4 required no fixes, there is nothing to commit for this task — it's verification-only. If fixes were made, ensure each fix's commit message is specific.
