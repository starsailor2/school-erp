import { useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import PersonIcon from "@mui/icons-material/Person";
import GroupsIcon from "@mui/icons-material/Groups";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import { useAuth } from "@/context/AuthContext";
import type { TeacherType } from "@/types";

const teacherTypes: { type: TeacherType; label: string; shortLabel: string; icon: React.ReactNode; color: string }[] = [
  { type: "subject_teacher", label: "Subject Teacher", shortLabel: "Teacher", icon: <PersonIcon fontSize="small" />, color: "#2a78d6" },
  { type: "class_teacher", label: "Class Teacher", shortLabel: "Class Teacher", icon: <GroupsIcon fontSize="small" />, color: "#1baf7a" },
  { type: "hod", label: "Head of Department", shortLabel: "HOD", icon: <SupervisorAccountIcon fontSize="small" />, color: "#eda100" },
];

export default function TeacherTypeSwitcher() {
  const { teacherType, setTeacherType } = useAuth();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const current = teacherTypes.find((t) => t.type === teacherType) ?? teacherTypes[0];

  return (
    <>
      <Chip
        label={current.shortLabel}
        size="small"
        icon={current.icon as React.ReactElement}
        onClick={(e) => setAnchor(e.currentTarget as HTMLElement)}
        sx={{
          cursor: "pointer",
          fontWeight: 600,
          mr: 0.5,
          bgcolor: `${current.color}1A`,
          color: current.color,
          "& .MuiChip-icon": { color: current.color },
        }}
      />
      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
        PaperProps={{ sx: { minWidth: 220 } }}
      >
        <Typography variant="caption" sx={{ px: 2, py: 1, display: "block", color: "text.secondary" }}>
          Switch Teacher Role
        </Typography>
        <Divider />
        {teacherTypes.map((t) => (
          <MenuItem
            key={t.type}
            selected={teacherType === t.type}
            onClick={() => { setTeacherType(t.type); setAnchor(null); }}
          >
            <ListItemIcon sx={{ color: t.color }}>{t.icon}</ListItemIcon>
            <ListItemText>{t.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
