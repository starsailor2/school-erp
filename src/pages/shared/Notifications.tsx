import { useState } from "react";
import { Paper, Typography, Box, Chip, Stack, Divider, Button } from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { getNotifications, resetNotifications, saveNotifications } from "@/data/notificationStore";

export default function Notifications() {
  const [rows, setRows] = useState(getNotifications);

  const markRead = (id: string) => {
    const next = rows.map((n) => (n.id === id ? { ...n, read: true } : n));
    setRows(next);
    saveNotifications(next);
  };

  const markAllRead = () => {
    const next = rows.map((n) => ({ ...n, read: true }));
    setRows(next);
    saveNotifications(next);
  };

  const clearAll = () => {
    setRows([]);
    saveNotifications([]);
  };

  const restoreDefaults = () => {
    resetNotifications();
    setRows(getNotifications());
  };

  return (
    <>
      <PageHeader title="Notifications" />
      <Paper sx={{ p: 2, maxWidth: 700 }}>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Button size="small" variant="outlined" onClick={markAllRead} disabled={rows.length === 0}>
            Mark all as read
          </Button>
          <Button size="small" variant="outlined" color="warning" onClick={clearAll} disabled={rows.length === 0}>
            Clear all
          </Button>
          <Button size="small" variant="text" onClick={restoreDefaults}>
            Restore defaults
          </Button>
        </Stack>
        <Stack spacing={0}>
          {rows.map((n, i) => (
            <Box key={n.id}>
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: n.read ? "transparent" : "action.hover",
                  borderRadius: 1,
                  cursor: n.read ? "default" : "pointer",
                }}
                onClick={() => !n.read && markRead(n.id)}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                  <Typography variant="subtitle2" fontWeight={n.read ? 400 : 600}>
                    {n.title}
                  </Typography>
                  <Chip label={n.type} size="small" variant="outlined" />
                </Box>
                <Typography variant="body2" color="text.secondary">{n.message}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(n.timestamp).toLocaleString()}
                </Typography>
              </Box>
              {i < rows.length - 1 && <Divider />}
            </Box>
          ))}
          {rows.length === 0 && <Typography color="text.secondary">No notifications</Typography>}
        </Stack>
      </Paper>
    </>
  );
}
