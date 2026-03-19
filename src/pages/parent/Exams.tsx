import { Paper, Table, TableHead, TableBody, TableRow, TableCell, Chip, Typography, Stack, MenuItem, TextField, Tabs, Tab } from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { parents, getChildrenOfParent, getStudentMarks, getSubjectName, getClassName, exams } from "@/data/mock";
import { useState } from "react";

export default function ParentExams() {
  const { user, selectedChildId, setSelectedChildId } = useAuth();
  const parent = parents.find((p) => p.id === user?.id);
  const children = parent ? getChildrenOfParent(parent.id) : [];
  const child = children.find((c) => c.id === selectedChildId) ?? children[0];
  const marks = child ? getStudentMarks(child.id) : [];
  const [tab, setTab] = useState(0);

  const today = new Date().toISOString().split("T")[0];
  const upcomingExams = exams.filter((e) => e.end_date >= today);
  const pastExams = exams.filter((e) => e.end_date < today);

  return (
    <>
      <PageHeader title="Exams & Results" breadcrumbs={[{ label: "Dashboard", to: "/parent" }, { label: "Exams & Results" }]} />

      {children.length > 1 && (
        <TextField
          select size="small" label="Select Child" value={selectedChildId ?? children[0]?.id ?? ""}
          onChange={(e) => setSelectedChildId(e.target.value)}
          sx={{ mb: 2, minWidth: 280 }}
        >
          {children.map((c) => (
            <MenuItem key={c.id} value={c.id}>{c.name} — {getClassName(c.class_id)}</MenuItem>
          ))}
        </TextField>
      )}

      {!child ? (
        <Typography color="text.secondary">Select a child from the dashboard.</Typography>
      ) : (
        <>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            <strong>{child.name}</strong> — {getClassName(child.class_id)}
          </Typography>

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
                <Paper sx={{ p: 3, mb: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Upcoming Exams</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Exam</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Start Date</TableCell>
                        <TableCell>End Date</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {upcomingExams.map((e) => (
                        <TableRow key={e.id}>
                          <TableCell sx={{ fontWeight: 600 }}>{e.name}</TableCell>
                          <TableCell><Chip label={e.exam_type.replace("_", " ")} size="small" variant="outlined" sx={{ textTransform: "capitalize" }} /></TableCell>
                          <TableCell>{e.start_date}</TableCell>
                          <TableCell>{e.end_date}</TableCell>
                          <TableCell>
                            <Chip
                              label={e.start_date > today ? "Upcoming" : "In Progress"}
                              size="small"
                              color={e.start_date > today ? "info" : "warning"}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              )}

              {/* Past Exams */}
              {pastExams.length > 0 && (
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Completed Exams</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Exam</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Start Date</TableCell>
                        <TableCell>End Date</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pastExams.map((e) => (
                        <TableRow key={e.id}>
                          <TableCell sx={{ fontWeight: 600 }}>{e.name}</TableCell>
                          <TableCell><Chip label={e.exam_type.replace("_", " ")} size="small" variant="outlined" sx={{ textTransform: "capitalize" }} /></TableCell>
                          <TableCell>{e.start_date}</TableCell>
                          <TableCell>{e.end_date}</TableCell>
                          <TableCell><Chip label="Completed" size="small" color="success" /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              )}

              {upcomingExams.length === 0 && pastExams.length === 0 && (
                <Paper sx={{ p: 4, textAlign: "center" }}>
                  <Typography color="text.secondary">No exams scheduled yet.</Typography>
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
                  <Paper key={exam.id} sx={{ p: 3, mb: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Typography variant="h6">{exam.name}</Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip label={`${total}/${maxTotal}`} size="small" variant="outlined" />
                        <Chip label={`${pct}%`} color={pct >= 80 ? "success" : pct >= 50 ? "warning" : "error"} />
                      </Stack>
                    </Stack>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Subject</TableCell>
                          <TableCell align="center">Marks Obtained</TableCell>
                          <TableCell align="center">Max Marks</TableCell>
                          <TableCell align="center">Percentage</TableCell>
                          <TableCell align="center">Grade</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {examMarks.map((m) => (
                          <TableRow key={m.id}>
                            <TableCell>{getSubjectName(m.subject_id)}</TableCell>
                            <TableCell align="center">{m.marks_obtained}</TableCell>
                            <TableCell align="center">{m.max_marks}</TableCell>
                            <TableCell align="center">{Math.round((m.marks_obtained / m.max_marks) * 100)}%</TableCell>
                            <TableCell align="center">
                              <Chip label={m.grade} size="small" color={m.grade === "A" || m.grade === "A+" ? "success" : m.grade === "B" || m.grade === "B+" ? "info" : "default"} />
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
                  <Typography color="text.secondary">No exam results available yet for {child.name}.</Typography>
                </Paper>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}
