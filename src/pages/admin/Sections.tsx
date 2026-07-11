import { useState } from "react";
import {
  MenuItem, TextField, Grid, Button, Dialog, DialogActions,
  DialogContent, DialogTitle,
} from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { classes, teachers } from "@/demo-data";

type SectionRow = {
  id: string;
  classId: string;
  className: string;
  section: string;
  classTeacher: string;
  studentCount: number;
};

export default function Sections() {
  const [classFilter, setClassFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ classId: "", name: "", classTeacherId: "" });
  const [createdRows, setCreatedRows] = useState<SectionRow[]>([]);

  const baseRows: SectionRow[] = classes
    .filter((c) => classFilter === "all" || c.id === classFilter)
    .flatMap((c) =>
      c.sections.map((s) => {
        const ct = teachers.find((t) => t.id === s.class_teacher_id);
        return {
          id: s.id,
          classId: c.id,
          className: c.name,
          section: s.name,
          classTeacher: ct?.name ?? "—",
          studentCount: s.student_count,
        };
      })
    );

  const rows = [...baseRows, ...createdRows]
    .filter((row) => classFilter === "all" || row.classId === classFilter)
    .filter((row) => `${row.className} ${row.section} ${row.classTeacher}`.toLowerCase().includes(query.toLowerCase()));

  const handleCreate = () => {
    const classItem = classes.find((c) => c.id === form.classId);
    const teacher = teachers.find((t) => t.id === form.classTeacherId);
    if (!classItem || !form.name.trim()) return;
    setCreatedRows((prev) => [
      ...prev,
      {
        id: `${form.classId}-new-${Date.now()}`,
        classId: classItem.id,
        className: classItem.name,
        section: form.name.trim().toUpperCase(),
        classTeacher: teacher?.name ?? "—",
        studentCount: 0,
      },
    ]);
    setOpen(false);
    setForm({ classId: "", name: "", classTeacherId: "" });
  };

  return (
    <>
      <PageHeader
        title="Sections"
        breadcrumbs={[
          { label: "Dashboard", to: "/admin" },
          { label: "Academics" },
          { label: "Sections" },
        ]}
        action={<Button variant="contained" size="small" onClick={() => setOpen(true)}>Add Section</Button>}
      />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth size="small" label="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select size="small" label="Class" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
            <MenuItem value="all">All Classes</MenuItem>
            {classes.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </TextField>
        </Grid>
      </Grid>
      <DataTable
        columns={[
          { key: "className", label: "Class" },
          { key: "section", label: "Section" },
          { key: "classTeacher", label: "Class Teacher" },
          { key: "studentCount", label: "Students" },
        ]}
        rows={rows}
      />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Section</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth select label="Class" value={form.classId} onChange={(e) => setForm((prev) => ({ ...prev, classId: e.target.value }))}>
                {classes.map((classItem) => <MenuItem key={classItem.id} value={classItem.id}>{classItem.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Section Name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
            </Grid>
            <Grid size={12}>
              <TextField fullWidth select label="Class Teacher" value={form.classTeacherId} onChange={(e) => setForm((prev) => ({ ...prev, classTeacherId: e.target.value }))}>
                {teachers.map((teacher) => <MenuItem key={teacher.id} value={teacher.id}>{teacher.name}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Create</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
