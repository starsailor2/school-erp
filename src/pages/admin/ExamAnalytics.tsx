import { useState, useMemo } from "react";
import { Paper, Typography, Grid, MenuItem, TextField } from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { PageHeader } from "@/components/PageHeader";
import { marks, subjects, exams, classes, students } from "@/demo-data";
import { getChartPalette } from "@/theme/chartPalette";
import { useColorMode } from "@/context/ColorModeContext";

export default function ExamAnalytics() {
  const [examFilter, setExamFilter] = useState("all");
  const { mode } = useColorMode();
  const palette = getChartPalette(mode);
  const COLORS = palette.categorical;
  const [classFilter, setClassFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");

  const selectedClass = classes.find((c) => c.id === classFilter);
  const sections = selectedClass?.sections ?? [];

  // Get student IDs matching class/section filter
  const filteredStudentIds = useMemo(() => {
    if (classFilter === "all") return null; // null = no filter
    return new Set(
      students
        .filter((s) => s.class_id === classFilter && (sectionFilter === "all" || s.section_id === sectionFilter))
        .map((s) => s.id)
    );
  }, [classFilter, sectionFilter]);

  const filteredMarks = useMemo(() => {
    return marks
      .filter((m) => examFilter === "all" || m.exam_id === examFilter)
      .filter((m) => filteredStudentIds === null || filteredStudentIds.has(m.student_id));
  }, [examFilter, filteredStudentIds]);

  const subjectAvg = subjects.slice(0, 5).map((sub) => {
    const subMarks = filteredMarks.filter((m) => m.subject_id === sub.id);
    const avg = subMarks.length > 0
      ? Math.round(subMarks.reduce((s, m) => s + m.marks_obtained, 0) / subMarks.length)
      : 0;
    return { name: sub.name, average: avg };
  });

  const gradeDistribution = ["A+", "A", "B+", "B", "C", "D"].map((g) => ({
    name: g,
    value: filteredMarks.filter((m) => m.grade === g).length,
  })).filter((g) => g.value > 0);

  return (
    <>
      <PageHeader
        title="Exam Analytics"
        breadcrumbs={[
          { label: "Dashboard", to: "/admin" },
          { label: "Examinations", to: "/admin/exams" },
          { label: "Analytics" },
        ]}
      />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select size="small" label="Exam" value={examFilter} onChange={(e) => setExamFilter(e.target.value)}>
            <MenuItem value="all">All Exams</MenuItem>
            {exams.map((exam) => <MenuItem key={exam.id} value={exam.id}>{exam.name}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select size="small" label="Class" value={classFilter} onChange={(e) => { setClassFilter(e.target.value); setSectionFilter("all"); }}>
            <MenuItem value="all">All Classes (School-wide)</MenuItem>
            {classes.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth
            select
            size="small"
            label="Section"
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            disabled={classFilter === "all"}
          >
            <MenuItem value="all">All Sections</MenuItem>
            {sections.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
          </TextField>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 2, height: 380 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Subject-wise Average Marks {classFilter !== "all" && `— ${selectedClass?.name ?? ""}${sectionFilter !== "all" ? ` ${sections.find((s) => s.id === sectionFilter)?.name ?? ""}` : ""}`}
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={subjectAvg}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="average" fill={palette.categorical[0]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 2, height: 380 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Grade Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie data={gradeDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {gradeDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
