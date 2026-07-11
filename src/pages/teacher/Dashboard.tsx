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
import { KpiCard } from "@/components/KpiCard";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import {
  teachers, getTeacherClasses, students, homework, getSubjectName,
  getClassName, timetable,
} from "@/demo-data";
import { ANNOUNCEMENT_STORE_EVENT, getAnnouncements } from "@/demo-data/communication/announcementStore";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
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

  // Build weekly timetable grid for this teacher
  // Include all periods for any day that has at least one class for this teacher
  const LUNCH_PERIOD = 5;
  const myWeekEntries: Record<string, { period: number; time: string; subject: string; class_name: string; section: string; type: "class" | "lunch" | "free" }[]> = {};
  let maxPeriods = 0;
  for (const day of DAYS) {
    const allDayEntries = timetable[day] ?? [];
    const teacherEntries = allDayEntries.filter((e) => e.teacher === teacher?.name);
    // Find max period for this day
    const dayMax = allDayEntries.reduce((m, e) => Math.max(m, e.period), 0);
    if (dayMax > maxPeriods) maxPeriods = dayMax;
    // Build entries for each period
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

  // Upcoming homework (due soon)
  const today = new Date().toISOString().split("T")[0];
  const upcomingHomework = myHomework
    .filter((h) => h.due_date >= today)
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
    .slice(0, 5);
  const overdueHomework = myHomework.filter((h) => h.due_date < today);

  // Recent announcements for teachers
  const teacherAnnouncements = announcementRows
    .filter((a) => a.target === "all" || a.target === "teacher")
    .slice(0, 3);

  // Period numbers for grid columns
  const periods = Array.from({ length: maxPeriods || 8 }, (_, i) => i + 1);

  return (
    <>
      <PageHeader title="My Dashboard" />
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

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <KpiCard title="Today's Classes" value={todayClasses} icon={<ScheduleIcon />} color="#6366f1"
            onClick={() => navigate("/teacher/timetable")} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <KpiCard title="My Students" value={myStudents.length} icon={<PeopleIcon />} color="#10b981"
            onClick={() => navigate("/teacher/students")} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <KpiCard title="Pending Homework" value={upcomingHomework.length} icon={<AssignmentIcon />} color="#f59e0b"
            onClick={() => navigate("/teacher/homework/list")} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <KpiCard title="Avg Attendance" value={`${avgAtt}%`} icon={<EventNoteIcon />} color="#8b5cf6"
            onClick={() => navigate("/teacher/attendance/history")} />
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={2}>
        {/* Weekly Timetable — XY Grid */}
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

        {/* Upcoming Homework */}
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

        {/* My Classes Overview */}
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

        {/* Announcements */}
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
