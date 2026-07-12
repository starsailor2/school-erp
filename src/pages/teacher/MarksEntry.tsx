import { useState } from "react";
import {
  MenuItem, TextField, Grid, Chip, Button, Snackbar, Alert, Box, Avatar,
} from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { useAuth } from "@/context/AuthContext";
import {
  teachers, getTeacherClasses, students, marks as initialMarks, getClassName, getSubjectName, exams,
} from "@/demo-data";

export default function MarksEntry() {
  const { user } = useAuth();
  const teacher = teachers.find((t) => t.id === user?.id);
  const allocations = teacher ? getTeacherClasses(teacher.id) : [];
  const classIds = [...new Set(allocations.map((a) => a.class_id))];
  const [classFilter, setClassFilter] = useState(classIds[0] ?? "");
  const [examFilter, setExamFilter] = useState(exams[0]?.id ?? "");
  const [subjectFilter, setSubjectFilter] = useState(teacher?.subjects[0] ?? "");
  const [marksData, setMarksData] = useState<Record<string, { marks: number; maxMarks: number }>>({});
  const [snack, setSnack] = useState(false);

  const classStudents = students.filter((s) => s.class_id === classFilter);
  const rows = classStudents.map((s) => {
    const override = marksData[s.id];
    const mark = initialMarks.find(
      (m) => m.student_id === s.id && m.subject_id === subjectFilter && m.exam_id === examFilter
    );
    const obtained = override?.marks ?? mark?.marks_obtained ?? "";
    const maxM = override?.maxMarks ?? mark?.max_marks ?? 100;
    const grade = typeof obtained === "number" ? (obtained >= 90 ? "A+" : obtained >= 80 ? "A" : obtained >= 70 ? "B+" : obtained >= 60 ? "B" : obtained >= 50 ? "C" : "D") : "—";
    return { ...s, marks: obtained, total: maxM, grade };
  });

  const handleMarksChange = (studentId: string, value: string) => {
    const num = parseInt(value);
    if (value === "") {
      setMarksData((d) => { const n = { ...d }; delete n[studentId]; return n; });
    } else if (!isNaN(num) && num >= 0 && num <= 100) {
      setMarksData((d) => ({ ...d, [studentId]: { marks: num, maxMarks: 100 } }));
    }
  };

  const handleSave = () => {
    setSnack(true);
    setMarksData({});
  };

  return (
    <>
      <PageHeader
        title="Marks Entry"
        breadcrumbs={[{ label: "Dashboard", to: "/teacher" }, { label: "Exams" }]}
      />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField fullWidth select size="small" label="Class" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
            {classIds.map((cid) => <MenuItem key={cid} value={cid}>{getClassName(cid)}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField fullWidth select size="small" label="Exam" value={examFilter} onChange={(e) => setExamFilter(e.target.value)}>
            {exams.map((ex) => <MenuItem key={ex.id} value={ex.id}>{ex.name}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField fullWidth select size="small" label="Subject" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
            {teacher?.subjects.map((sid) => <MenuItem key={sid} value={sid}>{getSubjectName(sid)}</MenuItem>)}
          </TextField>
        </Grid>
      </Grid>
      <DataTable
        columns={[
          {
            key: "name", label: "Student",
            render: (r) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>{r.name.charAt(0)}</Avatar>
                {r.name}
              </Box>
            ),
          },
          { key: "roll_number", label: "Roll No." },
          {
            key: "marks", label: "Marks (out of 100)",
            render: (r) => (
              <TextField
                size="small"
                type="number"
                value={marksData[r.id]?.marks ?? (typeof r.marks === "number" ? r.marks : "")}
                onChange={(e) => handleMarksChange(r.id, e.target.value)}
                slotProps={{ htmlInput: { min: 0, max: 100, style: { width: 80 } } }}
                placeholder="Enter"
              />
            ),
          },
          {
            key: "grade", label: "Grade",
            render: (r) => typeof r.marks === "number"
              ? <Chip label={r.grade} size="small" color={r.marks >= 80 ? "success" : r.marks >= 50 ? "warning" : "error"} />
              : <Chip label="—" size="small" variant="outlined" />,
          },
        ]}
        rows={rows}
      />
      <Button variant="contained" sx={{ mt: 2 }} onClick={handleSave}>Save Marks</Button>
      <Snackbar open={snack} autoHideDuration={3000} onClose={() => setSnack(false)}>
        <Alert severity="success" onClose={() => setSnack(false)}>Marks saved successfully!</Alert>
      </Snackbar>
    </>
  );
}
