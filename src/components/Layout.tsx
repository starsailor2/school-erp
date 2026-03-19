import { useState, useMemo, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Box,
  Avatar,
  Tooltip,
  InputBase,
  Badge,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useAuth } from "@/context/AuthContext";
import { useColorMode } from "@/context/ColorModeContext";
import TeacherTypeSwitcher from "@/components/TeacherTypeSwitcher";
import StaffRoleSwitcher from "@/components/StaffRoleSwitcher";
import { getNavItems, type NavItem } from "@/components/navigation";
import { getUnreadNotificationCount } from "@/data/notificationStore";
import LogoutIcon from "@mui/icons-material/Logout";

const DRAWER_WIDTH = 260;

export default function Layout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const { role, teacherType, staffRole, user, logout } = useAuth();
  const { toggleColorMode, mode } = useColorMode();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = useMemo(
    () => getNavItems(role, teacherType, staffRole),
    [role, teacherType, staffRole]
  );

  const [unreadNotifications, setUnreadNotifications] = useState(() => getUnreadNotificationCount());

  useEffect(() => {
    const onUpdate = () => setUnreadNotifications(getUnreadNotificationCount());
    window.addEventListener("erp-notifications-updated", onUpdate);
    return () => window.removeEventListener("erp-notifications-updated", onUpdate);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleSubmenu = (label: string) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleNav = (path: string) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  const isActive = (item: NavItem) => {
    if (item.children) {
      return item.children.some((c) => location.pathname === c.path);
    }
    return location.pathname === item.path;
  };

  const portalLabels: Record<string, string> = {
    admin: "Admin Portal",
    teacher: "Teacher Portal",
    staff: "Staff Portal",
    parent: "Parent Portal",
    student: "Student Portal",
  };

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Avatar sx={{ bgcolor: "primary.main", width: 36, height: 36, fontSize: 14 }}>
          {user?.name.charAt(0) ?? "U"}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap>
            {user?.name ?? "User"}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {portalLabels[role]}
          </Typography>
        </Box>
      </Box>

      <List sx={{ flex: 1, overflow: "auto", py: 1 }} component="nav">
        {navItems.map((item) => {
          const active = isActive(item);
          if (item.children) {
            const open = openMenus[item.label] ?? active;
            return (
              <Box key={item.label}>
                <ListItemButton
                  onClick={() => toggleSubmenu(item.label)}
                  sx={{
                    mx: 1,
                    borderRadius: 1.5,
                    mb: 0.25,
                    ...(active && {
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                      "&:hover": { bgcolor: "primary.dark" },
                      "& .MuiListItemIcon-root": { color: "primary.contrastText" },
                    }),
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14 }} />
                  {open ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                </ListItemButton>
                <Collapse in={open} timeout="auto">
                  <List disablePadding>
                    {item.children.map((child) => {
                      const childActive = location.pathname === child.path;
                      return (
                        <ListItemButton
                          key={child.path}
                          onClick={() => handleNav(child.path)}
                          sx={{
                            pl: 6.5,
                            mx: 1,
                            borderRadius: 1.5,
                            mb: 0.25,
                            ...(childActive && {
                              bgcolor: "action.selected",
                              fontWeight: 600,
                            }),
                          }}
                        >
                          <ListItemText primary={child.label} primaryTypographyProps={{ fontSize: 13 }} />
                        </ListItemButton>
                      );
                    })}
                  </List>
                </Collapse>
              </Box>
            );
          }
          return (
            <ListItemButton
              key={item.path}
              onClick={() => handleNav(item.path)}
              sx={{
                mx: 1,
                borderRadius: 1.5,
                mb: 0.25,
                ...(active && {
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": { bgcolor: "primary.dark" },
                  "& .MuiListItemIcon-root": { color: "primary.contrastText" },
                }),
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14 }} />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          bgcolor: "background.paper",
          color: "text.primary",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" fontWeight={700} sx={{ mr: 2 }} noWrap>
            KALNET School ERP
          </Typography>

          {/* Search */}
          {(role === "admin" || role === "staff") && (
            <Box
              sx={{
                display: { xs: "none", sm: "flex" },
                alignItems: "center",
                bgcolor: "action.hover",
                borderRadius: 2,
                px: 1.5,
                py: 0.5,
                mr: "auto",
                maxWidth: 320,
                flex: 1,
              }}
            >
              <SearchIcon fontSize="small" sx={{ mr: 0.5, color: "text.secondary" }} />
              <InputBase placeholder="Search students, teachers…" sx={{ flex: 1, fontSize: 14 }} />
            </Box>
          )}

          <Box sx={{ flex: 1 }} />
          {role === "teacher" && <TeacherTypeSwitcher />}
          {role === "staff" && <StaffRoleSwitcher />}
          <Tooltip title="Sign Out">
            <IconButton onClick={handleLogout} sx={{ ml: 0.5 }}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Toggle theme">
            <IconButton onClick={toggleColorMode} sx={{ ml: 0.5 }}>
              {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Notifications">
            <IconButton onClick={() => navigate(`/${role}/notifications`)} sx={{ ml: 0.5 }}>
              <Badge badgeContent={unreadNotifications} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{ "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" } }}
          ModalProps={{ keepMounted: true }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
              borderRight: 1,
              borderColor: "divider",
              mt: "64px",
              height: "calc(100% - 64px)",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: "64px",
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: "background.default",
          minHeight: "calc(100vh - 64px)",
          overflow: "auto",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
