import { useNavigate } from "react-router-dom";
import { Box, Typography, Paper, Avatar } from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import PersonIcon from "@mui/icons-material/Person";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import BuildIcon from "@mui/icons-material/Build";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ShieldIcon from "@mui/icons-material/Shield";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import { motion } from "motion/react";
import { useAuth } from "@/context/AuthContext";
import { motionEasing, motionEasingCss, motionDuration } from "@/theme/tokens";
import type { Role } from "@/types";

const portals: {
  role: Role;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    role: "admin",
    label: "Admin",
    description: "Manage students, teachers, staff, fees, reports, and full school administration.",
    icon: <AdminPanelSettingsIcon />,
  },
  {
    role: "teacher",
    label: "Teacher",
    description: "Classes, attendance, homework, marks entry, and timetable management.",
    icon: <PersonIcon />,
  },
  {
    role: "student",
    label: "Student",
    description: "View timetable, homework, announcements, grades, and academic records.",
    icon: <SchoolIcon />,
  },
  {
    role: "parent",
    label: "Parent",
    description: "Track your child's attendance, homework, results, fees, and school notices.",
    icon: <FamilyRestroomIcon />,
  },
  {
    role: "staff",
    label: "School Staff",
    description: "Non-teaching staff portal for fees, transport, library, and office tasks.",
    icon: <BuildIcon />,
  },
];

export default function PortalSelection() {
  const { setRole } = useAuth();
  const navigate = useNavigate();

  const handleSelect = (role: Role) => {
    setRole(role);
    navigate(`/login`, { state: { role } });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        px: 2,
      }}
    >
      {/* Logo */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: motionDuration * 2, ease: motionEasing }}>
        <Avatar
          sx={{
            width: 56,
            height: 56,
            bgcolor: "primary.main",
            color: "primary.contrastText",
            mb: 2,
          }}
        >
          <ShieldIcon sx={{ fontSize: 30 }} />
        </Avatar>
      </motion.div>

      <Typography
        variant="overline"
        sx={{
          color: "text.secondary",
          fontWeight: 700,
          letterSpacing: 3,
          mb: 0.5,
        }}
      >
        SELECT YOUR PORTAL
      </Typography>

      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: "text.primary",
          mb: 1,
          textAlign: "center",
        }}
      >
        KALNET School ERP
      </Typography>

      <Typography
        variant="body2"
        sx={{ color: "text.secondary", mb: 5, textAlign: "center", maxWidth: 480 }}
      >
        Choose your role to continue. Experience seamless management
        and connectivity across all school operations.
      </Typography>

      {/* Portal Cards — single row */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: 1100,
          width: "100%",
        }}
      >
        {portals.map((portal, i) => (
          <motion.div
            key={portal.role}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: motionDuration * 2, ease: motionEasing }}
            style={{ flex: "1 1 0", minWidth: 180, maxWidth: 200 }}
          >
            <Paper
              elevation={0}
              onClick={() => handleSelect(portal.role)}
              sx={{
                p: 2.5,
                height: "100%",
                cursor: "pointer",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                transition: `all ${motionDuration * 1.5}s ${motionEasingCss}`,
                "&:hover": {
                  boxShadow: (t) => (t.palette.mode === "light" ? "0 12px 32px rgba(0,0,0,0.12)" : "0 12px 32px rgba(0,0,0,0.5)"),
                  transform: "translateY(-4px)",
                  borderColor: "transparent",
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "& .portal-desc": { color: (t) => (t.palette.mode === "light" ? "rgba(255,255,255,0.75)" : "rgba(10,10,10,0.7)") },
                  "& .portal-avatar": {
                    bgcolor: "primary.contrastText",
                    color: "primary.main",
                  },
                  "& .portal-btn": {
                    bgcolor: (t) => (t.palette.mode === "light" ? "rgba(255,255,255,0.16)" : "rgba(10,10,10,0.12)"),
                    color: "primary.contrastText",
                  },
                },
              }}
            >
              <Avatar
                className="portal-avatar"
                sx={{
                  width: 44,
                  height: 44,
                  bgcolor: "action.hover",
                  color: "text.primary",
                  mb: 2,
                  transition: `all ${motionDuration}s`,
                }}
              >
                {portal.icon}
              </Avatar>

              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
                {portal.label}
              </Typography>

              <Typography
                variant="caption"
                className="portal-desc"
                sx={{ color: "text.secondary", display: "block", mb: 2, lineHeight: 1.5, transition: `all ${motionDuration}s` }}
              >
                {portal.description}
              </Typography>

              <Box
                className="portal-btn"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                  px: 2,
                  py: 0.75,
                  borderRadius: 2,
                  bgcolor: "action.hover",
                  color: "text.primary",
                  fontSize: 13,
                  fontWeight: 600,
                  transition: `all ${motionDuration}s`,
                }}
              >
                Get started <ArrowForwardIcon sx={{ fontSize: 16 }} />
              </Box>
            </Paper>
          </motion.div>
        ))}
      </Box>

      {/* Footer */}
      <Typography
        variant="caption"
        sx={{ mt: 6, color: "text.disabled", letterSpacing: 1 }}
      >
        Secure &bull; Reliable &bull; Efficient
      </Typography>
    </Box>
  );
}
