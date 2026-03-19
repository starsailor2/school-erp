import { useEffect, useState } from "react";
import {
  Paper, Stack, Typography, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, Divider, Box,
} from "@mui/material";
import CampaignIcon from "@mui/icons-material/Campaign";
import { PageHeader } from "@/components/PageHeader";
import { ANNOUNCEMENT_STORE_EVENT, getAnnouncements } from "@/data/announcementStore";
import type { Announcement } from "@/types";

export default function StudentAnnouncements() {
  const [rows, setRows] = useState(() => getAnnouncements());
  const filtered = rows.filter((a) => a.target === "all" || a.target === "student");
  const [viewing, setViewing] = useState<Announcement | null>(null);

  useEffect(() => {
    const onUpdate = () => setRows(getAnnouncements());
    window.addEventListener(ANNOUNCEMENT_STORE_EVENT, onUpdate);
    return () => window.removeEventListener(ANNOUNCEMENT_STORE_EVENT, onUpdate);
  }, []);

  return (
    <>
      <PageHeader title="Announcements" breadcrumbs={[{ label: "Dashboard", to: "/student" }, { label: "Announcements" }]} />
      {filtered.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <CampaignIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
          <Typography color="text.secondary">No announcements</Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {filtered.map((a) => (
            <Paper
              key={a.id}
              sx={{ p: 2, cursor: "pointer", "&:hover": { bgcolor: "action.hover" } }}
              onClick={() => setViewing(a)}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CampaignIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle1" fontWeight={500} color="primary.main" sx={{ "&:hover": { textDecoration: "underline" } }}>
                    {a.title}
                  </Typography>
                </Box>
                <Chip label={a.priority} size="small" color={a.priority === "high" ? "error" : a.priority === "medium" ? "warning" : "default"} variant="outlined" />
              </Stack>
              <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: "80%" }}>{a.content}</Typography>
              <Typography variant="caption" color="text.secondary">{a.date}</Typography>
            </Paper>
          ))}
        </Stack>
      )}

      {/* Detail Modal */}
      <Dialog open={!!viewing} onClose={() => setViewing(null)} maxWidth="sm" fullWidth>
        {viewing && (
          <>
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CampaignIcon color="primary" /> {viewing.title}
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <Typography variant="body1">{viewing.content}</Typography>
                <Divider />
                <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                  <Chip label={`Priority: ${viewing.priority}`} size="small" color={viewing.priority === "high" ? "error" : viewing.priority === "medium" ? "warning" : "default"} variant="outlined" />
                  <Chip label={`For: ${viewing.target}`} size="small" color={viewing.target === "all" ? "primary" : "info"} />
                  <Typography variant="caption" color="text.secondary" sx={{ alignSelf: "center" }}>{viewing.date}</Typography>
                </Stack>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewing(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}
