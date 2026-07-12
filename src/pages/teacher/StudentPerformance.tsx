import { useState } from "react";
import { Paper, Typography, MenuItem, TextField, Grid, Chip, Box, Avatar } from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { useAuth } from "@/context/AuthContext";
import { teachers, students, marks, getTeacherClasses, getClassName, exams } from "@/demo-data";
import { getChartPalette } from "@/theme/chartPalette";
import { useColorMode } from "@/context/ColorModeContext";

export default function StudentPerformance() {
  const { mode } = useColorMode();
  const palette = getChartPalette(mode);
  const { user } = useAuth();
  const teacher = teachers.find((t) => t.id === user?.id);
  const allocations = teacher ? getTeacherClasses(teacher.id) : [];
  const classIds = [...new Set(allocations.map((a) => a.class_id))];
  const [classFilter, setClassFilter] = useState(classIds[0] ?? "");
  const [examFilter, setExamFilter] = useState(exams[0]?.id ?? "");

  const classStudents = students.filter((s) => s.class_id === classFilter);

  const studentData = classStudents.map((s) => {
    const studentMarks = marks.filter((m) => m.student_id === s.id && m.exam_id === examFilter);
    const avg = studentMarks.length > 0 ? Math.round(studentMarks.reduce((sum, m) => sum + m.marks_obtained, 0) / studentMarks.length) : 0;
    const total = studentMarks.reduce((sum, m) => sum + m.marks_obtained, 0);
    return { ...s, avg, total, subjectCount: studentMarks.length, studentMarks };
  }).sort((a, b) => b.total - a.total);

  const chartData = studentData.slice(0, 15).map((s) => ({
    name: s.name.split(" ")[0], average: s.avg,
  }));

  return (
    <>
      <PageHeader
        title="Student Performance"
        breadcrumbs={[{ label: "Dashboard", to: "/teacher" }, { label: "Class Management", to: "/teacher/class-mgmt" }, { label: "Performance" }]}
      />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select size="small" label="Class" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
            {classIds.map((cid) => <MenuItem key={cid} value={cid}>{getClassName(cid)}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select size="small" label="Exam" value={examFilter} onChange={(e) => setExamFilter(e.target.value)}>
            {exams.map((ex) => <MenuItem key={ex.id} value={ex.id}>{ex.name}</MenuItem>)}
          </TextField>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, height: 320, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>Average Marks per Student</Typography>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip cursor={false} />
            <Bar dataKey="average" fill={palette.categorical[0]} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      <DataTable
        columns={[
          {
            key: "name", label: "Student",
            render: (s) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>{s.name.charAt(0)}</Avatar>
                {s.name}
              </Box>
            ),
          },
          { key: "roll_number", label: "Roll No." },
          { key: "total", label: "Total Marks" },
          { key: "avg", label: "Average", render: (s) => <Chip label={s.avg} size="small" color={s.avg >= 80 ? "success" : s.avg >= 50 ? "warning" : "error"} /> },
          { key: "subjectCount", label: "Subjects" },
          { key: "attendance_pct", label: "Attendance", render: (s) => <Chip label={`${s.attendance_pct}%`} size="small" variant="outlined" /> },
        ]}
        rows={studentData}
      />
    </>
  );
}
