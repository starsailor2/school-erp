import { useState, useMemo } from "react";
import {
  Grid, Paper, Typography, Box, MenuItem, TextField, Table, TableHead,
  TableRow, TableCell, TableBody, Chip, Divider, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, Stack, LinearProgress,
} from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import {
  teachers, students, subjects, classes, marks, exams, subjectAllocations,
  getClassName, getSubjectName,
} from "@/demo-data";

export default function DepartmentReports() {
  const { user } = useAuth();
  const teacher = teachers.find((t) => t.id === user?.id);
  const department = teacher?.department ?? "";
  const deptSubjects = subjects.filter((s) => s.department === department);
  const deptSubjectIds = deptSubjects.map((s) => s.id);

  const [selectedExam, setSelectedExam] = useState(exams[0]?.id ?? "");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailSubject, setDetailSubject] = useState<string>("");

  // Classes that have subjects from this department (via allocations)
  const relevantClassIds = [...new Set(
    subjectAllocations.filter((a) => deptSubjectIds.includes(a.subject_id)).map((a) => a.class_id)
  )];
  const relevantClasses = classes.filter((c) => relevantClassIds.includes(c.id));

  // Compute results per subject for selected exam
  const results = useMemo(() => {
    const filteredClasses = selectedClass
      ? relevantClasses.filter((c) => c.id === selectedClass)
      : relevantClasses;
    const classIds = filteredClasses.map((c) => c.id);

    return deptSubjects.map((subj) => {
      const subjMarks = marks.filter(
        (m) => m.exam_id === selectedExam && m.subject_id === subj.id &&
          students.find((s) => s.id === m.student_id && classIds.includes(s.class_id) &&
            (!selectedSection || s.section_id === selectedSection))
      );
      const total = subjMarks.length;
      const avg = total > 0 ? Math.round(subjMarks.reduce((s, m) => s + m.marks_obtained, 0) / total) : 0;
      const highest = total > 0 ? Math.max(...subjMarks.map((m) => m.marks_obtained)) : 0;
      const lowest = total > 0 ? Math.min(...subjMarks.map((m) => m.marks_obtained)) : 0;
      const passCount = subjMarks.filter((m) => m.marks_obtained >= 40).length;
      const passPct = total > 0 ? Math.round((passCount / total) * 100) : 0;

      return {
        subjectId: subj.id,
        subjectName: subj.name,
        totalStudents: total,
        average: avg,
        highest,
        lowest,
        passPercentage: passPct,
      };
    });
  }, [selectedExam, selectedClass, selectedSection, deptSubjects, relevantClasses]);

  // Top 5 students for detail modal
  const detailStudents = useMemo(() => {
    if (!detailSubject) return [];
    const subjMarks = marks
      .filter((m) => m.exam_id === selectedExam && m.subject_id === detailSubject)
      .map((m) => {
        const stu = students.find((s) => s.id === m.student_id);
        return { ...m, studentName: stu?.name ?? "Unknown", className: getClassName(stu?.class_id ?? "") };
      })
      .sort((a, b) => b.marks_obtained - a.marks_obtained);
    return subjMarks;
  }, [detailSubject, selectedExam]);

  const overallAvg = results.length > 0
    ? Math.round(results.reduce((s, r) => s + r.average, 0) / results.length)
    : 0;
  const overallPass = results.length > 0
    ? Math.round(results.reduce((s, r) => s + r.passPercentage, 0) / results.length)
    : 0;

  return (
    <>
      <PageHeader
        title="Department Reports"
        breadcrumbs={[
          { label: "Dashboard", to: "/teacher" },
          { label: "Department", to: "/teacher/department" },
          { label: "Department Reports" },
        ]}
      />

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select size="small" label="Exam" value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)}>
            {exams.map((ex) => <MenuItem key={ex.id} value={ex.id}>{ex.name}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select size="small" label="Class" value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setSelectedSection(""); }}>
            <MenuItem value="">All Classes</MenuItem>
            {relevantClasses.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select size="small" label="Section" value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
            <MenuItem value="">All Sections</MenuItem>
            {(selectedClass
              ? (relevantClasses.find((c) => c.id === selectedClass)?.sections ?? []).map((s) => (
                  <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                ))
              : relevantClasses.flatMap((c) => c.sections.map((s) => (
                  <MenuItem key={s.id} value={s.id}>{c.name} — {s.name}</MenuItem>
                )))
            )}
          </TextField>
        </Grid>
      </Grid>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 3 }}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">Department</Typography>
            <Typography variant="h6">{department || "—"}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">Subjects</Typography>
            <Typography variant="h6">{deptSubjects.length}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">Avg Score</Typography>
            <Typography variant="h6" color={overallAvg >= 60 ? "success.main" : "warning.main"}>
              {overallAvg}%
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">Pass Rate</Typography>
            <Typography variant="h6" color={overallPass >= 70 ? "success.main" : "warning.main"}>
              {overallPass}%
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Results Table */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Subject-wise Results
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Subject</TableCell>
              <TableCell align="center">Students</TableCell>
              <TableCell align="center">Average</TableCell>
              <TableCell align="center">Highest</TableCell>
              <TableCell align="center">Lowest</TableCell>
              <TableCell align="center">Pass %</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.map((r) => (
              <TableRow key={r.subjectId} hover>
                <TableCell>{r.subjectName}</TableCell>
                <TableCell align="center">{r.totalStudents}</TableCell>
                <TableCell align="center">
                  <Chip label={r.average} size="small" color={r.average >= 60 ? "success" : r.average >= 40 ? "warning" : "error"} />
                </TableCell>
                <TableCell align="center">{r.highest}</TableCell>
                <TableCell align="center">{r.lowest}</TableCell>
                <TableCell align="center">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: "center" }}>
                    <LinearProgress
                      variant="determinate"
                      value={r.passPercentage}
                      sx={{ width: 60, height: 6, borderRadius: 3 }}
                      color={r.passPercentage >= 70 ? "success" : r.passPercentage >= 50 ? "warning" : "error"}
                    />
                    <Typography variant="caption">{r.passPercentage}%</Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Button
                    size="small"
                    onClick={() => { setDetailSubject(r.subjectId); setDetailOpen(true); }}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {results.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="text.secondary" sx={{ py: 2 }}>No results found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {getSubjectName(detailSubject)} — Student Results
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {detailStudents.length} students • Sorted by marks (highest first)
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Student</TableCell>
                <TableCell>Class</TableCell>
                <TableCell align="center">Marks</TableCell>
                <TableCell align="center">Grade</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {detailStudents.map((s, i) => {
                const grade = s.marks_obtained >= 90 ? "A+" : s.marks_obtained >= 80 ? "A" : s.marks_obtained >= 70 ? "B+" : s.marks_obtained >= 60 ? "B" : s.marks_obtained >= 50 ? "C" : s.marks_obtained >= 40 ? "D" : "F";
                return (
                  <TableRow key={s.id} hover>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{s.studentName}</TableCell>
                    <TableCell>{s.className}</TableCell>
                    <TableCell align="center">{s.marks_obtained}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={grade}
                        size="small"
                        color={grade.startsWith("A") ? "success" : grade.startsWith("B") ? "info" : grade === "F" ? "error" : "warning"}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
              {detailStudents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary" sx={{ py: 2 }}>No marks data</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {detailStudents.length > 0 && (
            <Stack direction="row" spacing={3} sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
              <Typography variant="body2">
                <strong>Top Student:</strong> {detailStudents[0]?.studentName} ({detailStudents[0]?.marks_obtained})
              </Typography>
              <Typography variant="body2">
                <strong>Average:</strong>{" "}
                {Math.round(detailStudents.reduce((s, d) => s + d.marks_obtained, 0) / detailStudents.length)}
              </Typography>
              <Typography variant="body2">
                <strong>Pass Rate:</strong>{" "}
                {Math.round((detailStudents.filter((d) => d.marks_obtained >= 40).length / detailStudents.length) * 100)}%
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
