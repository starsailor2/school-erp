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
