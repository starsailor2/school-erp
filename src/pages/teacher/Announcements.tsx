import { useEffect, useState } from "react";
import {
  Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Grid, Stack, IconButton, Tooltip, Typography, Box,
  Snackbar, Alert, Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CampaignIcon from "@mui/icons-material/Campaign";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { ANNOUNCEMENT_STORE_EVENT, getAnnouncements, saveAnnouncements } from "@/data/announcementStore";
import type { Announcement } from "@/types";

const priorityColor = (p: string) =>
  p === "high" ? "error" : p === "medium" ? "warning" : "default";

export default function TeacherAnnouncements() {
  const [rows, setRows] = useState(() => getAnnouncements());
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [viewing, setViewing] = useState<Announcement | null>(null);
  const [form, setForm] = useState({ title: "", content: "", target: "all" as Announcement["target"], priority: "medium" as Announcement["priority"] });
  const [snack, setSnack] = useState("");

  useEffect(() => {
    const onUpdate = () => setRows(getAnnouncements());
    window.addEventListener(ANNOUNCEMENT_STORE_EVENT, onUpdate);
    return () => window.removeEventListener(ANNOUNCEMENT_STORE_EVENT, onUpdate);
  }, []);

  const filteredRows = rows.filter((a) => a.target === "all" || a.target === "teacher");

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", content: "", target: "all", priority: "medium" });
    setOpen(true);
  };

  const openEdit = (a: Announcement) => {
    setEditing(a);
    setForm({ title: a.title, content: a.content, target: a.target, priority: a.priority });
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (editing) {
      saveAnnouncements(rows.map((a) => a.id === editing.id ? { ...a, ...form } : a));
      setSnack("Announcement updated!");
    } else {
      const newAnn: Announcement = {
        id: `an${Date.now()}`, created_by: "teacher",
        date: new Date().toISOString().split("T")[0], ...form,
      };
      saveAnnouncements([newAnn, ...rows]);
      setSnack("Announcement published!");
    }
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    saveAnnouncements(rows.filter((a) => a.id !== id));
    setSnack("Announcement deleted!");
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <>
      <PageHeader
        title="Announcements"
        breadcrumbs={[{ label: "Dashboard", to: "/teacher" }, { label: "Announcements" }]}
        action={
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={openCreate}>
            New Announcement
          </Button>
        }
      />

      <DataTable
        columns={[
          {
            key: "title", label: "Title",
            render: (a) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }} onClick={() => setViewing(a)}>
                <CampaignIcon fontSize="small" color="primary" />
                <Typography variant="body2" fontWeight={500} color="primary.main" sx={{ "&:hover": { textDecoration: "underline" } }}>{a.title}</Typography>
              </Box>
            ),
          },
          { key: "content", label: "Content", render: (a) => <Typography variant="body2" noWrap sx={{ maxWidth: 260 }}>{a.content}</Typography> },
          { key: "target", label: "For", render: (a) => <Chip label={a.target} size="small" color={a.target === "all" ? "primary" : "info"} /> },
          { key: "priority", label: "Priority", render: (a) => <Chip label={a.priority} size="small" color={priorityColor(a.priority)} variant="outlined" /> },
          { key: "created_by", label: "By", render: (a) => <Chip label={a.created_by === "admin" ? "Principal" : "Teacher"} size="small" variant="outlined" /> },
          { key: "date", label: "Date" },
          {
            key: "id", label: "Actions",
            render: (a) => (
              a.created_by === "admin" ? (
                <Typography variant="caption" color="text.secondary">—</Typography>
              ) : (
                <Stack direction="row" spacing={0.5}>
                  <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(a)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDelete(a.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                </Stack>
              )
            ),
          },
        ]}
        rows={filteredRows}
      />

      {/* View Dialog */}
      <Dialog open={!!viewing} onClose={() => setViewing(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CampaignIcon color="primary" /> {viewing?.title}
        </DialogTitle>
        <DialogContent>
          {viewing && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="body1">{viewing.content}</Typography>
              <Divider />
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Chip label={`Priority: ${viewing.priority}`} size="small" color={priorityColor(viewing.priority)} variant="outlined" />
                <Chip label={`For: ${viewing.target}`} size="small" color={viewing.target === "all" ? "primary" : "info"} />
                <Chip label={`By: ${viewing.created_by === "admin" ? "Principal" : "Teacher"}`} size="small" variant="outlined" />
                <Typography variant="caption" color="text.secondary" sx={{ alignSelf: "center" }}>{viewing.date}</Typography>
              </Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewing(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? "Edit Announcement" : "New Announcement"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}><TextField fullWidth label="Title" value={form.title} onChange={set("title")} /></Grid>
            <Grid size={12}><TextField fullWidth label="Content" multiline rows={3} value={form.content} onChange={set("content")} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth select label="Target Audience" value={form.target} onChange={set("target")}>
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="student">Students</MenuItem>
                <MenuItem value="parent">Parents</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth select label="Priority" value={form.priority} onChange={set("priority")}>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>{editing ? "Update" : "Publish"}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack("")}>
        <Alert severity="success" onClose={() => setSnack("")}>{snack}</Alert>
      </Snackbar>
    </>
  );
}
