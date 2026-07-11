import { useState } from "react";
import { Paper, Typography, MenuItem, TextField, Grid, Chip } from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { useAuth } from "@/context/AuthContext";
import { teachers, marks, students, getTeacherClasses, getClassName, getSubjectName, exams } from "@/demo-data";

export default function SubjectResults() {
  const { user } = useAuth();
  const teacher = teachers.find((t) => t.id === user?.id);
  const allocations = teacher ? getTeacherClasses(teacher.id) : [];
  const [examFilter, setExamFilter] = useState(exams[0]?.id ?? "");

  const data = allocations.map((a) => {
    const classStudents = students.filter((s) => s.class_id === a.class_id);
    const subMarks = marks.filter(
      (m) => classStudents.some((s) => s.id === m.student_id) && m.subject_id === a.subject_id && m.exam_id === examFilter
    );
    const avg = subMarks.length > 0 ? Math.round(subMarks.reduce((s, m) => s + m.marks_obtained, 0) / subMarks.length) : 0;
    const highest = subMarks.length > 0 ? Math.max(...subMarks.map((m) => m.marks_obtained)) : 0;
    const lowest = subMarks.length > 0 ? Math.min(...subMarks.map((m) => m.marks_obtained)) : 0;
    const passCount = subMarks.filter((m) => m.marks_obtained >= 40).length;
    return {
      name: getClassName(a.class_id), subject: getSubjectName(a.subject_id),
      average: avg, highest, lowest, students: subMarks.length,
      passRate: subMarks.length > 0 ? Math.round((passCount / subMarks.length) * 100) : 0,
    };
  });

  return (
    <>
      <PageHeader
        title="Subject Results"
        breadcrumbs={[{ label: "Dashboard", to: "/teacher" }, { label: "Exams", to: "/teacher/exams" }, { label: "Results" }]}
      />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select size="small" label="Exam" value={examFilter} onChange={(e) => setExamFilter(e.target.value)}>
            {exams.map((ex) => <MenuItem key={ex.id} value={ex.id}>{ex.name}</MenuItem>)}
          </TextField>
        </Grid>
      </Grid>
      <Paper sx={{ p: 2, height: 350, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Average Marks — {teacher?.subjects.map(getSubjectName).join(", ")}
        </Typography>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="average" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
      <DataTable
        columns={[
          { key: "name", label: "Class" },
          { key: "subject", label: "Subject" },
          { key: "students", label: "Students" },
          { key: "average", label: "Average" },
          { key: "highest", label: "Highest" },
          { key: "lowest", label: "Lowest" },
          { key: "passRate", label: "Pass Rate", render: (r) => <Chip label={`${r.passRate}%`} size="small" color={r.passRate >= 80 ? "success" : r.passRate >= 60 ? "warning" : "error"} /> },
        ]}
        rows={data}
      />
    </>
  );
}
