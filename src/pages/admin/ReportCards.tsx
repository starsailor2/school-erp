import { useState } from "react";
import {
  MenuItem, TextField, Grid, Paper, Typography, Avatar, Stack, Divider, Chip, Box, Button,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import { PageHeader } from "@/components/PageHeader";
import { CategoryTag } from "@/components/CategoryTag";
import { students, marks, exams, getSubjectName, getClassName } from "@/demo-data";

export default function ReportCards() {
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const [examId, setExamId] = useState(exams[0]?.id ?? "");

  const student = students.find((s) => s.id === studentId);
  const studentMarks = marks.filter((m) => m.student_id === studentId && m.exam_id === examId);
  const total = studentMarks.reduce((s, m) => s + m.marks_obtained, 0);
  const maxTotal = studentMarks.reduce((s, m) => s + m.max_marks, 0);
  const pct = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;
  const exam = exams.find((ex) => ex.id === examId);

  return (
    <>
      <PageHeader
        title="Report Cards"
        breadcrumbs={[
          { label: "Dashboard", to: "/admin" },
          { label: "Examinations", to: "/admin/exams" },
          { label: "Report Cards" },
        ]}
        action={
          <Button variant="contained" size="small" startIcon={<PrintIcon />} disabled={!student} onClick={() => window.print()}>
            Print
          </Button>
        }
      />
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #report-card-printable, #report-card-printable * { visibility: visible; }
          #report-card-printable { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; border: none; }
        }
      `}</style>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select size="small" label="Student" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
            {students.slice(0, 20).map((s) => (
              <MenuItem key={s.id} value={s.id}>{s.name} - {getClassName(s.class_id)}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select size="small" label="Exam" value={examId} onChange={(e) => setExamId(e.target.value)}>
            {exams.map((examItem) => (
              <MenuItem key={examItem.id} value={examItem.id}>{examItem.name}</MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      {student && (
        <Paper id="report-card-printable" sx={{ p: 3, maxWidth: 700 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: "primary.main" }}>{student.name.charAt(0)}</Avatar>
            <Box>
              <Typography variant="h6">{student.name}</Typography>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                <CategoryTag label={getClassName(student.class_id).replace("Class ", "C")} fullName={getClassName(student.class_id)} />
                <Typography variant="body2" color="text.secondary">
                  Roll No. {student.roll_number} | {student.admission_number}
                </Typography>
              </Stack>
            </Box>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>{exam?.name ?? "Exam"} Results</Typography>
          <Stack spacing={1}>
            {studentMarks.map((m) => (
              <Box key={m.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2">{getSubjectName(m.subject_id)}</Typography>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <Typography variant="body2" fontWeight={600}>{m.marks_obtained}/{m.max_marks}</Typography>
                  <Chip label={m.grade} size="small" color={m.marks_obtained >= 80 ? "success" : m.marks_obtained >= 50 ? "warning" : "error"} />
                </Box>
              </Box>
            ))}
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="subtitle2">Overall</Typography>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Typography variant="subtitle2" fontWeight={700}>{total}/{maxTotal} ({pct}%)</Typography>
              <Chip label={pct >= 80 ? "Distinction" : pct >= 60 ? "First Class" : pct >= 40 ? "Pass" : "Fail"} size="small" color={pct >= 80 ? "success" : pct >= 40 ? "warning" : "error"} />
            </Box>
          </Box>
        </Paper>
      )}
    </>
  );
}
