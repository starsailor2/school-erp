import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid, Paper, Typography, Stack, Box, Chip, Button, Divider,
  Table, TableHead, TableBody, TableRow, TableCell, LinearProgress,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import EventNoteIcon from "@mui/icons-material/EventNote";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import GradeIcon from "@mui/icons-material/Grade";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { StatCard } from "@/components/StatCard";
import { ChartCard } from "@/components/ChartCard";
import { PageHeader } from "@/components/PageHeader";
import { getChartPalette, getChartTooltipStyle } from "@/theme/chartPalette";
import { useColorMode } from "@/context/ColorModeContext";
import { useAuth } from "@/context/AuthContext";
import {
  teachers, getTeacherClasses, students, homework, getSubjectName,
  getClassName, timetable, attendanceRecords, marks,
} from "@/demo-data";
import { ANNOUNCEMENT_STORE_EVENT, getAnnouncements } from "@/demo-data/communication/announcementStore";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { user, teacherType } = useAuth();
  const { mode } = useColorMode();
  const palette = getChartPalette(mode);
  const tooltipStyle = getChartTooltipStyle(mode);
  const [announcementRows, setAnnouncementRows] = useState(() => getAnnouncements());

  useEffect(() => {
    const onUpdate = () => setAnnouncementRows(getAnnouncements());
    window.addEventListener(ANNOUNCEMENT_STORE_EVENT, onUpdate);
    return () => window.removeEventListener(ANNOUNCEMENT_STORE_EVENT, onUpdate);
  }, []);

  const teacher = teachers.find((t) => t.id === user?.id);
  const allocations = teacher ? getTeacherClasses(teacher.id) : [];
  const assignedClassIds = [...new Set(allocations.map((a) => a.class_id))];
  const myStudents = students.filter((s) => assignedClassIds.includes(s.class_id));
  const myHomework = homework.filter((h) => h.teacher_id === teacher?.id);
  const avgAtt = myStudents.length > 0
    ? Math.round(myStudents.reduce((s, st) => s + st.attendance_pct, 0) / myStudents.length)
    : 0;

  const LUNCH_PERIOD = 5;
  const myWeekEntries: Record<string, { period: number; time: string; subject: string; class_name: string; section: string; type: "class" | "lunch" | "free" }[]> = {};
  let maxPeriods = 0;
  for (const day of DAYS) {
    const allDayEntries = timetable[day] ?? [];
    const teacherEntries = allDayEntries.filter((e) => e.teacher === teacher?.name);
    const dayMax = allDayEntries.reduce((m, e) => Math.max(m, e.period), 0);
    if (dayMax > maxPeriods) maxPeriods = dayMax;
    const daySlots: typeof myWeekEntries[string] = [];
    for (let p = 1; p <= dayMax; p++) {
      if (p === LUNCH_PERIOD) {
        daySlots.push({ period: p, time: "12:00 - 12:30", subject: "Lunch Break", class_name: "", section: "", type: "lunch" });
      } else {
        const entry = teacherEntries.find((e) => e.period === p);
        if (entry) {
          daySlots.push({ period: p, time: entry.time, subject: entry.subject, class_name: entry.class_name, section: entry.section, type: "class" });
        } else {
          const anyEntry = allDayEntries.find((e) => e.period === p);
          daySlots.push({ period: p, time: anyEntry?.time ?? "", subject: "Free", class_name: "", section: "", type: "free" });
        }
      }
    }
    myWeekEntries[day] = daySlots;
  }

  const currentHour = new Date().getHours();
  const todayName = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1] ?? "";
  const todayClasses = myWeekEntries[todayName]?.filter((e) => e.type === "class").length ?? 0;

  const today = new Date().toISOString().split("T")[0];
  const upcomingHomework = myHomework
    .filter((h) => h.due_date >= today)
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
    .slice(0, 5);
  const overdueHomework = myHomework.filter((h) => h.due_date < today);

  const teacherAnnouncements = announcementRows
    .filter((a) => a.target === "all" || a.target === "teacher")
    .slice(0, 3);

  const periods = Array.from({ length: maxPeriods || 8 }, (_, i) => i + 1);

  const myStudentIds = new Set(myStudents.map((s) => s.id));
  const classAttendanceTrend = (() => {
    const byDate = new Map<string, { present: number; total: number }>();
    for (const a of attendanceRecords) {
      if (!myStudentIds.has(a.student_id)) continue;
      const entry = byDate.get(a.date) ?? { present: 0, total: 0 };
      entry.total += 1;
      if (a.status === "present") entry.present += 1;
      byDate.set(a.date, entry);
    }
    return [...byDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, v]) => ({
        day: new Date(date).toLocaleDateString("en", { day: "2-digit", month: "short" }),
        attendance: v.total > 0 ? Math.round((v.present / v.total) * 100) : 0,
      }));
  })();

  const homeworkCompletionData = (() => {
    const bySubject = new Map<string, number>();
    for (const h of myHomework) {
      const name = getSubjectName(h.subject_id);
      bySubject.set(name, (bySubject.get(name) ?? 0) + 1);
    }
    return [...bySubject.entries()].map(([subject, assigned]) => ({ subject, assigned }));
  })();

  const crossClassPerformance = (() => {
    return assignedClassIds.map((classId) => {
      const classStudentIds = new Set(students.filter((s) => s.class_id === classId).map((s) => s.id));
      const classMarks = marks.filter((m) => classStudentIds.has(m.student_id));
      const avg = classMarks.length > 0 ? classMarks.reduce((s, m) => s + m.marks_obtained, 0) / classMarks.length : 0;
      return { name: getClassName(classId), avgScore: Math.round(avg) };
    });
  })();

  return (
    <>
      <PageHeader title="My Dashboard" eyebrow="Teacher Portal" />
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
        <Box>
          <Typography variant="h6" fontWeight={600}>
            Good {currentHour < 12 ? "morning" : currentHour < 17 ? "afternoon" : "evening"}, {teacher?.name ?? "Teacher"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {teacher?.teacher_type.replace("_", " ")} · {teacher?.department} · {teacher?.subjects.map(getSubjectName).join(", ")}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button size="small" variant="contained" startIcon={<CheckCircleIcon />} onClick={() => navigate("/teacher/attendance")}>Take Attendance</Button>
          <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => navigate("/teacher/homework")}>Assign Homework</Button>
          <Button size="small" variant="outlined" startIcon={<GradeIcon />} onClick={() => navigate("/teacher/exams")}>Enter Marks</Button>
        </Stack>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard title="Today's Classes" value={todayClasses} numericValue={todayClasses} icon={<ScheduleIcon />} onClick={() => navigate("/teacher/timetable")} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard title="My Students" value={myStudents.length} numericValue={myStudents.length} icon={<PeopleIcon />} onClick={() => navigate("/teacher/students")} delay={0.05} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard title="Pending Homework" value={upcomingHomework.length} numericValue={upcomingHomework.length} icon={<AssignmentIcon />} onClick={() => navigate("/teacher/homework/list")} delay={0.1} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard title="Avg Attendance" value={`${avgAtt}%`} numericValue={avgAtt} formatValue={(n) => `${n}%`} icon={<EventNoteIcon />} onClick={() => navigate("/teacher/attendance/history")} delay={0.15} />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard eyebrow="Attendance" title="My Classes — Attendance Trend (14 days)">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={classAttendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
                <XAxis dataKey="day" stroke={palette.axis} fontSize={11} />
                <YAxis domain={[60, 100]} stroke={palette.axis} fontSize={12} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="attendance" name="Attendance %" stroke={palette.categorical[0]} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard eyebrow="Homework" title="Homework by Subject">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={homeworkCompletionData}>
                <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
                <XAxis dataKey="subject" stroke={palette.axis} fontSize={11} />
                <YAxis stroke={palette.axis} fontSize={12} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="assigned" name="Assigned" fill={palette.categorical[0]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>

      {teacherType === "hod" && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={12}>
            <ChartCard eyebrow="Department" title="Cross-Class Performance Comparison">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={crossClassPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
                  <XAxis dataKey="name" stroke={palette.axis} fontSize={11} />
                  <YAxis domain={[0, 100]} stroke={palette.axis} fontSize={12} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="avgScore" name="Avg Score" fill={palette.categorical[0]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
        </Grid>
      )}

      <Grid container spacing={2}>
        <Grid size={12}>
          <Paper sx={{ p: 2, overflowX: "auto" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CalendarTodayIcon color="primary" />
                <Typography variant="subtitle1" fontWeight={600}>My Weekly Timetable</Typography>
              </Box>
              <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate("/teacher/timetable")}>Full Timetable</Button>
            </Box>
            <Table size="small" sx={{ minWidth: 700 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "action.hover", position: "sticky", left: 0, zIndex: 1 }}>Day</TableCell>
                  {periods.map((p) => {
                    const isLunch = p === LUNCH_PERIOD;
                    return (
                      <TableCell key={p} align="center" sx={{ fontWeight: 700, bgcolor: isLunch ? "action.selected" : "action.hover", minWidth: isLunch ? 70 : 90 }}>
                        {isLunch ? "Lunch" : `P${p}`}<br />
                        <Typography variant="caption" color="text.secondary">
                          {isLunch ? "12:00" : p < LUNCH_PERIOD ? `${7 + p}:00` : `${6 + p}:00`}
                        </Typography>
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {DAYS.map((day) => {
                  const isToday = day === todayName;
                  return (
                    <TableRow key={day} sx={{ bgcolor: isToday ? "action.selected" : "transparent" }}>
                      <TableCell sx={{
                        fontWeight: 600,
                        position: "sticky", left: 0, zIndex: 1,
                        bgcolor: isToday ? "action.selected" : "background.paper",
                        whiteSpace: "nowrap",
                      }}>
                        {day}
                        {isToday && <Chip label="Today" size="small" color="primary" sx={{ ml: 1 }} />}
                      </TableCell>
                      {periods.map((p) => {
                        const entry = myWeekEntries[day]?.find((e) => e.period === p);
                        if (!entry) {
                          return (
                            <TableCell key={p} align="center" sx={{ color: "text.disabled", fontSize: 12 }}>
                              —
                            </TableCell>
                          );
                        }
                        if (entry.type === "lunch") {
                          return (
                            <TableCell key={p} align="center" sx={{ bgcolor: "action.hover" }}>
                              <Typography variant="caption" fontWeight={600} color="warning.main">🍽 Lunch</Typography>
                            </TableCell>
                          );
                        }
                        if (entry.type === "free") {
                          return (
                            <TableCell key={p} align="center" sx={{ bgcolor: "action.hover" }}>
                              <Typography variant="caption" color="success.main" fontWeight={500}>Free</Typography>
                            </TableCell>
                          );
                        }
                        const periodHour = p < LUNCH_PERIOD ? 7 + p : 6 + p;
                        const isNow = isToday && periodHour === currentHour;
                        return (
                          <TableCell key={p} align="center" sx={{
                            ...(isNow && { outline: "2px solid", outlineColor: "primary.main", borderRadius: 1 }),
                          }}>
                            <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                              {entry.class_name}-{entry.section}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                              {entry.subject}
                            </Typography>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <Typography variant="subtitle1" fontWeight={600}>Upcoming Homework</Typography>
              <Button size="small" onClick={() => navigate("/teacher/homework/list")}>View All</Button>
            </Box>
            {overdueHomework.length > 0 && (
              <Chip label={`${overdueHomework.length} overdue`} size="small" color="error" sx={{ mb: 1 }} />
            )}
            <Stack spacing={1.5}>
              {upcomingHomework.map((h) => (
                <Box key={h.id}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>{h.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {getClassName(h.class_id)} · {getSubjectName(h.subject_id)}
                      </Typography>
                    </Box>
                    <Chip
                      label={h.due_date}
                      size="small"
                      color={h.due_date === today ? "warning" : "default"}
                      variant="outlined"
                    />
                  </Box>
                  <Divider sx={{ mt: 1 }} />
                </Box>
              ))}
              {upcomingHomework.length === 0 && (
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 2 }}>
                  No upcoming homework
                </Typography>
              )}
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <Typography variant="subtitle1" fontWeight={600}>My Classes</Typography>
              <Button size="small" onClick={() => navigate("/teacher/classes")}>View All</Button>
            </Box>
            <Stack spacing={1.5}>
              {allocations.slice(0, 5).map((a) => {
                const sectionStudents = students.filter((s) => s.section_id === a.section_id);
                const classAvgAtt = sectionStudents.length > 0
                  ? Math.round(sectionStudents.reduce((s, st) => s + st.attendance_pct, 0) / sectionStudents.length)
                  : 0;
                return (
                  <Box key={a.id}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>{getClassName(a.class_id)}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {getSubjectName(a.subject_id)} · {sectionStudents.length} students
                        </Typography>
                      </Box>
                      <Chip label={`${classAvgAtt}%`} size="small"
                        color={classAvgAtt >= 85 ? "success" : classAvgAtt >= 75 ? "warning" : "error"} />
                    </Box>
                    <LinearProgress variant="determinate" value={classAvgAtt} sx={{ mt: 0.5, height: 4, borderRadius: 2 }} />
                  </Box>
                );
              })}
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <Typography variant="subtitle1" fontWeight={600}>Announcements</Typography>
              <Button size="small" onClick={() => navigate("/teacher/announcements")}>View All</Button>
            </Box>
            <Stack spacing={1}>
              {teacherAnnouncements.map((a) => (
                <Box key={a.id} sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                  <Chip label={a.priority} size="small"
                    color={a.priority === "high" ? "error" : a.priority === "medium" ? "warning" : "default"}
                    sx={{ mt: 0.3, minWidth: 60 }} />
                  <Box>
                    <Typography variant="body2" fontWeight={500}>{a.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{a.date}</Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
