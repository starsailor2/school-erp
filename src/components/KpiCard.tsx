import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { type ReactNode } from "react";
import { motion } from "motion/react";
import { useTheme, alpha } from "@mui/material/styles";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: string;
  delay?: number;
  onClick?: () => void;
}

// Resolve a dot-path like "primary.main" from the MUI theme palette
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveColor(theme: any, color: string): string {
  if (color.startsWith("#") || color.startsWith("rgb")) return color;
  const parts = color.split(".");
  let result: unknown = theme.palette;
  for (const p of parts) result = (result as Record<string, unknown>)?.[p];
  return typeof result === "string" ? result : color;
}

export function KpiCard({ title, value, icon, color, delay = 0, onClick }: KpiCardProps) {
  const theme = useTheme();
  const resolved = resolveColor(theme, color);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      style={{ cursor: onClick ? "pointer" : "default" }}
      onClick={onClick}
    >
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          display: "flex",
          alignItems: "center",
          gap: 2,
          border: 1,
          borderColor: "divider",
          transition: "box-shadow 0.2s",
          "&:hover": onClick ? { boxShadow: 4 } : {},
        }}
      >
        <Box
          sx={{
            bgcolor: alpha(resolved, 0.1),
            color: resolved,
            p: 1.5,
            borderRadius: 2,
            display: "flex",
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h5" fontWeight={700}>
            {value}
          </Typography>
        </Box>
      </Paper>
    </motion.div>
  );
}
