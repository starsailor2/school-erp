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
