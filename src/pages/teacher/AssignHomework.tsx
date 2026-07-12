import { useState } from "react";
import {
  Paper, TextField, Grid, MenuItem, Button, Stack, Snackbar, Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { teachers, getTeacherClasses, getClassName, getSubjectName } from "@/demo-data";

const emptyForm = (classId: string, sectionId: string, subjectId: string) => ({
  classId, sectionId, subjectId, title: "", description: "", dueDate: "",
});

export default function AssignHomework() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const teacher = teachers.find((t) => t.id === user?.id);
  const allocations = teacher ? getTeacherClasses(teacher.id) : [];

  const [form, setForm] = useState(
    emptyForm(allocations[0]?.class_id ?? "", allocations[0]?.section_id ?? "", teacher?.subjects[0] ?? "")
  );
  const [snack, setSnack] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: false }));
  };

  const handleSubmit = () => {
    const newErrors: Record<string, boolean> = {};
    if (!form.title.trim()) newErrors.title = true;
    if (!form.dueDate) newErrors.dueDate = true;
    if (!form.description.trim()) newErrors.description = true;
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setSnack(true);
    setForm(emptyForm(form.classId, form.sectionId, form.subjectId));
  };

  return (
    <>
      <PageHeader
        title="Assign Homework"
        breadcrumbs={[{ label: "Dashboard", to: "/teacher" }, { label: "Homework", to: "/teacher/homework/list" }, { label: "Assign" }]}
      />
      <Paper sx={{ p: 3, maxWidth: 700 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField fullWidth select label="Class" value={form.classId} onChange={handleChange("classId")}>
              {[...new Set(allocations.map((a) => a.class_id))].map((cid) => (
                <MenuItem key={cid} value={cid}>{getClassName(cid)}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField fullWidth select label="Section" value={form.sectionId} onChange={handleChange("sectionId")}>
              {allocations.filter((a) => a.class_id === form.classId).map((a) => (
                <MenuItem key={a.section_id} value={a.section_id}>{a.section_id.split("-")[1]?.toUpperCase() ?? a.section_id}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField fullWidth select label="Subject" value={form.subjectId} onChange={handleChange("subjectId")}>
              {teacher?.subjects.map((sid) => (
                <MenuItem key={sid} value={sid}>{getSubjectName(sid)}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth label="Title" value={form.title} onChange={handleChange("title")} error={errors.title} helperText={errors.title ? "Title is required" : ""} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth label="Description" value={form.description} onChange={handleChange("description")} multiline rows={3} error={errors.description} helperText={errors.description ? "Description is required" : ""} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth type="date" label="Due Date" value={form.dueDate} onChange={handleChange("dueDate")} slotProps={{ inputLabel: { shrink: true } }} error={errors.dueDate} helperText={errors.dueDate ? "Due date is required" : ""} />
          </Grid>
        </Grid>
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button variant="contained" onClick={handleSubmit}>Assign Homework</Button>
          <Button variant="outlined" onClick={() => navigate("/teacher/homework/list")}>Cancel</Button>
        </Stack>
      </Paper>
      <Snackbar open={snack} autoHideDuration={3000} onClose={() => setSnack(false)}>
        <Alert severity="success" onClose={() => setSnack(false)}>Homework assigned successfully!</Alert>
      </Snackbar>
    </>
  );
}
