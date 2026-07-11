import { useState, useMemo } from "react";
import { Paper, Typography, Grid, MenuItem, TextField } from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { PageHeader } from "@/components/PageHeader";
import { classes, students, marks, subjects } from "@/demo-data";
import { getChartPalette } from "@/theme/chartPalette";
import { useColorMode } from "@/context/ColorModeContext";

export default function Reports() {
  const { mode } = useColorMode();
  const palette = getChartPalette(mode);
  const [scope, setScope] = useState("month");
  const [classFilter, setClassFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");

  const selectedClass = classes.find((c) => c.id === classFilter);
  const sections = selectedClass?.sections ?? [];

  const multiplier = scope === "week" ? 0.95 : scope === "quarter" ? 1.05 : 1;

  // Filter students by class/section
  const filteredStudentIds = useMemo(() => {
    if (classFilter === "all") return null;
    return new Set(
      students
        .filter((s) => s.class_id === classFilter && (sectionFilter === "all" || s.section_id === sectionFilter))
        .map((s) => s.id)
    );
  }, [classFilter, sectionFilter]);

  const filteredMarks = useMemo(() => {
    if (filteredStudentIds === null) return marks;
    return marks.filter((m) => filteredStudentIds.has(m.student_id));
  }, [filteredStudentIds]);

  const academicData = subjects.slice(0, 5).map((sub) => {
    const subMarks = filteredMarks.filter((m) => m.subject_id === sub.id);
    const avg = subMarks.length > 0 ? Math.round((subMarks.reduce((s, m) => s + m.marks_obtained, 0) / subMarks.length) * multiplier) : 0;
    const pass = subMarks.filter((m) => m.marks_obtained >= 40).length;
    return { name: sub.name, average: Math.min(avg, 100), passRate: subMarks.length > 0 ? Math.round((pass / subMarks.length) * 100) : 0 };
  });

  const filteredStudents = classFilter === "all"
    ? students
    : students.filter((s) => s.class_id === classFilter && (sectionFilter === "all" || s.section_id === sectionFilter));

  const attendanceByClass = classFilter === "all"
    ? classes.slice(0, 8).map((c) => {
        const classStudents = students.filter((student) => student.class_id === c.id);
        const avgAttendance = classStudents.length > 0
          ? Math.round(classStudents.reduce((sum, student) => sum + student.attendance_pct, 0) / classStudents.length)
          : 0;
        return { name: c.name, attendance: avgAttendance };
      })
    : (selectedClass?.sections ?? [])
        .filter((sec) => sectionFilter === "all" || sec.id === sectionFilter)
        .map((sec) => {
          const secStudents = students.filter((s) => s.section_id === sec.id);
          const avgAttendance = secStudents.length > 0
            ? Math.round(secStudents.reduce((sum, s) => sum + s.attendance_pct, 0) / secStudents.length)
            : 0;
          return { name: `${selectedClass!.name} - ${sec.name}`, attendance: avgAttendance };
        });

  return (
    <>
      <PageHeader
        title="Academic Reports"
        breadcrumbs={[
          { label: "Dashboard", to: "/admin" },
          { label: "Reports" },
          { label: "Academic" },
        ]}
      />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField fullWidth select size="small" label="Scope" value={scope} onChange={(e) => setScope(e.target.value)}>
            <MenuItem value="week">Last Week</MenuItem>
            <MenuItem value="month">Last Month</MenuItem>
            <MenuItem value="quarter">Last Quarter</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField fullWidth select size="small" label="Class" value={classFilter} onChange={(e) => { setClassFilter(e.target.value); setSectionFilter("all"); }}>
            <MenuItem value="all">All Classes</MenuItem>
            {classes.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField
            fullWidth select size="small" label="Section"
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            disabled={classFilter === "all"}
          >
            <MenuItem value="all">All Sections</MenuItem>
            {sections.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <Paper sx={{ p: 1.5, display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <Typography variant="body2" color="text.secondary">
              Students: {filteredStudents.length}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, height: 380 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Academic Performance {classFilter !== "all" && `— ${selectedClass?.name}${sectionFilter !== "all" ? ` ${sections.find((s) => s.id === sectionFilter)?.name}` : ""}`}
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={academicData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="average" fill={palette.categorical[0]} name="Avg Marks" radius={[4, 4, 0, 0]} />
                <Bar dataKey="passRate" fill={palette.status.good} name="Pass %" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, height: 380 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              {classFilter === "all" ? "Class-wise Attendance" : "Section-wise Attendance"}
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={attendanceByClass}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="attendance" fill={palette.categorical[1]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
