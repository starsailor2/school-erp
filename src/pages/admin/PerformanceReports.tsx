import { useState, useMemo } from "react";
import { Paper, Typography, Grid, MenuItem, TextField, Chip } from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend,
} from "recharts";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { classes, students, marks, subjects, exams } from "@/demo-data";

export default function PerformanceReports() {
  const [classFilter, setClassFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [examFilter, setExamFilter] = useState("all");

  const selectedClass = classes.find((c) => c.id === classFilter);
  const sections = selectedClass?.sections ?? [];

  const filteredStudents = useMemo(() => {
    if (classFilter === "all") return students;
    return students.filter((s) => s.class_id === classFilter && (sectionFilter === "all" || s.section_id === sectionFilter));
  }, [classFilter, sectionFilter]);

  const filteredStudentIds = useMemo(() => new Set(filteredStudents.map((s) => s.id)), [filteredStudents]);

  const filteredMarks = useMemo(() => {
    return marks
      .filter((m) => filteredStudentIds.has(m.student_id))
      .filter((m) => examFilter === "all" || m.exam_id === examFilter);
  }, [filteredStudentIds, examFilter]);

  // Top performers
  const studentTotals = useMemo(() => {
    const totals = new Map<string, { total: number; count: number; name: string }>();
    filteredMarks.forEach((m) => {
      const student = filteredStudents.find((s) => s.id === m.student_id);
      if (!student) return;
      if (!totals.has(m.student_id)) totals.set(m.student_id, { total: 0, count: 0, name: student.name });
      const entry = totals.get(m.student_id)!;
      entry.total += m.marks_obtained;
      entry.count += 1;
    });
    return Array.from(totals.entries())
      .map(([id, { total, count, name }]) => ({ id, name, average: Math.round(total / count), totalMarks: total, subjects: count }))
      .sort((a, b) => b.average - a.average);
  }, [filteredMarks, filteredStudents]);

  // Subject-wise comparison
  const subjectComparison = subjects.slice(0, 5).map((sub) => {
    const subMarks = filteredMarks.filter((m) => m.subject_id === sub.id);
    const avg = subMarks.length > 0 ? Math.round(subMarks.reduce((s, m) => s + m.marks_obtained, 0) / subMarks.length) : 0;
    const highest = subMarks.length > 0 ? Math.max(...subMarks.map((m) => m.marks_obtained)) : 0;
    const lowest = subMarks.length > 0 ? Math.min(...subMarks.map((m) => m.marks_obtained)) : 0;
    return { name: sub.name, average: avg, highest, lowest };
  });

  // Grade breakdown
  const gradeBreakdown = ["A+", "A", "B+", "B", "C", "D"].map((g) => ({
    grade: g,
    count: filteredMarks.filter((m) => m.grade === g).length,
  }));

  return (
    <>
      <PageHeader
        title="Performance Reports"
        breadcrumbs={[
          { label: "Dashboard", to: "/admin" },
          { label: "Reports" },
          { label: "Performance" },
        ]}
      />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField fullWidth select size="small" label="Exam" value={examFilter} onChange={(e) => setExamFilter(e.target.value)}>
            <MenuItem value="all">All Exams</MenuItem>
            {exams.map((ex) => <MenuItem key={ex.id} value={ex.id}>{ex.name}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField fullWidth select size="small" label="Class" value={classFilter} onChange={(e) => { setClassFilter(e.target.value); setSectionFilter("all"); }}>
            <MenuItem value="all">All Classes</MenuItem>
            {classes.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField fullWidth select size="small" label="Section" value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)} disabled={classFilter === "all"}>
            <MenuItem value="all">All Sections</MenuItem>
            {sections.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <Paper sx={{ p: 1.5, display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <Typography variant="body2" color="text.secondary">
              Students: {filteredStudents.length} | Records: {filteredMarks.length}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 2, height: 380 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Subject Performance (Avg / Highest / Lowest)
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={subjectComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="highest" fill="#10b981" name="Highest" radius={[4, 4, 0, 0]} />
                <Bar dataKey="average" fill="#6366f1" name="Average" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lowest" fill="#ef4444" name="Lowest" radius={[4, 4, 0, 0]} />
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
              <BarChart data={gradeBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grade" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" name="Students" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>Top Performers</Typography>
        <DataTable
          columns={[
            { key: "rank", label: "Rank", render: (_, i) => i + 1 },
            { key: "name", label: "Student Name" },
            { key: "average", label: "Average", render: (r) => (
              <Chip
                label={`${r.average}%`}
                size="small"
                color={r.average >= 80 ? "success" : r.average >= 60 ? "warning" : "error"}
              />
            )},
            { key: "totalMarks", label: "Total Marks" },
            { key: "subjects", label: "Subjects Taken" },
          ]}
          rows={studentTotals.slice(0, 15)}
        />
      </Paper>
    </>
  );
}
