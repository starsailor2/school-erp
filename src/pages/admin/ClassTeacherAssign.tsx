import { useMemo, useState } from "react";
import {
  Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  Grid, MenuItem, Paper, TextField, Typography,
} from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { teachers, classes } from "@/demo-data";

type AssignmentRow = {
  id: string;
  classId: string;
  className: string;
  section: string;
  teacherId: string;
  teacherName: string;
  studentCount: number;
  type: string;
};

export default function ClassTeacherAssign() {
  const [rows, setRows] = useState<AssignmentRow[]>(classes.flatMap((c) =>
    c.sections.map((s) => {
      const teacher = teachers.find((t) => t.id === s.class_teacher_id);
      return {
        id: s.id,
        classId: c.id,
        className: c.name,
        section: s.name,
        teacherId: teacher?.id ?? "",
        teacherName: teacher?.name ?? "Unassigned",
        studentCount: s.student_count,
        type: teacher?.teacher_type ?? "—",
      };
    })
  ));
  const [classFilter, setClassFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [teacherId, setTeacherId] = useState("");

  const classTeachers = teachers.filter((t) => t.teacher_type === "class_teacher" || t.teacher_type === "hod");

  const filtered = useMemo(
    () => rows
      .filter((r) => classFilter === "all" || r.classId === classFilter)
      .filter((r) => `${r.className} ${r.section} ${r.teacherName}`.toLowerCase().includes(query.toLowerCase())),
    [rows, classFilter, query]
  );

  const openReassign = (row: AssignmentRow) => {
    setEditingId(row.id);
    setTeacherId(row.teacherId);
    setOpen(true);
  };

  const handleSave = () => {
    const selected = classTeachers.find((t) => t.id === teacherId);
    if (!selected) return;
    setRows((prev) => prev.map((row) => (
      row.id === editingId
        ? { ...row, teacherId: selected.id, teacherName: selected.name, type: selected.teacher_type }
        : row
    )));
    setOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Class Teacher Assignment"
        breadcrumbs={[
          { label: "Dashboard", to: "/admin" },
          { label: "Teachers", to: "/admin/teachers" },
          { label: "Class Teacher Assignment" },
        ]}
      />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField fullWidth size="small" label="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField fullWidth select size="small" label="Class" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
            <MenuItem value="all">All Classes</MenuItem>
            {classes.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 1.5, height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">Visible Sections</Typography>
            <Chip label={filtered.length} size="small" color="primary" />
          </Paper>
        </Grid>
      </Grid>
      <DataTable
        columns={[
          { key: "className", label: "Class" },
          { key: "section", label: "Section" },
          { key: "teacherName", label: "Class Teacher" },
          { key: "studentCount", label: "Students" },
          { key: "type", label: "Teacher Type", render: (r) => <Chip label={r.type.replace("_", " ")} size="small" /> },
          { key: "actions", label: "Actions", render: (r) => <Button size="small" variant="outlined" onClick={() => openReassign(r)}>Reassign</Button> },
        ]}
        rows={filtered}
      />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reassign Class Teacher</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            select
            sx={{ mt: 1 }}
            label="Teacher"
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
          >
            {classTeachers.map((teacher) => (
              <MenuItem key={teacher.id} value={teacher.id}>{teacher.name} ({teacher.teacher_type.replace("_", " ")})</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
