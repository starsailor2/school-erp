import { useState } from "react";
import {
  Paper, Table, TableHead, TableBody, TableRow, TableCell, Chip, Typography, Stack,
  Tabs, Tab, Box, Grid, Dialog, DialogTitle, DialogContent, DialogActions, Button,
} from "@mui/material";
import QuizIcon from "@mui/icons-material/Quiz";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { students, getStudentMarks, getSubjectName, exams } from "@/demo-data";

export default function StudentExams() {
  const { user } = useAuth();
  const student = students.find((s) => s.id === user?.id);
  const marks = student ? getStudentMarks(student.id) : [];
  const [tab, setTab] = useState(0);
  const [reportExam, setReportExam] = useState<string | null>(null);

  const now = new Date();
  const upcomingExams = exams.filter((e) => new Date(e.start_date) >= now);
  const pastExams = exams.filter((e) => new Date(e.end_date) < now);
  const ongoingExams = exams.filter((e) => new Date(e.start_date) <= now && new Date(e.end_date) >= now);

  const reportMarks = reportExam ? marks.filter((m) => m.exam_id === reportExam) : [];
  const reportTotal = reportMarks.reduce((s, m) => s + m.marks_obtained, 0);
  const reportMax = reportMarks.reduce((s, m) => s + m.max_marks, 0);
  const reportPct = reportMax ? Math.round((reportTotal / reportMax) * 100) : 0;

  return (
    <>
      <PageHeader title="Exams & Results" breadcrumbs={[{ label: "Dashboard", to: "/student" }, { label: "Exams" }]} />

      <Paper sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Exam Schedule" />
          <Tab label="Results" />
        </Tabs>
      </Paper>

      {tab === 0 && (
        <>
          {/* Upcoming Exams */}
          {upcomingExams.length > 0 && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>Upcoming Exams</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Exam</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell>Days Left</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {upcomingExams.map((e) => {
                    const daysLeft = Math.ceil((new Date(e.start_date).getTime() - now.getTime()) / 86400000);
                    return (
                      <TableRow key={e.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>{e.name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={e.exam_type.replace("_", " ")} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>{e.start_date}</TableCell>
                        <TableCell>{e.end_date}</TableCell>
                        <TableCell>
                          <Chip label={`${daysLeft} days`} size="small" color={daysLeft <= 7 ? "warning" : "default"} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Paper>
          )}

          {/* Ongoing Exams */}
          {ongoingExams.length > 0 && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Ongoing Exams
              </Typography>
              {ongoingExams.map((e) => (
                <Paper key={e.id} variant="outlined" sx={{ p: 2, mb: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body1" fontWeight={500}>{e.name}</Typography>
                    <Chip label="In Progress" size="small" color="info" />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">{e.start_date} — {e.end_date}</Typography>
                </Paper>
              ))}
            </Paper>
          )}

          {/* Completed Exams */}
          {pastExams.length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>Completed Exams</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Exam</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pastExams.map((e) => (
                    <TableRow key={e.id} hover>
                      <TableCell>{e.name}</TableCell>
                      <TableCell><Chip label={e.exam_type.replace("_", " ")} size="small" variant="outlined" /></TableCell>
                      <TableCell>{e.start_date} — {e.end_date}</TableCell>
                      <TableCell><Chip label="Completed" size="small" color="success" variant="outlined" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          )}

          {upcomingExams.length === 0 && ongoingExams.length === 0 && pastExams.length === 0 && (
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <QuizIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
              <Typography color="text.secondary">No exams scheduled yet</Typography>
            </Paper>
          )}
        </>
      )}

      {tab === 1 && (
        <>
          {exams.map((exam) => {
            const examMarks = marks.filter((m) => m.exam_id === exam.id);
            if (!examMarks.length) return null;
            const total = examMarks.reduce((s, m) => s + m.marks_obtained, 0);
            const maxTotal = examMarks.reduce((s, m) => s + m.max_marks, 0);
            const pct = maxTotal ? Math.round((total / maxTotal) * 100) : 0;
            return (
              <Paper key={exam.id} sx={{ p: 2, mb: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6">{exam.name}</Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip label={`${pct}%`} color={pct >= 80 ? "success" : pct >= 50 ? "warning" : "error"} />
                    <Button size="small" variant="outlined" onClick={() => setReportExam(exam.id)}>
                      Report Card
                    </Button>
                  </Stack>
                </Stack>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Subject</TableCell>
                      <TableCell align="center">Marks</TableCell>
                      <TableCell align="center">Max</TableCell>
                      <TableCell align="center">%</TableCell>
                      <TableCell align="center">Grade</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {examMarks.map((m) => (
                      <TableRow key={m.id} hover>
                        <TableCell>{getSubjectName(m.subject_id)}</TableCell>
                        <TableCell align="center">{m.marks_obtained}</TableCell>
                        <TableCell align="center">{m.max_marks}</TableCell>
                        <TableCell align="center">{Math.round((m.marks_obtained / m.max_marks) * 100)}%</TableCell>
                        <TableCell align="center">
                          <Chip label={m.grade} size="small" color={m.grade.startsWith("A") ? "success" : m.grade.startsWith("B") ? "info" : "warning"} />
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: "action.hover" }}>
                      <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>{total}</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>{maxTotal}</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>{pct}%</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              </Paper>
            );
          })}
          {marks.length === 0 && (
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <QuizIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
              <Typography color="text.secondary">No exam results available yet</Typography>
            </Paper>
          )}
        </>
      )}

      {/* Report Card Modal */}
      <Dialog open={!!reportExam} onClose={() => setReportExam(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Report Card — {exams.find((e) => e.id === reportExam)?.name}</DialogTitle>
        <DialogContent dividers>
          {student && (
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Student</Typography>
                  <Typography variant="body2" fontWeight={500}>{student.name}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Admission No</Typography>
                  <Typography variant="body2" fontWeight={500}>{student.admission_number}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Roll Number</Typography>
                  <Typography variant="body2" fontWeight={500}>{student.roll_number}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Overall</Typography>
                  <Typography variant="body2" fontWeight={500} color={reportPct >= 80 ? "success.main" : reportPct >= 50 ? "warning.main" : "error.main"}>
                    {reportTotal}/{reportMax} ({reportPct}%)
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Subject</TableCell>
                <TableCell align="center">Marks</TableCell>
                <TableCell align="center">Max</TableCell>
                <TableCell align="center">Grade</TableCell>
                <TableCell>Remark</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportMarks.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{getSubjectName(m.subject_id)}</TableCell>
                  <TableCell align="center">{m.marks_obtained}</TableCell>
                  <TableCell align="center">{m.max_marks}</TableCell>
                  <TableCell align="center"><Chip label={m.grade} size="small" color={m.grade.startsWith("A") ? "success" : m.grade.startsWith("B") ? "info" : "warning"} /></TableCell>
                  <TableCell>
                    {m.marks_obtained >= 90 ? "Excellent" : m.marks_obtained >= 75 ? "Very Good" : m.marks_obtained >= 60 ? "Good" : m.marks_obtained >= 40 ? "Needs Improvement" : "Below Average"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportExam(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
