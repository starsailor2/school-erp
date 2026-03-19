import { useNavigate } from "react-router-dom";
import { Box, Typography, Paper, Avatar } from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import PersonIcon from "@mui/icons-material/Person";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import BuildIcon from "@mui/icons-material/Build";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ShieldIcon from "@mui/icons-material/Shield";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/types";

const portals: {
  role: Role;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    role: "admin",
    label: "Admin",
    description: "Manage students, teachers, staff, fees, reports, and full school administration.",
    icon: <AdminPanelSettingsIcon />,
    color: "#10b981",
  },
  {
    role: "teacher",
    label: "Teacher",
    description: "Classes, attendance, homework, marks entry, and timetable management.",
    icon: <PersonIcon />,
    color: "#8b5cf6",
  },
  {
    role: "student",
    label: "Student",
    description: "View timetable, homework, announcements, grades, and academic records.",
    icon: <SchoolIcon />,
    color: "#6366f1",
  },
  {
    role: "parent",
    label: "Parent",
    description: "Track your child's attendance, homework, results, fees, and school notices.",
    icon: <FamilyRestroomIcon />,
    color: "#ec4899",
  },
  {
    role: "staff",
    label: "School Staff",
    description: "Non-teaching staff portal for fees, transport, library, and office tasks.",
    icon: <BuildIcon />,
    color: "#f59e0b",
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
        background: "linear-gradient(180deg, #ede9fe 0%, #f0f0ff 40%, #f8fafc 100%)",
        px: 2,
      }}
    >
      {/* Logo */}
      <Avatar
        sx={{
          width: 56,
          height: 56,
          bgcolor: "#6366f1",
          mb: 2,
          boxShadow: "0 4px 24px rgba(99,102,241,0.3)",
        }}
      >
        <ShieldIcon sx={{ fontSize: 30 }} />
      </Avatar>

      <Typography
        variant="overline"
        sx={{
          color: "#6366f1",
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
          color: "#6366f1",
          mb: 1,
          textAlign: "center",
          opacity: 0.85,
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
          flexWrap: "nowrap",
          justifyContent: "center",
          maxWidth: 1100,
          width: "100%",
        }}
      >
        {portals.map((portal) => (
          <Paper
            key={portal.role}
            elevation={1}
            onClick={() => handleSelect(portal.role)}
            sx={{
              flex: "1 1 0",
              minWidth: 0,
              maxWidth: 200,
              p: 2.5,
              cursor: "pointer",
              borderRadius: 3,
              transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              "&:hover": {
                elevation: 8,
                boxShadow: `0 8px 32px ${portal.color}30`,
                transform: "translateY(-4px)",
                borderColor: "transparent",
                background: `linear-gradient(135deg, ${portal.color}, #4f46e5)`,
                color: "#fff",
                "& .portal-desc": { color: "rgba(255,255,255,0.85)" },
                "& .portal-avatar": {
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "#fff",
                },
                "& .portal-btn": {
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "#fff",
                },
              },
            }}
          >
            <Avatar
              className="portal-avatar"
              sx={{
                width: 44,
                height: 44,
                bgcolor: `${portal.color}18`,
                color: portal.color,
                mb: 2,
                transition: "all 0.3s",
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
              sx={{ color: "text.secondary", display: "block", mb: 2, lineHeight: 1.5, transition: "all 0.3s" }}
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
                bgcolor: `${portal.color}12`,
                color: portal.color,
                fontSize: 13,
                fontWeight: 600,
                transition: "all 0.3s",
              }}
            >
              Get started <ArrowForwardIcon sx={{ fontSize: 16 }} />
            </Box>
          </Paper>
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
