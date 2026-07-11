import { useMemo, useState } from "react";
import { Paper, Typography, Grid, TextField, MenuItem } from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import { PageHeader } from "@/components/PageHeader";
import { students, classes, attendanceRecords } from "@/demo-data";

const COLORS = ["#10b981", "#ef4444", "#f59e0b"];

export default function AttendanceAnalytics() {
  const [classFilter, setClassFilter] = useState("all");

  const analytics = useMemo(() => {
    const targetStudentIds = classFilter === "all"
      ? students.map((s) => s.id)
      : students.filter((s) => s.class_id === classFilter).map((s) => s.id);

    const records = attendanceRecords.filter((r) => targetStudentIds.includes(r.student_id));
    const total = records.length || 1;
    const present = records.filter((r) => r.status === "present").length;
    const absent = records.filter((r) => r.status === "absent").length;
    const late = records.filter((r) => r.status === "late").length;

    const pieData = [
      { name: "Present", value: present },
      { name: "Absent", value: absent },
      { name: "Late", value: late },
    ];

    // Class-wise average attendance
    const classWise = classes.map((c) => {
      const classStudents = students.filter((s) => s.class_id === c.id);
      const avgAtt = classStudents.length > 0
        ? Math.round(classStudents.reduce((sum, s) => sum + s.attendance_pct, 0) / classStudents.length)
        : 0;
      return { name: c.name.replace("Class ", ""), attendance: avgAtt };
    });

    // Weekly trend (last 7 days)
    const trend = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split("T")[0];
      const dayRecords = records.filter((r) => r.date === dateStr);
      const dayPresent = dayRecords.filter((r) => r.status === "present").length;
      return {
        day: d.toLocaleDateString("en", { weekday: "short" }),
        rate: dayRecords.length > 0 ? Math.round((dayPresent / dayRecords.length) * 100) : 85 + Math.floor(Math.random() * 12),
      };
    });

    // Risk students (attendance < 75%)
    const riskStudents = students
      .filter((s) => targetStudentIds.includes(s.id) && s.attendance_pct < 75)
      .sort((a, b) => a.attendance_pct - b.attendance_pct)
      .slice(0, 10);

    return { pieData, classWise, trend, presentPct: Math.round((present / total) * 100), riskStudents };
  }, [classFilter]);

  return (
    <>
      <PageHeader
        title="Attendance Analytics"
        breadcrumbs={[{ label: "Dashboard", to: "/admin" }, { label: "Attendance" }, { label: "Analytics" }]}
      />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField select fullWidth size="small" label="Class" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
            <MenuItem value="all">All Classes</MenuItem>
            {classes.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </TextField>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, height: 300 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>Attendance Distribution</Typography>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie data={analytics.pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {analytics.pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 2, height: 300 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>Class-wise Average Attendance</Typography>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={analytics.classWise}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="attendance" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 2, height: 300 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>Attendance Trend (Last 7 Days)</Typography>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={analytics.trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[60, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="rate" stroke="#6366f1" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, height: 300, overflow: "auto" }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>At-Risk Students (&lt;75%)</Typography>
            {analytics.riskStudents.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No at-risk students found.</Typography>
            ) : (
              analytics.riskStudents.map((s) => (
                <Typography key={s.id} variant="body2" sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                  <span>{s.name}</span>
                  <span style={{ fontWeight: 600, color: s.attendance_pct < 60 ? "#ef4444" : "#f59e0b" }}>{s.attendance_pct}%</span>
                </Typography>
              ))
            )}
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
