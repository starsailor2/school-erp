import { useEffect, useState } from "react";
import { Paper, Typography, Stack, Grid, Chip, Box } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import AssignmentIcon from "@mui/icons-material/Assignment";
import QuizIcon from "@mui/icons-material/Quiz";
import CampaignIcon from "@mui/icons-material/Campaign";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { ChartCard } from "@/components/ChartCard";
import { getChartPalette, getChartTooltipStyle, getIconAccent } from "@/theme/chartPalette";
import { useColorMode } from "@/context/ColorModeContext";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  students, classes, getStudentAttendance, getStudentMarks, getSubjectName,
  getClassName, homework as allHomework, exams, timetable,
  getHostelAllocationForStudent, getMessPlanForStudent, hostelRooms, hostelBlocks,
} from "@/demo-data";
import { ANNOUNCEMENT_STORE_EVENT, getAnnouncements } from "@/demo-data/communication/announcementStore";

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { mode } = useColorMode();
  const palette = getChartPalette(mode);
  const tooltipStyle = getChartTooltipStyle(mode);
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

  const gradeTrend = exams.map((exam) => {
    const examMarks = marks.filter((m) => m.exam_id === exam.id);
    return {
      exam: exam.name,
      avgScore: examMarks.length ? Math.round(examMarks.reduce((s, m) => s + m.marks_obtained, 0) / examMarks.length) : 0,
    };
  });

  const hostelAllocation = student ? getHostelAllocationForStudent(student.id) : undefined;
  const room = hostelAllocation ? hostelRooms.find((r) => r.id === hostelAllocation.room_id) : undefined;
  const block = room ? hostelBlocks.find((b) => b.id === room.block_id) : undefined;
  const messPlan = student ? getMessPlanForStudent(student.id) : undefined;

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
      <PageHeader title={`Welcome, ${student?.name ?? "Student"}`} eyebrow="Student Portal" breadcrumbs={[{ label: "Dashboard" }]} />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Attendance" value={`${pct}%`} numericValue={pct} formatValue={(n) => `${n}%`} icon={<EventAvailableIcon />} color={getIconAccent(mode, "attendance")} onClick={() => navigate("/student/attendance")} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Pending Homework" value={pendingHw.length} numericValue={pendingHw.length} icon={<AssignmentIcon />} color={getIconAccent(mode, "homework")} onClick={() => navigate("/student/homework")} delay={0.05} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Upcoming Exams" value={upcomingExams.length} numericValue={upcomingExams.length} icon={<QuizIcon />} color={getIconAccent(mode, "exams")} onClick={() => navigate("/student/exams")} delay={0.1} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Announcements" value={studentAnnouncements.length} numericValue={studentAnnouncements.length} icon={<CampaignIcon />} color={getIconAccent(mode, "announcements")} onClick={() => navigate("/student/announcements")} delay={0.15} />
        </Grid>
      </Grid>

      {(hostelAllocation || messPlan) && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {hostelAllocation && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>Hostel</Typography>
                <Stack spacing={0.5}>
                  <Typography variant="body2">Block: {block?.name}</Typography>
                  <Typography variant="body2">Room: {room?.room_number} ({room?.type})</Typography>
                  <Typography variant="body2">Since: {hostelAllocation.check_in_date}</Typography>
                </Stack>
              </Paper>
            </Grid>
          )}
          {messPlan && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>Mess Plan</Typography>
                <Stack spacing={0.5}>
                  <Typography variant="body2">Plan: {messPlan.plan_type === "veg" ? "Vegetarian" : "Non-Vegetarian"}</Typography>
                  <Typography variant="body2">Since: {messPlan.subscribed_since}</Typography>
                </Stack>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

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

          {/* Grade trend */}
          {marks.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <ChartCard eyebrow="Academics" title="Grade Trend Across Exams">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={gradeTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
                    <XAxis dataKey="exam" stroke={palette.axis} fontSize={11} />
                    <YAxis domain={[0, 100]} stroke={palette.axis} fontSize={12} />
                    <Tooltip {...tooltipStyle} />
                    <Line type="monotone" dataKey="avgScore" name="Average Score" stroke={palette.categorical[0]} strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </Box>
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
