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

const darkSidebarTokens: SidebarTokens = {
  background: "#0A0A0A",
  text: "#F5F5F4",
  muted: "#8A8A87",
  activeBackground: "#1D1D1F",
  activeText: "#F5F5F4",
  hoverBackground: "#1D1D1F",
  divider: "rgba(255,255,255,0.08)",
};

const lightSidebarTokens: SidebarTokens = {
  background: "#FFFFFF",
  text: "#111111",
  muted: "#5B5B5B",
  activeBackground: "#1D1D1F",
  activeText: "#F5F5F4",
  hoverBackground: "#1D1D1F",
  divider: "rgba(0,0,0,0.08)",
};

export function getSidebarTokens(mode: "light" | "dark"): SidebarTokens {
  return mode === "light" ? lightSidebarTokens : darkSidebarTokens;
}

export const sidebarTokens = darkSidebarTokens;

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
