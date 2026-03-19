import { useState } from "react";
import {
  Grid, MenuItem, TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle,
} from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import {
  subjectAllocations, teachers, subjects, classes, getSubjectName,
  getClassName, getTeacherName,
} from "@/data/mock";
import type { SubjectAllocation as SubjectAllocationType } from "@/types";

type AllocationRow = {
  id: string;
  teacher_id: string;
  subject_id: string;
  class_id: string;
  section_id: string;
};

export default function SubjectAllocation() {
  const [classFilter, setClassFilter] = useState("all");
  const [rows, setRows] = useState<SubjectAllocationType[]>(subjectAllocations);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ teacher_id: "", subject_id: "", class_id: "", section_id: "" });

  const filtered = classFilter === "all"
    ? rows
    : rows.filter((a) => a.class_id === classFilter);

  const tableRows: AllocationRow[] = filtered.map((row) => ({
    id: row.id,
    teacher_id: row.teacher_id,
    subject_id: row.subject_id,
    class_id: row.class_id,
    section_id: row.section_id,
  }));

  const handleCreate = () => {
    if (!form.teacher_id || !form.subject_id || !form.class_id || !form.section_id) return;
    const duplicate = rows.some((allocation) => (
      allocation.teacher_id === form.teacher_id
      && allocation.subject_id === form.subject_id
      && allocation.class_id === form.class_id
      && allocation.section_id === form.section_id
    ));
    if (duplicate) return;
    setRows((prev) => [...prev, { id: `sa-${Date.now()}`, periods_per_week: 4, ...form }]);
    setOpen(false);
    setForm({ teacher_id: "", subject_id: "", class_id: "", section_id: "" });
  };

  const sectionsForClass = classes.find((c) => c.id === form.class_id)?.sections ?? [];

  return (
    <>
      <PageHeader
        title="Subject Allocation"
        breadcrumbs={[
          { label: "Dashboard", to: "/admin" },
          { label: "Teachers", to: "/admin/teachers" },
          { label: "Subject Allocation" },
        ]}
        action={<Button variant="contained" size="small" onClick={() => setOpen(true)}>New Allocation</Button>}
      />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select size="small" label="Filter by Class" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
            <MenuItem value="all">All Classes</MenuItem>
            {classes.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </TextField>
        </Grid>
      </Grid>
      <DataTable<AllocationRow>
        columns={[
          { key: "teacher_id", label: "Teacher", render: (a) => getTeacherName(a.teacher_id) },
          { key: "subject_id", label: "Subject", render: (a) => getSubjectName(a.subject_id) },
          { key: "class_id", label: "Class", render: (a) => getClassName(a.class_id) },
          { key: "section_id", label: "Section", render: (a) => classes.flatMap((c) => c.sections).find((s) => s.id === a.section_id)?.name ?? "—" },
        ]}
        rows={tableRows}
      />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Subject Allocation</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth select label="Teacher" value={form.teacher_id} onChange={(e) => setForm((prev) => ({ ...prev, teacher_id: e.target.value }))}>
                {teachers.map((teacher) => <MenuItem key={teacher.id} value={teacher.id}>{teacher.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth select label="Subject" value={form.subject_id} onChange={(e) => setForm((prev) => ({ ...prev, subject_id: e.target.value }))}>
                {subjects.map((subject) => <MenuItem key={subject.id} value={subject.id}>{subject.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth select label="Class" value={form.class_id} onChange={(e) => setForm((prev) => ({ ...prev, class_id: e.target.value, section_id: "" }))}>
                {classes.map((classItem) => <MenuItem key={classItem.id} value={classItem.id}>{classItem.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth select label="Section" value={form.section_id} onChange={(e) => setForm((prev) => ({ ...prev, section_id: e.target.value }))}>
                {sectionsForClass.map((section) => <MenuItem key={section.id} value={section.id}>{section.name}</MenuItem>)}
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
