import { useEffect, useState } from "react";
import { Paper, Typography, Stack, Grid, Chip, Box } from "@mui/material";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import AssignmentIcon from "@mui/icons-material/Assignment";
import QuizIcon from "@mui/icons-material/Quiz";
import CampaignIcon from "@mui/icons-material/Campaign";
import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  students, classes, getStudentAttendance, getStudentMarks, getSubjectName,
  getClassName, homework as allHomework, exams, timetable,
} from "@/demo-data";
import { ANNOUNCEMENT_STORE_EVENT, getAnnouncements } from "@/demo-data/communication/announcementStore";

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [announcementRows, setAnnouncementRows] = useState(() => getAnnouncements());

  useEffect(() => {
    const onUpdate = () => setAnnouncementRows(getAnnouncements());
    window.addEventListener(ANNOUNCEMENT_STORE_EVENT, onUpdate);
    return () => window.removeEventListener(ANNOUNCEMENT_STORE_EVENT, onUpdate);
  }, []);
  const student = students.find((s) => s.id === user?.id);
  const attendance = student ? getStudentAttendance(student.id) : [];
  const marks = student ? getStudentMarks(student.id) : [];
  const present = attendance.filter((a) => a.status === "present").length;
  const pct = attendance.length ? Math.round((present / attendance.length) * 100) : 0;
  const myHomework = allHomework.filter((h) => h.class_id === student?.class_id);
  const pendingHw = myHomework.filter((h) => new Date(h.due_date) >= new Date());
  const upcomingExams = exams.filter((e) => new Date(e.start_date) >= new Date());
  const studentAnnouncements = announcementRows.filter((a) => a.target === "all" || a.target === "student");

  // Parse student class/section for timetable
  const cls = student ? classes.find((c) => c.id === student.class_id) : null;
  const sec = cls?.sections.find((s) => s.id === student?.section_id);
  const classNum = cls?.name.replace("Class ", "") ?? "";
  const sectionLetter = sec?.name ?? "";
  const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()];
  const todayEntries = (timetable[dayName] ?? []).filter(
    (e) => e.class_name === classNum && e.section === sectionLetter
  );

  return (
    <>
      <PageHeader title={`Welcome, ${student?.name ?? "Student"}`} breadcrumbs={[{ label: "Dashboard" }]} />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard title="Attendance" value={`${pct}%`} icon={<EventAvailableIcon />} color="primary.main" onClick={() => navigate("/student/attendance")} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard title="Pending Homework" value={pendingHw.length} icon={<AssignmentIcon />} color="error.main" onClick={() => navigate("/student/homework")} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard title="Upcoming Exams" value={upcomingExams.length} icon={<QuizIcon />} color="warning.main" onClick={() => navigate("/student/exams")} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard title="Announcements" value={studentAnnouncements.length} icon={<CampaignIcon />} color="success.main" onClick={() => navigate("/student/announcements")} />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {/* Today's Timetable */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Today's Timetable — {dayName}
            </Typography>
            {todayEntries.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No classes today</Typography>
            ) : (
              <Stack spacing={1}>
                {todayEntries.map((e) => (
                  <Box key={e.period} sx={{ display: "flex", alignItems: "center", gap: 1, p: 1, borderRadius: 1, bgcolor: e.subject === "Lunch Break" ? "action.selected" : "transparent" }}>
                    <Chip label={`P${e.period}`} size="small" variant="outlined" />
                    <Typography variant="body2" fontWeight={500} sx={{ flex: 1 }}>{e.subject}</Typography>
                    <Typography variant="caption" color="text.secondary">{e.time}</Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>

          {/* Marks summary */}
          {marks.length > 0 && (
            <Paper sx={{ p: 2, mt: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>Latest Results</Typography>
              <Stack spacing={1}>
                {marks.slice(0, 5).map((m) => (
                  <Box key={m.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body2">{getSubjectName(m.subject_id)}</Typography>
                    <Chip label={`${m.marks_obtained}/${m.max_marks} — ${m.grade}`} size="small" color={m.marks_obtained >= 80 ? "success" : m.marks_obtained >= 50 ? "warning" : "error"} />
                  </Box>
                ))}
              </Stack>
            </Paper>
          )}
        </Grid>

        {/* Right column */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Grid container spacing={2}>
            {/* Pending Homework */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper sx={{ p: 2, height: "100%" }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>Pending Homework</Typography>
                {pendingHw.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">All caught up! 🎉</Typography>
                ) : (
                  <Stack spacing={1}>
                    {pendingHw.slice(0, 5).map((h) => {
                      const daysLeft = Math.ceil((new Date(h.due_date).getTime() - Date.now()) / 86400000);
                      return (
                        <Box key={h.id} sx={{ p: 1, borderRadius: 1, bgcolor: "action.hover" }}>
                          <Typography variant="body2" fontWeight={500}>{getSubjectName(h.subject_id)}</Typography>
                          <Typography variant="caption" color="text.secondary">{h.title}</Typography>
                          <Chip
                            label={daysLeft <= 0 ? "Due today" : daysLeft === 1 ? "Due tomorrow" : `${daysLeft} days left`}
                            size="small" sx={{ ml: 1 }}
                            color={daysLeft <= 1 ? "error" : "warning"}
                          />
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </Paper>
            </Grid>

            {/* Announcements */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper sx={{ p: 2, height: "100%" }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>Announcements</Typography>
                <Stack spacing={1}>
                  {studentAnnouncements.slice(0, 5).map((a) => (
                    <Box key={a.id} sx={{ p: 1, borderRadius: 1, bgcolor: "action.hover" }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" fontWeight={500}>{a.title}</Typography>
                        <Chip label={a.priority} size="small" color={a.priority === "high" ? "error" : a.priority === "medium" ? "warning" : "default"} variant="outlined" />
                      </Stack>
                      <Typography variant="caption" color="text.secondary">{a.date}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Grid>

            {/* Attendance Summary */}
            <Grid size={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>Attendance Summary</Typography>
                <Stack direction="row" spacing={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Total Days</Typography>
                    <Typography variant="h6">{attendance.length}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Present</Typography>
                    <Typography variant="h6" color="success.main">{present}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Absent</Typography>
                    <Typography variant="h6" color="error.main">{attendance.filter((a) => a.status === "absent").length}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Class</Typography>
                    <Typography variant="h6">{student ? getClassName(student.class_id) : "—"} {sectionLetter}</Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
