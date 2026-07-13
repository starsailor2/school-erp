import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import type { NavItem } from "@/components/navigation";
import type { SidebarTokens } from "@/theme/tokens";

interface SecondarySidebarProps {
  activeItem: NavItem | null;
  groups: { group: string; items: NavItem[] }[];
  sidebarTokens: SidebarTokens;
  currentPath: string;
  onNavigate: (path: string) => void;
}

const rowSx = (tokens: SidebarTokens, active: boolean) => ({
  mx: 1,
  mb: 0.25,
  borderRadius: 1.5,
  minHeight: 34,
  color: active ? tokens.activeText : tokens.text,
  bgcolor: active ? tokens.activeBackground : "transparent",
  fontWeight: active ? 600 : 500,
  "&:hover": { bgcolor: tokens.hoverBackground, color: tokens.hoverText },
});

export function SecondarySidebar({ activeItem, groups, sidebarTokens, currentPath, onNavigate }: SecondarySidebarProps) {
  const contextual = Boolean(activeItem?.children && activeItem.children.length > 0);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: sidebarTokens.background }}>
      <Box
        sx={{
          p: 2,
          minHeight: 84,
          display: "flex",
          alignItems: "center",
          borderBottom: `1px solid ${sidebarTokens.divider}`,
        }}
      >
        <Typography variant="subtitle1" fontWeight={700} sx={{ color: sidebarTokens.text }}>
          {contextual ? activeItem!.label : "Menu"}
        </Typography>
      </Box>
      <List sx={{ flex: 1, overflow: "auto", py: 1 }}>
        {contextual
          ? activeItem!.children!.map((child) => (
              <ListItemButton
                key={child.path}
                disableRipple
                onClick={() => onNavigate(child.path)}
                sx={rowSx(sidebarTokens, currentPath === child.path)}
              >
                <ListItemText primary={child.label} primaryTypographyProps={{ fontSize: 13 }} />
              </ListItemButton>
            ))
          : groups.map(({ group, items }) => (
              <Box key={group || "ungrouped"}>
                {group && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      px: 2.5,
                      pt: 2,
                      pb: 0.5,
                      color: sidebarTokens.muted,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      fontSize: "0.65rem",
                    }}
                  >
                    {group}
                  </Typography>
                )}
                {items.map((item) => (
                  <ListItemButton
                    key={item.path}
                    disableRipple
                    onClick={() => onNavigate(item.path)}
                    sx={rowSx(sidebarTokens, currentPath === item.path)}
                  >
                    <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 13 }} />
                  </ListItemButton>
                ))}
              </Box>
            ))}
      </List>
    </Box>
  );
}
