import { useState } from "react";
import {
  Paper, Typography, Box, MenuItem, TextField, Chip, Grid, Stack,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Tooltip,
  Snackbar, Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { useAuth } from "@/context/AuthContext";
import {
  teachers, subjects, subjectAllocations as initialAllocations, getClassName, getSubjectName,
} from "@/data/mock";
import type { SubjectAllocation as SubjectAllocationType } from "@/types";

export default function SubjectAllocation() {
  const { user } = useAuth();
  const teacher = teachers.find((t) => t.id === user?.id);
  const department = teacher?.department ?? "";
  const deptSubjects = subjects.filter((s) => s.department === department);
  const deptSubjectIds = deptSubjects.map((s) => s.id);
  const deptTeachers = teachers.filter((t) => t.department === department);

  const [allocations, setAllocations] = useState(
    initialAllocations.filter((a) => deptSubjectIds.includes(a.subject_id))
  );
  const [subjectFilter, setSubjectFilter] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<SubjectAllocationType | null>(null);
  const [form, setForm] = useState({ teacher_id: "", periods_per_week: 4 });
  const [snack, setSnack] = useState("");

  const filtered = subjectFilter
    ? allocations.filter((a) => a.subject_id === subjectFilter)
    : allocations;

  const openEdit = (row: SubjectAllocationType) => {
    setEditing(row);
    setForm({ teacher_id: row.teacher_id, periods_per_week: row.periods_per_week });
    setEditOpen(true);
  };

  const handleSave = () => {
    if (!editing) return;
    setAllocations((prev) =>
      prev.map((a) => a.id === editing.id ? { ...a, teacher_id: form.teacher_id, periods_per_week: form.periods_per_week } : a)
    );
    setEditOpen(false);
    setSnack("Allocation updated!");
  };

  const columns = [
    {
      key: "class_id", label: "Class",
      render: (row: SubjectAllocationType) => getClassName(row.class_id),
    },
    {
      key: "section_id", label: "Section",
      render: (row: SubjectAllocationType) => row.section_id.split("-")[1]?.toUpperCase() ?? row.section_id,
    },
    {
      key: "subject_id", label: "Subject",
      render: (row: SubjectAllocationType) => (
        <Chip label={getSubjectName(row.subject_id)} size="small" />
      ),
    },
    {
      key: "teacher_id", label: "Teacher",
      render: (row: SubjectAllocationType) => {
        const t = teachers.find((tc) => tc.id === row.teacher_id);
        return t?.name ?? "—";
      },
    },
    {
      key: "periods_per_week", label: "Periods/Week",
      render: (row: SubjectAllocationType) => row.periods_per_week,
    },
    {
      key: "id", label: "Actions",
      render: (row: SubjectAllocationType) => (
        <Tooltip title="Edit Allocation">
          <IconButton size="small" onClick={() => openEdit(row)}><EditIcon fontSize="small" /></IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Subject Allocation"
        breadcrumbs={[
          { label: "Dashboard", to: "/teacher" },
          { label: "Department", to: "/teacher/department" },
          { label: "Subject Allocation" },
        ]}
      />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select size="small" label="Filter by Subject" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
            <MenuItem value="">All Subjects</MenuItem>
            {deptSubjects.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 8 }}>
          <Paper sx={{ p: 1.5, display: "flex", gap: 3 }}>
            <Typography variant="body2"><strong>{department}</strong> Department</Typography>
            <Typography variant="body2">{allocations.length} Allocations</Typography>
            <Typography variant="body2">{deptSubjects.length} Subjects</Typography>
          </Paper>
        </Grid>
      </Grid>

      <DataTable
        rows={filtered}
        columns={columns}
      />

      {/* Summary per subject */}
      <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 3, mb: 1 }}>
        Subject Summary
      </Typography>
      <Grid container spacing={2}>
        {deptSubjects.map((subj) => {
          const subjAllocs = allocations.filter((a) => a.subject_id === subj.id);
          const uniqueTeachers = [...new Set(subjAllocs.map((a) => a.teacher_id))];
          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={subj.id}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>{subj.name}</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip label={`${subjAllocs.length} classes`} size="small" variant="outlined" />
                  <Chip label={`${uniqueTeachers.length} teachers`} size="small" variant="outlined" />
                </Stack>
                <Box sx={{ mt: 1 }}>
                  {uniqueTeachers.map((tid) => {
                    const t = teachers.find((tc) => tc.id === tid);
                    return (
                      <Typography key={tid} variant="caption" display="block" color="text.secondary">
                        {t?.name ?? "Unknown"}
                      </Typography>
                    );
                  })}
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Edit Allocation</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {editing && (
              <Typography variant="body2" color="text.secondary">
                {getClassName(editing.class_id)} — {getSubjectName(editing.subject_id)}
              </Typography>
            )}
            <TextField
              fullWidth select label="Teacher"
              value={form.teacher_id}
              onChange={(e) => setForm((f) => ({ ...f, teacher_id: e.target.value }))}
            >
              {deptTeachers.map((t) => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
            </TextField>
            <TextField
              fullWidth type="number" label="Periods per Week"
              value={form.periods_per_week}
              onChange={(e) => setForm((f) => ({ ...f, periods_per_week: Math.max(1, parseInt(e.target.value) || 1) }))}
              slotProps={{ input: { inputProps: { min: 1, max: 10 } } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack("")}>
        <Alert severity="success" onClose={() => setSnack("")}>{snack}</Alert>
      </Snackbar>
    </>
  );
}
