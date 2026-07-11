import { useState } from "react";
import {
  Typography, Stack, Box, Chip, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Grid, MenuItem, IconButton,
  Tooltip, Snackbar, Alert, Avatar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { useAuth } from "@/context/AuthContext";
import { teachers, students, getTeacherClasses } from "@/demo-data";

interface Note {
  id: string;
  studentId: string;
  studentName: string;
  note: string;
  type: "positive" | "concern";
  date: string;
}

const initialNotes: Note[] = [
  { id: "bn1", studentId: "stu1", studentName: "Amit Kumar", note: "Excellent participation in class discussions", type: "positive", date: "2026-03-10" },
  { id: "bn2", studentId: "stu2", studentName: "Riya Kumar", note: "Late submission of homework twice this week", type: "concern", date: "2026-03-09" },
  { id: "bn3", studentId: "stu3", studentName: "Rahul Sharma", note: "Helped organize science fair", type: "positive", date: "2026-03-08" },
  { id: "bn4", studentId: "stu5", studentName: "Arjun Das", note: "Disruptive behavior during lab session", type: "concern", date: "2026-03-07" },
];

export default function BehaviourNotes() {
  const { user } = useAuth();
  const teacher = teachers.find((t) => t.id === user?.id);
  const allocations = teacher ? getTeacherClasses(teacher.id) : [];
  const classIds = [...new Set(allocations.map((a) => a.class_id))];
  const classStudents = students.filter((s) => classIds.includes(s.class_id));

  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [form, setForm] = useState({ studentId: "", note: "", type: "positive" as Note["type"] });
  const [typeFilter, setTypeFilter] = useState("");
  const [snack, setSnack] = useState("");

  const filtered = typeFilter ? notes.filter((n) => n.type === typeFilter) : notes;

  const openCreate = () => {
    setEditing(null);
    setForm({ studentId: classStudents[0]?.id ?? "", note: "", type: "positive" });
    setOpen(true);
  };

  const openEdit = (n: Note) => {
    setEditing(n);
    setForm({ studentId: n.studentId, note: n.note, type: n.type });
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.note.trim() || !form.studentId) return;
    const student = classStudents.find((s) => s.id === form.studentId);
    if (editing) {
      setNotes((r) => r.map((n) => n.id === editing.id ? { ...n, studentId: form.studentId, studentName: student?.name ?? "", note: form.note, type: form.type } : n));
      setSnack("Note updated!");
    } else {
      const newNote: Note = {
        id: `bn${Date.now()}`, studentId: form.studentId,
        studentName: student?.name ?? "", note: form.note, type: form.type,
        date: new Date().toISOString().split("T")[0],
      };
      setNotes((r) => [newNote, ...r]);
      setSnack("Note added!");
    }
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    setNotes((r) => r.filter((n) => n.id !== id));
    setSnack("Note deleted!");
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <>
      <PageHeader
        title="Behaviour Notes"
        breadcrumbs={[{ label: "Dashboard", to: "/teacher" }, { label: "Class Management", to: "/teacher/class-mgmt" }, { label: "Behaviour" }]}
        action={<Button variant="contained" size="small" startIcon={<AddIcon />} onClick={openCreate}>Add Note</Button>}
      />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select size="small" label="Filter by Type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="positive">Positive</MenuItem>
            <MenuItem value="concern">Concern</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      <DataTable
        columns={[
          {
            key: "studentName", label: "Student",
            render: (n) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>{n.studentName.charAt(0)}</Avatar>
                {n.studentName}
              </Box>
            ),
          },
          { key: "note", label: "Note", render: (n) => <Typography variant="body2" sx={{ maxWidth: 300 }}>{n.note}</Typography> },
          { key: "type", label: "Type", render: (n) => <Chip label={n.type} size="small" color={n.type === "positive" ? "success" : "warning"} /> },
          { key: "date", label: "Date" },
          {
            key: "id", label: "Actions",
            render: (n) => (
              <Stack direction="row" spacing={0.5}>
                <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(n)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDelete(n.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
              </Stack>
            ),
          },
        ]}
        rows={filtered}
      />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? "Edit Behaviour Note" : "Add Behaviour Note"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}>
              <TextField fullWidth select label="Student" value={form.studentId} onChange={set("studentId")}>
                {classStudents.map((s) => <MenuItem key={s.id} value={s.id}>{s.name} (Roll #{s.roll_number})</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={12}>
              <TextField fullWidth label="Note" multiline rows={3} value={form.note} onChange={set("note")} />
            </Grid>
            <Grid size={12}>
              <TextField fullWidth select label="Type" value={form.type} onChange={set("type")}>
                <MenuItem value="positive">Positive</MenuItem>
                <MenuItem value="concern">Concern</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>{editing ? "Update" : "Add"}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack("")}>
        <Alert severity="success" onClose={() => setSnack("")}>{snack}</Alert>
      </Snackbar>
    </>
  );
}
