import { useState, useMemo } from "react";
import {
  Grid, Paper, Typography, Box, MenuItem, TextField, Table, TableHead,
  TableRow, TableCell, TableBody, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, LinearProgress,
} from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import {
  teachers, students, subjects, classes, marks, exams, subjectAllocations,
  getClassName,
} from "@/data/mock";

export default function ExamReview() {
  const { user } = useAuth();
  const teacher = teachers.find((t) => t.id === user?.id);
  const department = teacher?.department ?? "";
  const deptSubjects = subjects.filter((s) => s.department === department);
  const deptSubjectIds = deptSubjects.map((s) => s.id);

  const [selectedExam, setSelectedExam] = useState(exams[0]?.id ?? "");
  const [selectedSection, setSelectedSection] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailClass, setDetailClass] = useState("");
  const [detailSection, setDetailSection] = useState("");

  // Classes with dept subjects (via allocations)
  const relevantClassIds = [...new Set(
    subjectAllocations.filter((a) => deptSubjectIds.includes(a.subject_id)).map((a) => a.class_id)
  )];
  const relevantClasses = classes.filter((c) => relevantClassIds.includes(c.id));
  const allSections = relevantClasses.flatMap((c) => c.sections.map((s) => ({ ...s, className: c.name })));

  // Compute per-class (optionally per-section) stats for selected exam
  const classResults = useMemo(() => {
    if (selectedSection) {
      // Section-wise: show a single row for the selected section
      const sec = allSections.find((s) => s.id === selectedSection);
      if (!sec) return [];
      const sectionStudents = students.filter((s) => s.section_id === sec.id);
      const sectionMarks = marks.filter(
        (m) => m.exam_id === selectedExam && deptSubjectIds.includes(m.subject_id) &&
          sectionStudents.some((s) => s.id === m.student_id)
      );
      const total = sectionMarks.length;
      const avg = total > 0 ? Math.round(sectionMarks.reduce((s, m) => s + m.marks_obtained, 0) / total) : 0;
      const passCount = sectionMarks.filter((m) => m.marks_obtained >= 40).length;
      const passPct = total > 0 ? Math.round((passCount / total) * 100) : 0;
      const topStudent = sectionMarks.length > 0
        ? sectionMarks.reduce((best, m) => m.marks_obtained > best.marks_obtained ? m : best, sectionMarks[0])
        : null;
      const topName = topStudent ? (students.find((s) => s.id === topStudent.student_id)?.name ?? "—") : "—";
      return [{
        classId: sec.class_id,
        sectionId: sec.id,
        className: `${sec.className} — ${sec.name}`,
        totalEntries: total,
        average: avg,
        passPercentage: passPct,
        topStudent: topName,
        topMarks: topStudent?.marks_obtained ?? 0,
      }];
    }

    // Show per-section breakdown for all relevant classes
    return relevantClasses.flatMap((cls) =>
      cls.sections.map((sec) => {
        const sectionStudents = students.filter((s) => s.section_id === sec.id);
        const sectionMarks = marks.filter(
          (m) => m.exam_id === selectedExam && deptSubjectIds.includes(m.subject_id) &&
            sectionStudents.some((s) => s.id === m.student_id)
        );
        const total = sectionMarks.length;
        const avg = total > 0 ? Math.round(sectionMarks.reduce((s, m) => s + m.marks_obtained, 0) / total) : 0;
        const passCount = sectionMarks.filter((m) => m.marks_obtained >= 40).length;
        const passPct = total > 0 ? Math.round((passCount / total) * 100) : 0;
        const topStudent = sectionMarks.length > 0
          ? sectionMarks.reduce((best, m) => m.marks_obtained > best.marks_obtained ? m : best, sectionMarks[0])
          : null;
        const topName = topStudent ? (students.find((s) => s.id === topStudent.student_id)?.name ?? "—") : "—";
        return {
          classId: cls.id,
          sectionId: sec.id,
          className: `${cls.name} — ${sec.name}`,
          totalEntries: total,
          average: avg,
          passPercentage: passPct,
          topStudent: topName,
          topMarks: topStudent?.marks_obtained ?? 0,
        };
      })
    );
  }, [selectedExam, selectedSection, relevantClasses, deptSubjectIds, allSections]);

  // Detail: per-subject breakdown for selected class+section
  const detailBreakdown = useMemo(() => {
    if (!detailClass) return [];
    const filteredStudents = detailSection
      ? students.filter((s) => s.section_id === detailSection)
      : students.filter((s) => s.class_id === detailClass);
    return deptSubjects.map((subj) => {
      const subjMarks = marks.filter(
        (m) => m.exam_id === selectedExam && m.subject_id === subj.id &&
          filteredStudents.some((s) => s.id === m.student_id)
      );
      const total = subjMarks.length;
      const avg = total > 0 ? Math.round(subjMarks.reduce((s, m) => s + m.marks_obtained, 0) / total) : 0;
      const passCount = subjMarks.filter((m) => m.marks_obtained >= 40).length;
      const passPct = total > 0 ? Math.round((passCount / total) * 100) : 0;
      return { subjectName: subj.name, totalStudents: total, average: avg, passPercentage: passPct };
    });
  }, [detailClass, detailSection, selectedExam, deptSubjects]);

  return (
    <>
      <PageHeader
        title="Exam Review"
        breadcrumbs={[
          { label: "Dashboard", to: "/teacher" },
          { label: "Department", to: "/teacher/department" },
          { label: "Exam Review" },
        ]}
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select size="small" label="Select Exam" value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)}>
            {exams.map((ex) => <MenuItem key={ex.id} value={ex.id}>{ex.name}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select size="small" label="Filter by Section" value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
            <MenuItem value="">All Sections</MenuItem>
            {allSections.map((s) => <MenuItem key={s.id} value={s.id}>{s.className} — {s.name}</MenuItem>)}
          </TextField>
        </Grid>
      </Grid>

      {/* Section-wise Results */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Section-wise Exam Results — {department} Department
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Class & Section</TableCell>
              <TableCell align="center">Entries</TableCell>
              <TableCell align="center">Average Score</TableCell>
              <TableCell align="center">Pass %</TableCell>
              <TableCell>Top Student</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {classResults.map((r) => (
              <TableRow key={r.sectionId} hover>
                <TableCell>{r.className}</TableCell>
                <TableCell align="center">{r.totalEntries}</TableCell>
                <TableCell align="center">
                  <Chip label={r.average} size="small" color={r.average >= 60 ? "success" : r.average >= 40 ? "warning" : "error"} />
                </TableCell>
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
                <TableCell>
                  {r.topStudent} {r.topMarks > 0 && `(${r.topMarks})`}
                </TableCell>
                <TableCell align="center">
                  <Button size="small" onClick={() => { setDetailClass(r.classId); setDetailSection(r.sectionId); setDetailOpen(true); }}>
                    Breakdown
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {classResults.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary" sx={{ py: 2 }}>No data for this department</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Detail Dialog - Subject breakdown per section */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {getClassName(detailClass)}{detailSection ? ` — ${allSections.find((s) => s.id === detailSection)?.name ?? ""}` : ""} — Subject Breakdown
        </DialogTitle>
        <DialogContent dividers>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Subject</TableCell>
                <TableCell align="center">Students</TableCell>
                <TableCell align="center">Average</TableCell>
                <TableCell align="center">Pass %</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {detailBreakdown.map((d) => (
                <TableRow key={d.subjectName} hover>
                  <TableCell>{d.subjectName}</TableCell>
                  <TableCell align="center">{d.totalStudents}</TableCell>
                  <TableCell align="center">
                    <Chip label={d.average} size="small" color={d.average >= 60 ? "success" : "warning"} />
                  </TableCell>
                  <TableCell align="center">{d.passPercentage}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
