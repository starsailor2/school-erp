import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Grid, Paper, Typography, Box, Stack, Chip } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import EventNoteIcon from "@mui/icons-material/EventNote";
import WarningIcon from "@mui/icons-material/Warning";
import ClassIcon from "@mui/icons-material/Class";
import PaymentIcon from "@mui/icons-material/Payment";
import GradingIcon from "@mui/icons-material/Grading";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import { KpiCard } from "@/components/KpiCard";
import { PageHeader } from "@/components/PageHeader";
import {
  students, teachers, staffMembers, classes, fees, attendanceRecords,
  announcements, routes, exams, getClassName,
} from "@/demo-data";

const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

export default function AdminDashboard() {
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const totalStudents = students.length;
    const totalTeachers = teachers.length;
    const totalStaff = staffMembers.length;
    const totalClasses = classes.length;

    const totalFees = fees.reduce((s, f) => s + f.amount, 0);
    const collectedFees = fees.filter((f) => f.status === "paid").reduce((s, f) => s + f.amount, 0);
    const pendingFees = fees.filter((f) => f.status !== "paid").reduce((s, f) => s + f.amount, 0);
    const feeDefaulters = fees.filter((f) => f.status === "overdue").length;

    const todayStr = new Date().toISOString().split("T")[0];
    const todayAtt = attendanceRecords.filter((a) => a.date === todayStr);
    const presentToday = todayAtt.filter((a) => a.status === "present").length;
    const attendancePct = todayAtt.length > 0 ? Math.round((presentToday / todayAtt.length) * 100) : 92;

    const upcomingExams = exams.filter((e) => new Date(e.start_date) > new Date()).length;

    return { totalStudents, totalTeachers, totalStaff, totalClasses, totalFees, collectedFees, pendingFees, feeDefaulters, attendancePct, upcomingExams };
  }, []);

  const classDistribution = classes.slice(0, 6).map((c) => ({
    name: c.name,
    students: c.sections.reduce((sum, s) => sum + s.student_count, 0),
  }));

  const feeData = [
    { name: "Paid", value: fees.filter((f) => f.status === "paid").length },
    { name: "Pending", value: fees.filter((f) => f.status === "pending").length },
    { name: "Overdue", value: fees.filter((f) => f.status === "overdue").length },
  ];

  const attendanceTrend = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      day: d.toLocaleDateString("en", { weekday: "short" }),
      attendance: 85 + Math.floor(Math.random() * 12),
    };
  });

  // Recent admissions (latest students)
  const recentAdmissions = students.slice(-5).reverse();

  return (
    <>
      <PageHeader title="Admin Dashboard" />

      {/* KPI Cards - Row 1 */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 6, sm: 3, lg: 2 }}>
          <KpiCard title="Total Students" value={stats.totalStudents} icon={<PeopleIcon />} color="#6366f1" onClick={() => navigate("/admin/students")} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3, lg: 2 }}>
          <KpiCard title="Teachers" value={stats.totalTeachers} icon={<SchoolIcon />} color="#10b981" onClick={() => navigate("/admin/teachers")} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3, lg: 2 }}>
          <KpiCard title="Total Classes" value={stats.totalClasses} icon={<ClassIcon />} color="#8b5cf6" onClick={() => navigate("/admin/academics/classes")} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3, lg: 2 }}>
          <KpiCard title="Attendance Today" value={`${stats.attendancePct}%`} icon={<EventNoteIcon />} color="#f59e0b" onClick={() => navigate("/admin/attendance/students")} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3, lg: 2 }}>
          <KpiCard title="Fees Collected" value={`₹${(stats.collectedFees / 1000).toFixed(0)}K`} icon={<PaymentIcon />} color="#10b981" onClick={() => navigate("/admin/fees/collection")} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3, lg: 2 }}>
          <KpiCard title="Pending Fees" value={`₹${(stats.pendingFees / 1000).toFixed(0)}K`} icon={<WarningIcon />} color="#ef4444" onClick={() => navigate("/admin/fees/defaulters")} />
        </Grid>
      </Grid>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <KpiCard title="Upcoming Exams" value={stats.upcomingExams} icon={<GradingIcon />} color="#f59e0b" onClick={() => navigate("/admin/exams")} />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 2, height: 320 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>Students per Class</Typography>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={classDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="students" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, height: 320 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>Fee Collection</Typography>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie data={feeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {feeData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Attendance Trend + Widgets */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 2, height: 300 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>Attendance Trend (Last 7 days)</Typography>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[70, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="attendance" stroke="#6366f1" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2}>
            {/* Recent Admissions */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>Recent Admissions</Typography>
              <Stack spacing={0.75}>
                {recentAdmissions.map((s) => (
                  <Box key={s.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>{s.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{getClassName(s.class_id)}</Typography>
                    </Box>
                    <Chip label={s.admission_number} size="small" variant="outlined" />
                  </Box>
                ))}
              </Stack>
            </Paper>

            {/* Quick Stats */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>Quick Stats</Typography>
              <Stack spacing={1}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">Total Staff</Typography>
                  <Typography variant="body2" fontWeight={600}>{stats.totalStaff}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">Transport Routes</Typography>
                  <Typography variant="body2" fontWeight={600}>{routes.length}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">Fee Defaulters</Typography>
                  <Typography variant="body2" fontWeight={600}>{stats.feeDefaulters}</Typography>
                </Box>
              </Stack>
            </Paper>

            {/* Recent Announcements */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>Recent Announcements</Typography>
              <Stack spacing={1}>
                {announcements.slice(0, 3).map((a) => (
                  <Box key={a.id}>
                    <Typography variant="body2" fontWeight={500}>{a.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{a.date}</Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </>
  );
}
