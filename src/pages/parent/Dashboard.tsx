import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Grid, Paper, Typography, Stack, Box, Chip, MenuItem, TextField } from "@mui/material";
import EventNoteIcon from "@mui/icons-material/EventNote";
import AssignmentIcon from "@mui/icons-material/Assignment";
import GradingIcon from "@mui/icons-material/Grading";
import PaymentIcon from "@mui/icons-material/Payment";
import { KpiCard } from "@/components/KpiCard";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import {
  parents, getChildrenOfParent, getClassName, getStudentMarks,
  getStudentFees, getStudentAttendance, homework, getSubjectName, timetable, exams,
} from "@/demo-data";
import { ANNOUNCEMENT_STORE_EVENT, getAnnouncements } from "@/demo-data/communication/announcementStore";

export default function ParentDashboard() {
  const navigate = useNavigate();
  const { user, selectedChildId, setSelectedChildId } = useAuth();
  const [announcementRows, setAnnouncementRows] = useState(() => getAnnouncements());

  useEffect(() => {
    const onUpdate = () => setAnnouncementRows(getAnnouncements());
    window.addEventListener(ANNOUNCEMENT_STORE_EVENT, onUpdate);
    return () => window.removeEventListener(ANNOUNCEMENT_STORE_EVENT, onUpdate);
  }, []);
  const parent = parents.find((p) => p.id === user?.id);
  const children = parent ? getChildrenOfParent(parent.id) : [];
  const child = children.find((c) => c.id === selectedChildId) ?? children[0];

  const childMarks = child ? getStudentMarks(child.id) : [];
  const childFees = child ? getStudentFees(child.id) : [];
  const childAttendance = child ? getStudentAttendance(child.id) : [];
  const childHomework = child ? homework.filter((h) => h.class_id === child.class_id) : [];
  const pendingHw = childHomework.filter((h) => h.due_date >= new Date().toISOString().split("T")[0]).length;
  const pendingFees = childFees.filter((f) => f.status !== "paid").reduce((s, f) => s + f.amount, 0);
  const upcomingExams = exams.filter((e) => e.start_date >= new Date().toISOString().split("T")[0]).length;
  const attendancePct = childAttendance.length > 0
    ? Math.round((childAttendance.filter((a) => a.status === "present").length / childAttendance.length) * 100)
    : 0;

  // Today's schedule for the child's class/section
  const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()];
  const classNum = child?.class_id.replace("c", "") ?? "";
  const sectionId = child?.section_id ?? "";
  const sectionName = sectionId.split("-")[1]?.replace("s", "") ?? "";
  const sectionLetter = String.fromCharCode(65 + parseInt(sectionName || "0"));
  const todaySchedule = (timetable[dayName] ?? []).filter(
    (e) => e.class_name === classNum && e.section === sectionLetter
  );

  return (
    <>
      <PageHeader title="Parent Dashboard" />

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

      {child && (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Viewing: <strong>{child.name}</strong> | {getClassName(child.class_id)} | Roll No. {child.roll_number}
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <KpiCard title="Attendance" value={`${attendancePct}%`} icon={<EventNoteIcon />}
                color={attendancePct >= 85 ? "#10b981" : "#f59e0b"}
                onClick={() => navigate("/parent/attendance")} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <KpiCard title="Homework Pending" value={pendingHw} icon={<AssignmentIcon />} color="#6366f1"
                onClick={() => navigate("/parent/homework")} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <KpiCard title="Upcoming Exams" value={upcomingExams} icon={<GradingIcon />} color="#8b5cf6"
                onClick={() => navigate("/parent/exams")} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <KpiCard title="Fee Due" value={pendingFees > 0 ? `₹${pendingFees.toLocaleString()}` : "Nil"} icon={<PaymentIcon />}
                color={pendingFees > 0 ? "#ef4444" : "#10b981"}
                onClick={() => navigate("/parent/fees")} />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            {/* Left column: Today's Schedule + Recent Marks */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>Today's Schedule</Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>{dayName}</Typography>
                {todaySchedule.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No classes today</Typography>
                ) : (
                  <Stack spacing={0.5}>
                    {todaySchedule.map((e) => (
                      <Box key={e.period} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.5, borderBottom: "1px solid", borderColor: "divider" }}>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            Period {e.period} — {e.subject}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">{e.time}</Typography>
                        </Box>
                        {e.teacher && <Typography variant="caption" color="text.secondary">{e.teacher}</Typography>}
                      </Box>
                    ))}
                  </Stack>
                )}
              </Paper>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>Recent Marks</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {childMarks.slice(0, 8).map((m) => (
                    <Chip key={m.id}
                      label={`${getSubjectName(m.subject_id)}: ${m.marks_obtained}/${m.max_marks} (${m.grade})`}
                      size="small" variant="outlined"
                      color={m.marks_obtained >= 80 ? "success" : m.marks_obtained >= 50 ? "warning" : "error"} />
                  ))}
                  {childMarks.length === 0 && (
                    <Typography variant="body2" color="text.secondary">No marks recorded yet</Typography>
                  )}
                </Stack>
              </Paper>
            </Grid>

            {/* Right column: Homework + Announcements + Fee summary */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper sx={{ p: 2, height: "100%" }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Recent Homework</Typography>
                    <Stack spacing={1.5}>
                      {childHomework.slice(0, 5).map((h) => (
                        <Box key={h.id} sx={{ borderBottom: "1px solid", borderColor: "divider", pb: 1 }}>
                          <Typography variant="body2" fontWeight={500}>{getSubjectName(h.subject_id)}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {h.title} · Due: {h.due_date}
                          </Typography>
                        </Box>
                      ))}
                      {childHomework.length === 0 && (
                        <Typography variant="body2" color="text.secondary">No homework assigned</Typography>
                      )}
                    </Stack>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper sx={{ p: 2, height: "100%" }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Recent Announcements</Typography>
                    <Stack spacing={1.5}>
                      {announcementRows.filter((a) => a.target === "all" || a.target === "parent").slice(0, 5).map((a) => (
                        <Box key={a.id} sx={{ borderBottom: "1px solid", borderColor: "divider", pb: 1 }}>
                          <Typography variant="body2" fontWeight={500}>{a.title}</Typography>
                          <Typography variant="caption" color="text.secondary">{a.date}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Paper>
                </Grid>
                {/* Attendance breakdown */}
                <Grid size={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Attendance Summary (Last 7 Days)</Typography>
                    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                      <Chip label={`Present: ${childAttendance.filter((a) => a.status === "present").length}`} size="small" color="success" variant="outlined" />
                      <Chip label={`Absent: ${childAttendance.filter((a) => a.status === "absent").length}`} size="small" color="error" variant="outlined" />
                      <Chip label={`Late: ${childAttendance.filter((a) => a.status === "late").length}`} size="small" color="warning" variant="outlined" />
                      <Chip label={`Total: ${childAttendance.length} days`} size="small" variant="outlined" />
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </>
      )}
    </>
  );
}
