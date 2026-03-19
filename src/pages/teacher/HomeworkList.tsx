import { useState } from "react";
import {
  Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, MenuItem, Stack, IconButton, Tooltip, Snackbar, Alert,
  Typography, Box,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { useAuth } from "@/context/AuthContext";
import { teachers, homework as initialHomework, getClassName, getSubjectName, getTeacherClasses } from "@/data/mock";
import type { Homework } from "@/types";

export default function HomeworkList() {
  const { user } = useAuth();
  const teacher = teachers.find((t) => t.id === user?.id);
  const allocations = teacher ? getTeacherClasses(teacher.id) : [];
  const classIds = [...new Set(allocations.map((a) => a.class_id))];

  const [rows, setRows] = useState(initialHomework.filter((h) => h.teacher_id === teacher?.id));
  const [classFilter, setClassFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editing, setEditing] = useState<Homework | null>(null);
  const [viewing, setViewing] = useState<Homework | null>(null);
  const [form, setForm] = useState({ title: "", description: "", due_date: "", class_id: classIds[0] ?? "", subject_id: teacher?.subjects[0] ?? "" });
  const [snack, setSnack] = useState("");

  const filtered = classFilter ? rows.filter((h) => h.class_id === classFilter) : rows;

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", description: "", due_date: "", class_id: classIds[0] ?? "", subject_id: teacher?.subjects[0] ?? "" });
    setOpen(true);
  };

  const openEdit = (h: Homework) => {
    setEditing(h);
    setForm({ title: h.title, description: h.description, due_date: h.due_date, class_id: h.class_id, subject_id: h.subject_id });
    setOpen(true);
  };

  const openView = (h: Homework) => { setViewing(h); setViewOpen(true); };

  const handleSave = () => {
    if (!form.title.trim() || !form.due_date) return;
    if (editing) {
      setRows((r) => r.map((h) => h.id === editing.id ? { ...h, ...form } : h));
      setSnack("Homework updated successfully!");
    } else {
      const newHw: Homework = {
        id: `hw${Date.now()}`, section_id: `${form.class_id}-s0`, teacher_id: teacher?.id ?? "",
        assigned_date: new Date().toISOString().split("T")[0], ...form,
      };
      setRows((r) => [newHw, ...r]);
      setSnack("Homework created successfully!");
    }
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    setRows((r) => r.filter((h) => h.id !== id));
    setSnack("Homework deleted!");
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      <PageHeader
        title="Homework List"
        breadcrumbs={[{ label: "Dashboard", to: "/teacher" }, { label: "Homework" }, { label: "List" }]}
        action={
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={openCreate}>
            New Homework
          </Button>
        }
      />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select size="small" label="Filter by Class" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
            <MenuItem value="">All Classes</MenuItem>
            {classIds.map((cid) => <MenuItem key={cid} value={cid}>{getClassName(cid)}</MenuItem>)}
          </TextField>
        </Grid>
      </Grid>
      <DataTable
        columns={[
          { key: "title", label: "Title", render: (h) => <Typography variant="body2" fontWeight={500}>{h.title}</Typography> },
          { key: "class_id", label: "Class", render: (h) => getClassName(h.class_id) },
          { key: "subject_id", label: "Subject", render: (h) => <Chip label={getSubjectName(h.subject_id)} size="small" variant="outlined" /> },
          { key: "due_date", label: "Due Date", render: (h) => <Chip label={h.due_date} size="small" color={h.due_date < today ? "error" : h.due_date === today ? "warning" : "default"} variant="outlined" /> },
          { key: "assigned_date", label: "Created" },
          {
            key: "id", label: "Actions",
            render: (h) => (
              <Stack direction="row" spacing={0.5}>
                <Tooltip title="View"><IconButton size="small" onClick={() => openView(h)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(h)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDelete(h.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
              </Stack>
            ),
          },
        ]}
        rows={filtered}
      />

      {/* Create / Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? "Edit Homework" : "New Homework"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth select label="Class" value={form.class_id} onChange={set("class_id")}>
                {classIds.map((cid) => <MenuItem key={cid} value={cid}>{getClassName(cid)}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth select label="Subject" value={form.subject_id} onChange={set("subject_id")}>
                {teacher?.subjects.map((sid) => <MenuItem key={sid} value={sid}>{getSubjectName(sid)}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={12}><TextField fullWidth label="Title" value={form.title} onChange={set("title")} /></Grid>
            <Grid size={12}><TextField fullWidth label="Description" multiline rows={3} value={form.description} onChange={set("description")} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth type="date" label="Due Date" value={form.due_date} onChange={set("due_date")} slotProps={{ inputLabel: { shrink: true } }} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>{editing ? "Update" : "Create"}</Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Homework Details</DialogTitle>
        <DialogContent>
          {viewing && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box><Typography variant="caption" color="text.secondary">Title</Typography><Typography fontWeight={500}>{viewing.title}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Description</Typography><Typography>{viewing.description}</Typography></Box>
              <Grid container spacing={2}>
                <Grid size={6}><Typography variant="caption" color="text.secondary">Class</Typography><Typography>{getClassName(viewing.class_id)}</Typography></Grid>
                <Grid size={6}><Typography variant="caption" color="text.secondary">Subject</Typography><Typography>{getSubjectName(viewing.subject_id)}</Typography></Grid>
                <Grid size={6}><Typography variant="caption" color="text.secondary">Due Date</Typography><Typography>{viewing.due_date}</Typography></Grid>
                <Grid size={6}><Typography variant="caption" color="text.secondary">Assigned</Typography><Typography>{viewing.assigned_date}</Typography></Grid>
              </Grid>
            </Stack>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setViewOpen(false)}>Close</Button></DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack("")}>
        <Alert severity="success" onClose={() => setSnack("")}>{snack}</Alert>
      </Snackbar>
    </>
  );
}
