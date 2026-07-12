import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import SchoolIcon from "@mui/icons-material/School";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import BadgeIcon from "@mui/icons-material/Badge";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/types";

const roles: { role: Role; label: string; icon: React.ReactNode; color: string }[] = [
  { role: "admin", label: "Admin", icon: <AdminPanelSettingsIcon fontSize="small" />, color: "#2a78d6" },
  { role: "teacher", label: "Teacher", icon: <SchoolIcon fontSize="small" />, color: "#1baf7a" },
  { role: "parent", label: "Parent", icon: <PeopleIcon fontSize="small" />, color: "#eda100" },
  { role: "student", label: "Student", icon: <PersonIcon fontSize="small" />, color: "#eb6834" },
  { role: "staff", label: "School Staff", icon: <BadgeIcon fontSize="small" />, color: "#e34948" },
];

export default function RoleSwitcher() {
  const { role, setRole } = useAuth();
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const handleSwitch = (newRole: Role) => {
    setRole(newRole);
    setAnchor(null);
    navigate(`/${newRole}`);
  };

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        startIcon={<SwapHorizIcon />}
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{ textTransform: "none", borderRadius: 2 }}
      >
        Switch Portal
      </Button>
      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
        PaperProps={{ sx: { minWidth: 200 } }}
      >
        <Typography variant="caption" sx={{ px: 2, py: 1, display: "block", color: "text.secondary" }}>
          Select Portal
        </Typography>
        <Divider />
        {roles.map((r) => (
          <MenuItem
            key={r.role}
            selected={role === r.role}
            onClick={() => handleSwitch(r.role)}
          >
            <ListItemIcon sx={{ color: r.color }}>{r.icon}</ListItemIcon>
            <ListItemText>{r.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
