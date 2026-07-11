// src/components/Layout.tsx
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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LogoutIcon from "@mui/icons-material/Logout";
import { AnimatePresence, motion } from "motion/react";
import { useAuth } from "@/context/AuthContext";
import { useColorMode } from "@/context/ColorModeContext";
import TeacherTypeSwitcher from "@/components/TeacherTypeSwitcher";
import StaffRoleSwitcher from "@/components/StaffRoleSwitcher";
import { getNavItems, type NavItem } from "@/components/navigation";
import { getUnreadNotificationCount } from "@/data/notificationStore";
import { sidebarTokens, motionEasing, motionDuration } from "@/theme/tokens";

const DRAWER_WIDTH = 260;
const RAIL_WIDTH = 72;

export default function Layout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { role, teacherType, staffRole, user, logout } = useAuth();
  const { toggleColorMode, mode } = useColorMode();
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem(`erp-sidebar-${role}`) === "collapsed";
  });
  useEffect(() => {
    localStorage.setItem(`erp-sidebar-${role}`, collapsed ? "collapsed" : "expanded");
  }, [collapsed, role]);

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const navItems = useMemo(
    () => getNavItems(role, teacherType, staffRole),
    [role, teacherType, staffRole]
  );

  const groups = useMemo(() => {
    const order: string[] = [];
    const map = new Map<string, NavItem[]>();
    for (const item of navItems) {
      const g = item.group ?? "";
      if (!map.has(g)) {
        map.set(g, []);
        order.push(g);
      }
      map.get(g)!.push(item);
    }
    return order.map((g) => ({ group: g, items: map.get(g)! }));
  }, [navItems]);

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

  const showRail = collapsed && !isMobile;

  const navButtonSx = (active: boolean) => ({
    mx: 1,
    borderRadius: 1.5,
    mb: 0.25,
    color: sidebarTokens.text,
    justifyContent: showRail ? "center" : "flex-start",
    px: showRail ? 1.5 : 2,
    transition: `background-color ${motionDuration}s ${sidebarTokens.background}`,
    "&:hover": { bgcolor: sidebarTokens.hoverBackground },
    ...(active && {
      bgcolor: sidebarTokens.activeBackground,
      color: sidebarTokens.activeText,
      "&:hover": { bgcolor: sidebarTokens.activeBackground },
      "& .MuiListItemIcon-root": { color: sidebarTokens.activeText },
    }),
  });

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: sidebarTokens.background }}>
      <Box
        sx={{
          p: showRail ? 1.5 : 2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderBottom: `1px solid ${sidebarTokens.divider}`,
          justifyContent: showRail ? "center" : "flex-start",
        }}
      >
        <Avatar sx={{ bgcolor: sidebarTokens.text, color: sidebarTokens.background, width: 36, height: 36, fontSize: 14, fontWeight: 700 }}>
          {user?.name.charAt(0) ?? "U"}
        </Avatar>
        {!showRail && (
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap sx={{ color: sidebarTokens.text }}>
              {user?.name ?? "User"}
            </Typography>
            <Typography variant="caption" noWrap sx={{ color: sidebarTokens.muted }}>
              {portalLabels[role]}
            </Typography>
          </Box>
        )}
      </Box>

      <List sx={{ flex: 1, overflow: "auto", py: 1 }} component="nav">
        {groups.map(({ group, items }) => (
          <Box key={group || "ungrouped"}>
            {group && !showRail && (
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  color: sidebarTokens.muted,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontSize: "0.65rem",
                  px: 2.5,
                  pt: 2,
                  pb: 0.5,
                }}
              >
                {group}
              </Typography>
            )}
            {items.map((item) => {
              const active = isActive(item);
              if (item.children) {
                const open = !showRail && (openMenus[item.label] ?? active);
                return (
                  <Box key={item.label}>
                    <ListItemButton
                      onClick={() => (showRail ? handleNav(item.path) : toggleSubmenu(item.label))}
                      sx={navButtonSx(active)}
                    >
                      <ListItemIcon sx={{ minWidth: showRail ? "auto" : 36, color: "inherit" }}>{item.icon}</ListItemIcon>
                      {!showRail && (
                        <>
                          <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14 }} />
                          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: motionDuration, ease: motionEasing }}>
                            <ExpandMoreIcon fontSize="small" />
                          </motion.div>
                        </>
                      )}
                    </ListItemButton>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: motionDuration, ease: motionEasing }}
                          style={{ overflow: "hidden" }}
                        >
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
                                    color: sidebarTokens.muted,
                                    "&:hover": { bgcolor: sidebarTokens.hoverBackground },
                                    ...(childActive && {
                                      bgcolor: sidebarTokens.hoverBackground,
                                      color: sidebarTokens.text,
                                      fontWeight: 600,
                                    }),
                                  }}
                                >
                                  <ListItemText primary={child.label} primaryTypographyProps={{ fontSize: 13 }} />
                                </ListItemButton>
                              );
                            })}
                          </List>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Box>
                );
              }
              return (
                <Tooltip key={item.path} title={showRail ? item.label : ""} placement="right">
                  <ListItemButton onClick={() => handleNav(item.path)} sx={navButtonSx(active)}>
                    <ListItemIcon sx={{ minWidth: showRail ? "auto" : 36, color: "inherit" }}>{item.icon}</ListItemIcon>
                    {!showRail && <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14 }} />}
                  </ListItemButton>
                </Tooltip>
              );
            })}
          </Box>
        ))}
      </List>

      {!isMobile && (
        <Box sx={{ borderTop: `1px solid ${sidebarTokens.divider}`, p: 1 }}>
          <IconButton
            onClick={() => setCollapsed((c) => !c)}
            sx={{ color: sidebarTokens.muted, width: "100%", borderRadius: 1.5, "&:hover": { bgcolor: sidebarTokens.hoverBackground } }}
          >
            {showRail ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Box>
      )}
    </Box>
  );

  const currentWidth = showRail ? RAIL_WIDTH : DRAWER_WIDTH;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
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
          <Typography variant="h6" fontWeight={700} sx={{ mr: 2, letterSpacing: "-0.02em" }} noWrap>
            KALNET
          </Typography>

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
            width: currentWidth,
            flexShrink: 0,
            transition: `width ${motionDuration}s ${theme.transitions.easing.easeInOut}`,
            "& .MuiDrawer-paper": {
              width: currentWidth,
              boxSizing: "border-box",
              borderRight: "none",
              mt: "64px",
              height: "calc(100% - 64px)",
              transition: `width ${motionDuration}s ${theme.transitions.easing.easeInOut}`,
              overflowX: "hidden",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: "64px",
          ml: { md: `${currentWidth}px` },
          transition: `margin-left ${motionDuration}s ${theme.transitions.easing.easeInOut}`,
          bgcolor: "background.default",
          minHeight: "calc(100vh - 64px)",
          overflow: "auto",
        }}
      >
        <Box sx={{ maxWidth: 1600, mx: "auto" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
