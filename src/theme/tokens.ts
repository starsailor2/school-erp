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
