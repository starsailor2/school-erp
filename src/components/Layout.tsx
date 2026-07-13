import { useMemo, useState, useEffect } from "react";
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
import LogoutIcon from "@mui/icons-material/Logout";
import { AnimatePresence, motion } from "motion/react";
import { useAuth } from "@/context/AuthContext";
import { useColorMode } from "@/context/ColorModeContext";
import TeacherTypeSwitcher from "@/components/TeacherTypeSwitcher";
import StaffRoleSwitcher from "@/components/StaffRoleSwitcher";
import { getNavItems, type NavItem } from "@/components/navigation";
import { SecondarySidebar } from "@/components/SecondarySidebar";
import { getUnreadNotificationCount } from "@/demo-data/communication/notificationStore";
import { getSidebarTokens, motionEasing, motionDuration, motionEasingCss } from "@/theme/tokens";

const RAIL_WIDTH = 72;
const SECONDARY_WIDTH = 240;
const MOBILE_DRAWER_WIDTH = 280;
const SIDEBAR_TRANSITION_DURATION = 0.3;
const SIDEBAR_TRANSITION_EASING = [0.22, 1, 0.36, 1] as const;
// Chrome icon size (nav rail, secondary sidebar, mobile drawer, AppBar utility
// buttons): 20px per the density amendment — structural icons are smaller and
// monochrome, distinct from the 24px+ domain-colored icons on content surfaces
// like StatCard.
const CHROME_ICON_SX = { "& .MuiSvgIcon-root": { fontSize: 20 } };

export default function Layout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { role, teacherType, staffRole, user, logout } = useAuth();
  const { toggleColorMode, mode } = useColorMode();
  const sidebarTokens = getSidebarTokens(mode);
  const navigate = useNavigate();
  const location = useLocation();

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const toggleSubmenu = (label: string) => setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));

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

  // The active module drives the secondary sidebar: whichever top-level item
  // owns the current route. Exact matches (own path or a listed child's path)
  // are checked first and win outright. Prefix matching — for a detail route
  // nested under a module, e.g. /admin/students/:id, that isn't itself a
  // listed child — is a fallback restricted to items that actually have
  // children: without that restriction, a leaf item with a short path (e.g.
  // Dashboard at "/admin") prefix-matches every other admin route too, and
  // being first in the array, would always win over the real owning module.
  const activeItem = useMemo(() => {
    const exact = navItems.find(
      (item) => location.pathname === item.path || item.children?.some((c) => location.pathname === c.path)
    );
    if (exact) return exact;
    return (
      navItems.find(
        (item) =>
          item.children &&
          (location.pathname.startsWith(`${item.path}/`) ||
            item.children.some((c) => location.pathname.startsWith(`${c.path}/`)))
      ) ?? null
    );
  }, [navItems, location.pathname]);

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

  const handleNav = (path: string) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  const portalLabels: Record<string, string> = {
    admin: "Admin Portal",
    teacher: "Teacher Portal",
    staff: "Staff Portal",
    parent: "Parent Portal",
    student: "Student Portal",
  };

  const hasActiveChild = (item: NavItem) =>
    item.children?.some((c) => location.pathname === c.path || location.pathname.startsWith(`${c.path}/`)) ?? false;
  const isRailSelected = (item: NavItem) => location.pathname === item.path || hasActiveChild(item);

  const railButtonSx = (active: boolean) => ({
    mx: 1,
    borderRadius: 1.5,
    mb: 0.25,
    minHeight: 44,
    justifyContent: "center",
    px: 1.5,
    color: active ? sidebarTokens.activeText : sidebarTokens.muted,
    bgcolor: active ? sidebarTokens.activeBackground : "transparent",
    transition: `background-color ${SIDEBAR_TRANSITION_DURATION}s ${motionEasingCss}, color ${SIDEBAR_TRANSITION_DURATION}s ${motionEasingCss}`,
    "&:hover": { bgcolor: sidebarTokens.hoverBackground, color: sidebarTokens.hoverText },
  });

  const railContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: sidebarTokens.background }}>
      <Box
        sx={{
          p: 2,
          minHeight: 84,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: `1px solid ${sidebarTokens.divider}`,
        }}
      >
        <Avatar sx={{ bgcolor: sidebarTokens.text, color: sidebarTokens.background, width: 36, height: 36, fontSize: 14, fontWeight: 700 }}>
          {user?.name.charAt(0) ?? "U"}
        </Avatar>
      </Box>
      <List sx={{ flex: 1, overflow: "auto", py: 1 }} component="nav">
        {navItems.map((item) => (
          <Tooltip key={item.path} title={item.label} placement="right">
            <motion.div whileTap={{ scale: 0.97 }} transition={{ duration: motionDuration, ease: motionEasing }}>
              <ListItemButton disableRipple onClick={() => handleNav(item.path)} sx={railButtonSx(isRailSelected(item))}>
                <ListItemIcon sx={{ minWidth: "auto", color: "inherit", ...CHROME_ICON_SX }}>
                  {item.icon}
                </ListItemIcon>
              </ListItemButton>
            </motion.div>
          </Tooltip>
        ))}
      </List>
    </Box>
  );

  const renderMobileNavItem = (item: NavItem) => {
    const selected = isRailSelected(item);
    const iconSx = { minWidth: 36, color: "inherit", ...CHROME_ICON_SX };
    if (item.children) {
      const open = openMenus[item.label] ?? hasActiveChild(item);
      return (
        <Box key={item.label}>
          <ListItemButton
            disableRipple
            onClick={() => toggleSubmenu(item.label)}
            sx={{
              mx: 1, borderRadius: 1.5, mb: 0.25, minHeight: 44,
              color: selected ? sidebarTokens.activeText : sidebarTokens.text,
              bgcolor: selected ? sidebarTokens.activeBackground : "transparent",
            }}
          >
            <ListItemIcon sx={iconSx}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14 }} />
            <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: SIDEBAR_TRANSITION_DURATION, ease: SIDEBAR_TRANSITION_EASING }}>
              <ExpandMoreIcon fontSize="small" />
            </motion.div>
          </ListItemButton>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: SIDEBAR_TRANSITION_DURATION, ease: SIDEBAR_TRANSITION_EASING }}
                style={{ overflow: "hidden" }}
              >
                {item.children.map((child) => (
                  <ListItemButton
                    key={child.path}
                    disableRipple
                    onClick={() => handleNav(child.path)}
                    sx={{
                      pl: 3, ml: 4.5, mr: 1, borderRadius: 1.5, mb: 0.25, minHeight: 34,
                      color: location.pathname === child.path ? sidebarTokens.activeText : sidebarTokens.muted,
                      bgcolor: location.pathname === child.path ? sidebarTokens.activeBackground : "transparent",
                    }}
                  >
                    <ListItemText primary={child.label} primaryTypographyProps={{ fontSize: 13 }} />
                  </ListItemButton>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      );
    }
    return (
      <ListItemButton
        key={item.path}
        disableRipple
        onClick={() => handleNav(item.path)}
        sx={{
          mx: 1, borderRadius: 1.5, mb: 0.25, minHeight: 44,
          color: selected ? sidebarTokens.activeText : sidebarTokens.text,
          bgcolor: selected ? sidebarTokens.activeBackground : "transparent",
        }}
      >
        <ListItemIcon sx={iconSx}>{item.icon}</ListItemIcon>
        <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14 }} />
      </ListItemButton>
    );
  };

  const mobileDrawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: sidebarTokens.background }}>
      <Box sx={{ p: 2, minHeight: 84, display: "flex", alignItems: "center", gap: 1.5, borderBottom: `1px solid ${sidebarTokens.divider}` }}>
        <Avatar sx={{ bgcolor: sidebarTokens.text, color: sidebarTokens.background, width: 36, height: 36, fontSize: 14, fontWeight: 700 }}>
          {user?.name.charAt(0) ?? "U"}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap sx={{ color: sidebarTokens.text }}>
            {user?.name ?? "User"}
          </Typography>
          <Typography variant="caption" noWrap sx={{ color: sidebarTokens.muted }}>
            {portalLabels[role]}
          </Typography>
        </Box>
      </Box>
      <List sx={{ flex: 1, overflow: "auto", py: 1 }} component="nav">
        {groups.map(({ group, items }) => (
          <Box key={group || "ungrouped"}>
            {group && (
              <Typography
                variant="caption"
                sx={{
                  display: "block", px: 2.5, pt: 2, pb: 0.5,
                  color: sidebarTokens.muted, fontWeight: 700,
                  letterSpacing: "0.08em", textTransform: "uppercase", fontSize: "0.65rem",
                }}
              >
                {group}
              </Typography>
            )}
            {items.map(renderMobileNavItem)}
          </Box>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{ zIndex: theme.zIndex.drawer + 1, bgcolor: "background.paper", color: "text.primary", borderBottom: 1, borderColor: "divider" }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 1, ...CHROME_ICON_SX }}>
              <MenuIcon sx={{ color: "text.secondary" }} />
            </IconButton>
          )}
          <Typography variant="h6" fontWeight={700} sx={{ mr: 2, letterSpacing: "-0.02em" }} noWrap>
            KALNET
          </Typography>

          {(role === "admin" || role === "staff") && (
            <Box
              sx={{
                display: { xs: "none", sm: "flex" }, alignItems: "center",
                bgcolor: "background.default", border: "1px solid", borderColor: "divider",
                borderRadius: 2, px: 1.5, py: 0.5, mr: "auto", maxWidth: 320, flex: 1,
              }}
            >
              <SearchIcon fontSize="small" sx={{ mr: 0.5, color: "text.secondary" }} />
              <InputBase placeholder="Search students, teachers…" sx={{ flex: 1, fontSize: 14, color: "text.primary" }} />
            </Box>
          )}

          <Box sx={{ flex: 1 }} />
          {role === "teacher" && <TeacherTypeSwitcher />}
          {role === "staff" && <StaffRoleSwitcher />}
          <Tooltip title="Sign Out">
            <IconButton onClick={handleLogout} sx={{ ml: 0.5, ...CHROME_ICON_SX }}>
              <LogoutIcon sx={{ color: "text.secondary" }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Toggle theme">
            <IconButton onClick={toggleColorMode} sx={{ ml: 0.5, ...CHROME_ICON_SX }}>
              {mode === "dark" ? (
                <Brightness7Icon sx={{ color: "text.secondary" }} />
              ) : (
                <Brightness4Icon sx={{ color: "text.secondary" }} />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title="Notifications">
            <IconButton onClick={() => navigate(`/${role}/notifications`)} sx={{ ml: 0.5, ...CHROME_ICON_SX }}>
              <Badge badgeContent={unreadNotifications} color="error">
                <NotificationsIcon sx={{ color: "text.secondary" }} />
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
          sx={{ "& .MuiDrawer-paper": { width: MOBILE_DRAWER_WIDTH, boxSizing: "border-box" } }}
          ModalProps={{ keepMounted: true }}
        >
          {mobileDrawerContent}
        </Drawer>
      ) : (
        <>
          <Drawer
            variant="permanent"
            sx={{
              width: RAIL_WIDTH,
              flexShrink: 0,
              "& .MuiDrawer-paper": { width: RAIL_WIDTH, boxSizing: "border-box", borderRight: "none", mt: "64px", height: "calc(100% - 64px)" },
            }}
          >
            {railContent}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              width: SECONDARY_WIDTH,
              flexShrink: 0,
              "& .MuiDrawer-paper": {
                width: SECONDARY_WIDTH, boxSizing: "border-box", left: RAIL_WIDTH,
                borderRight: `1px solid ${sidebarTokens.divider}`, mt: "64px", height: "calc(100% - 64px)",
              },
            }}
          >
            <SecondarySidebar
              activeItem={activeItem}
              groups={groups}
              sidebarTokens={sidebarTokens}
              currentPath={location.pathname}
              onNavigate={handleNav}
            />
          </Drawer>
        </>
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
