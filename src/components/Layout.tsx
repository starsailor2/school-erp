// src/components/Layout.tsx
import { useState, useMemo, useEffect, useRef } from "react";
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
import { getUnreadNotificationCount } from "@/demo-data/communication/notificationStore";
import { getSidebarTokens, motionEasing, motionDuration, motionEasingCss } from "@/theme/tokens";
import { getChartPalette } from "@/theme/chartPalette";
 
const DRAWER_WIDTH = 260;
const RAIL_WIDTH = 72;
const SIDEBAR_TRANSITION_DURATION = 0.42;
const SIDEBAR_TRANSITION_EASING = [0.22, 1, 0.36, 1] as const;
const SIDEBAR_HEADER_MIN_HEIGHT = 84;

export default function Layout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { role, teacherType, staffRole, user, logout } = useAuth();
  const { toggleColorMode, mode } = useColorMode();
  const sidebarTokens = getSidebarTokens(mode);
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem(`erp-sidebar-${role}`) === "collapsed";
  });
  useEffect(() => {
    localStorage.setItem(`erp-sidebar-${role}`, collapsed ? "collapsed" : "expanded");
  }, [collapsed, role]);

  const [hovered, setHovered] = useState(false);
  const hoverTimeoutRef = useRef<number | null>(null);
  useEffect(() => () => {
    if (hoverTimeoutRef.current) window.clearTimeout(hoverTimeoutRef.current);
  }, []);
  const handleSidebarMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      window.clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHovered(true);
  };
  const handleSidebarMouseLeave = () => {
    hoverTimeoutRef.current = window.setTimeout(() => setHovered(false), 200);
  };

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const toggleGroup = (g: string) => setCollapsedGroups((prev) => ({ ...prev, [g]: !prev[g] }));

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

  // hasActiveChild: does this section contain the current route — drives
  // auto-expanding the accordion, nothing else.
  const hasActiveChild = (item: NavItem) => {
    if (!item.children) return false;
    return item.children.some((c) => location.pathname === c.path);
  };

  // isSelected: should THIS button show the selected pill. A parent with
  // children only looks selected in rail mode, where it's the sole visual
  // cue and there's no child list on screen — in expanded mode, selection
  // belongs only to whichever specific child route is actually active, so
  // opening a sub-route (e.g. Parent Linking) doesn't also light up Students.
  const isSelected = (item: NavItem) => {
    if (item.children) {
      return showRail && (location.pathname === item.path || hasActiveChild(item));
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

  // railPinned: the persisted user preference. showRail: what's actually rendered
  // right now — hovering over a pinned-collapsed sidebar temporarily reveals it
  // as an overlay without disturbing the pinned preference or reflowing the page.
  const railPinned = collapsed && !isMobile;
  const showRail = railPinned && !hovered;
  const isHoverOverlay = railPinned && hovered;

  const navButtonSx = (active: boolean) => ({
    mx: 1,
    borderRadius: 1.5,
    mb: 0.25,
    minHeight: 44,
    py: 1,
    color: active ? sidebarTokens.activeText : sidebarTokens.text,
    fontWeight: active ? 700 : 500,
    justifyContent: showRail ? "center" : "flex-start",
    px: showRail ? 1.5 : 2,
    borderLeft: "3px solid transparent",
    transition: `background-color ${SIDEBAR_TRANSITION_DURATION}s ${motionEasingCss}, color ${SIDEBAR_TRANSITION_DURATION}s ${motionEasingCss}, border-color ${SIDEBAR_TRANSITION_DURATION}s ${motionEasingCss}`,
    "&:hover": {
      bgcolor: sidebarTokens.hoverBackground,
      color: sidebarTokens.hoverText,
    },
    ...(active && {
      bgcolor: sidebarTokens.activeBackground,
      color: sidebarTokens.activeText,
      borderLeftColor: sidebarTokens.text,
      "&:hover": {
        bgcolor: sidebarTokens.activeBackground,
        color: sidebarTokens.activeText,
      },
    }),
  });

  // Every nav item gets a stable accent color from the app's own validated
  // chart palette (already contrast-checked against these exact surfaces),
  // hashed from its path so the same feature keeps the same color across
  // portals. Keeps the "colorful icon" idea from the reference without
  // introducing new, unvetted hues into an otherwise monochrome app.
  const palette = getChartPalette(mode);
  const iconColorFor = (key: string) => {
    let hash = 0;
    for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    return palette.categorical[hash % palette.categorical.length];
  };

  const renderNavItem = (item: NavItem) => {
    const selected = isSelected(item);
    const iconColor = iconColorFor(item.path);
    if (item.children) {
      const open = !showRail && (openMenus[item.label] ?? hasActiveChild(item));
      return (
        <Box key={item.label}>
          <Tooltip title={showRail ? item.label : ""} placement="right">
            <motion.div whileTap={{ scale: 0.97 }} transition={{ duration: SIDEBAR_TRANSITION_DURATION, ease: SIDEBAR_TRANSITION_EASING }}>
              <ListItemButton
                disableRipple
                onClick={() => (showRail ? handleNav(item.path) : toggleSubmenu(item.label))}
                sx={navButtonSx(selected)}
              >
                <ListItemIcon
                  sx={{
                    minWidth: showRail ? "auto" : 36,
                    color: `${iconColor} !important`,
                    opacity: 1,
                    "& .MuiSvgIcon-root": {
                      color: `${iconColor} !important`,
                      opacity: 1,
                    },
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!showRail && (
                  <>
                    <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14 }} />
                    <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: SIDEBAR_TRANSITION_DURATION, ease: SIDEBAR_TRANSITION_EASING }}>
                      <ExpandMoreIcon fontSize="small" />
                    </motion.div>
                  </>
                )}
              </ListItemButton>
            </motion.div>
          </Tooltip>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: SIDEBAR_TRANSITION_DURATION, ease: SIDEBAR_TRANSITION_EASING }}
                style={{ overflow: "hidden" }}
              >
                <List disablePadding sx={{ position: "relative" }}>
                  <Box
                    aria-hidden
                    sx={{ position: "absolute", left: 28, top: 4, bottom: 4, width: "1px", bgcolor: sidebarTokens.divider }}
                  />
                  {item.children.map((child) => {
                    const childActive = location.pathname === child.path;
                    return (
                      <motion.div
                        key={child.path}
                        whileTap={{ scale: 0.97 }}
                        transition={{ duration: SIDEBAR_TRANSITION_DURATION, ease: SIDEBAR_TRANSITION_EASING }}
                      >
                        <ListItemButton
                          disableRipple
                          onClick={() => handleNav(child.path)}
                          sx={{
                            pl: 6.5,
                            mx: 1,
                            borderRadius: 1.5,
                            mb: 0.25,
                            minHeight: 40,
                            py: 0.75,
                            color: sidebarTokens.muted,
                            borderLeft: "3px solid transparent",
                            transition: `background-color ${motionDuration}s ${motionEasingCss}, color ${motionDuration}s ${motionEasingCss}, border-color ${motionDuration}s ${motionEasingCss}`,
                            "&:hover": { bgcolor: sidebarTokens.hoverBackground, color: sidebarTokens.hoverText },
                            ...(childActive && {
                              bgcolor: sidebarTokens.activeBackground,
                              color: sidebarTokens.activeText,
                              borderLeftColor: sidebarTokens.text,
                              fontWeight: 600,
                            }),
                          }}
                        >
                          <ListItemText primary={child.label} primaryTypographyProps={{ fontSize: 13 }} />
                        </ListItemButton>
                      </motion.div>
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
        <motion.div whileTap={{ scale: 0.97 }} transition={{ duration: motionDuration, ease: motionEasing }}>
          <ListItemButton disableRipple onClick={() => handleNav(item.path)} sx={navButtonSx(selected)}>
            <ListItemIcon
              sx={{
                minWidth: showRail ? "auto" : 36,
                color: `${iconColor} !important`,
                opacity: 1,
                "& .MuiSvgIcon-root": {
                  color: `${iconColor} !important`,
                  opacity: 1,
                },
              }}
            >
              {item.icon}
            </ListItemIcon>
            {!showRail && <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14 }} />}
          </ListItemButton>
        </motion.div>
      </Tooltip>
    );
  };

  const drawerContent = (
    <Box
      onMouseEnter={handleSidebarMouseEnter}
      onMouseLeave={handleSidebarMouseLeave}
      sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: sidebarTokens.background, gap: 1.5 }}
    >
      <Box
        sx={{
          p: 2,
          minHeight: SIDEBAR_HEADER_MIN_HEIGHT,
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
              <Box
                onClick={() => toggleGroup(group)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  userSelect: "none",
                  px: 2.5,
                  pt: 2,
                  pb: 0.5,
                  "&:hover .sidebar-group-label": { color: sidebarTokens.text },
                }}
              >
                <Typography
                  variant="caption"
                  className="sidebar-group-label"
                  sx={{
                    color: sidebarTokens.muted,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    fontSize: "0.65rem",
                    transition: `color ${SIDEBAR_TRANSITION_DURATION}s ${motionEasingCss}`,
                  }}
                >
                  {group}
                </Typography>
                <motion.div
                  animate={{ rotate: collapsedGroups[group] ? -90 : 0 }}
                  transition={{ duration: SIDEBAR_TRANSITION_DURATION, ease: SIDEBAR_TRANSITION_EASING }}
                  style={{ display: "flex", color: sidebarTokens.muted }}
                >
                  <ExpandMoreIcon sx={{ fontSize: 16 }} />
                </motion.div>
              </Box>
            )}
            {showRail ? (
              items.map(renderNavItem)
            ) : (
              <AnimatePresence initial={false}>
                {!collapsedGroups[group] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: SIDEBAR_TRANSITION_DURATION, ease: SIDEBAR_TRANSITION_EASING }}
                    style={{ overflow: "hidden" }}
                  >
                    {items.map(renderNavItem)}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </Box>
        ))}
      </List>

      {!isMobile && (
        <Box sx={{ borderTop: `1px solid ${sidebarTokens.divider}`, p: 1 }}>
          <Tooltip title={collapsed ? "Pin sidebar open" : "Collapse sidebar"} placement="right">
            <IconButton
              onClick={() => setCollapsed((c) => !c)}
              sx={{ color: sidebarTokens.muted, width: "100%", borderRadius: 1.5, "&:hover": { bgcolor: sidebarTokens.hoverBackground } }}
            >
              {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );

  // The docked drawer root reserves space for the main content based only on
  // the pinned preference, so a hover-preview never reflows the page. The
  // paper itself (position: fixed) can still grow wider than that reserved
  // strip and float over the content as an overlay while hovered.
  const reservedWidth = railPinned ? RAIL_WIDTH : DRAWER_WIDTH;
  const paperWidth = showRail ? RAIL_WIDTH : DRAWER_WIDTH;

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
              <MenuIcon sx={{ color: iconColorFor("menu") }} />
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
                bgcolor: "background.default",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                px: 1.5,
                py: 0.5,
                mr: "auto",
                maxWidth: 320,
                flex: 1,
              }}
            >
              <SearchIcon fontSize="small" sx={{ mr: 0.5, color: iconColorFor("search") }} />
              <InputBase placeholder="Search students, teachers…" sx={{ flex: 1, fontSize: 14, color: "text.primary" }} />
            </Box>
          )}

          <Box sx={{ flex: 1 }} />
          {role === "teacher" && <TeacherTypeSwitcher />}
          {role === "staff" && <StaffRoleSwitcher />}
          <Tooltip title="Sign Out">
            <IconButton onClick={handleLogout} sx={{ ml: 0.5 }}>
              <LogoutIcon sx={{ color: iconColorFor("logout") }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Toggle theme">
            <IconButton onClick={toggleColorMode} sx={{ ml: 0.5 }}>
              {mode === "dark" ? (
                <Brightness7Icon sx={{ color: iconColorFor("theme") }} />
              ) : (
                <Brightness4Icon sx={{ color: iconColorFor("theme") }} />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title="Notifications">
            <IconButton onClick={() => navigate(`/${role}/notifications`)} sx={{ ml: 0.5 }}>
              <Badge badgeContent={unreadNotifications} color="error">
                <NotificationsIcon sx={{ color: iconColorFor("notifications") }} />
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
            width: reservedWidth,
            flexShrink: 0,
            transition: `width ${SIDEBAR_TRANSITION_DURATION}s ${motionEasingCss}`,
            "& .MuiDrawer-paper": {
              width: paperWidth,
              boxSizing: "border-box",
              borderRight: "none",
              mt: "64px",
              height: "calc(100% - 64px)",
              transition: `width ${SIDEBAR_TRANSITION_DURATION}s ${motionEasingCss}, box-shadow ${SIDEBAR_TRANSITION_DURATION}s ${motionEasingCss}`,
              overflowX: "hidden",
              boxShadow: isHoverOverlay
                ? theme.palette.mode === "light"
                  ? "8px 0 32px rgba(0,0,0,0.16)"
                  : "8px 0 32px rgba(0,0,0,0.6)"
                : "none",
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
          minWidth: 0,
          p: 3,
          mt: "64px",
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
