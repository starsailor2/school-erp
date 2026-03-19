import { useEffect, useState } from "react";
import {
  Paper, Stack, Typography, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Divider, Box,
} from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { ANNOUNCEMENT_STORE_EVENT, getAnnouncements } from "@/data/announcementStore";
import type { Announcement } from "@/types";

export default function ParentAnnouncements() {
  const [rows, setRows] = useState(() => getAnnouncements());
  const filtered = rows.filter((a) => a.target === "all" || a.target === "parent");
  const [viewing, setViewing] = useState<Announcement | null>(null);

  useEffect(() => {
    const onUpdate = () => setRows(getAnnouncements());
    window.addEventListener(ANNOUNCEMENT_STORE_EVENT, onUpdate);
    return () => window.removeEventListener(ANNOUNCEMENT_STORE_EVENT, onUpdate);
  }, []);

  return (
    <>
      <PageHeader title="Announcements" breadcrumbs={[{ label: "Dashboard", to: "/parent" }, { label: "Announcements" }]} />
      <Stack spacing={2}>
        {filtered.map((a) => (
          <Paper key={a.id} sx={{ p: 3, cursor: "pointer", "&:hover": { bgcolor: "action.hover" } }} onClick={() => setViewing(a)}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h6">{a.title}</Typography>
              <Chip label={a.priority} size="small" color={a.priority === "high" ? "error" : a.priority === "medium" ? "warning" : "default"} />
            </Stack>
            <Typography variant="body2" color="text.secondary">{a.date} · Target: {a.target}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }} noWrap>{a.content}</Typography>
          </Paper>
        ))}
        {filtered.length === 0 && (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">No announcements.</Typography>
          </Paper>
        )}
      </Stack>

      {/* Announcement Detail Modal */}
      <Dialog open={!!viewing} onClose={() => setViewing(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{viewing?.title}</DialogTitle>
        <DialogContent>
          {viewing && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Chip label={viewing.priority} size="small" color={viewing.priority === "high" ? "error" : viewing.priority === "medium" ? "warning" : "default"} />
                <Chip label={`Target: ${viewing.target}`} size="small" variant="outlined" />
              </Box>
              <Typography variant="body2" color="text.secondary">Date: {viewing.date}</Typography>
              <Divider />
              <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>{viewing.content}</Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewing(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
