import { useState } from "react";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import PaymentsIcon from "@mui/icons-material/Payments";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import BadgeIcon from "@mui/icons-material/Badge";
import { useAuth } from "@/context/AuthContext";
import type { StaffRole } from "@/types";

const staffRoles: {
  role: StaffRole;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  color: "default" | "primary" | "secondary" | "success" | "warning";
}[] = [
  {
    role: "accountant",
    label: "Accountant",
    shortLabel: "Accounts",
    icon: <PaymentsIcon fontSize="small" />,
    color: "success",
  },
  {
    role: "transport_manager",
    label: "Transport Staff",
    shortLabel: "Transport",
    icon: <DirectionsBusIcon fontSize="small" />,
    color: "primary",
  },
  {
    role: "library_staff",
    label: "Library Staff",
    shortLabel: "Library",
    icon: <MenuBookIcon fontSize="small" />,
    color: "warning",
  },
  {
    role: "office_staff",
    label: "Office Staff",
    shortLabel: "Office",
    icon: <BadgeIcon fontSize="small" />,
    color: "default",
  },
];

export default function StaffRoleSwitcher() {
  const { staffRole, setStaffRole } = useAuth();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const current = staffRoles.find((s) => s.role === staffRole) ?? staffRoles[0];

  return (
    <>
      <Chip
        label={current.shortLabel}
        color={current.color}
        size="small"
        icon={current.icon as React.ReactElement}
        onClick={(e) => setAnchor(e.currentTarget as HTMLElement)}
        sx={{ cursor: "pointer", fontWeight: 600, mr: 0.5 }}
      />
      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
        PaperProps={{ sx: { minWidth: 220 } }}
      >
        <Typography variant="caption" sx={{ px: 2, py: 1, display: "block", color: "text.secondary" }}>
          Switch Staff Responsibility
        </Typography>
        <Divider />
        {staffRoles.map((s) => (
          <MenuItem
            key={s.role}
            selected={staffRole === s.role}
            onClick={() => {
              setStaffRole(s.role);
              setAnchor(null);
            }}
          >
            <ListItemIcon>{s.icon}</ListItemIcon>
            <ListItemText>{s.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}