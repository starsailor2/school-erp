import { Paper, Typography, Grid, Chip } from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from "recharts";
import { PageHeader } from "@/components/PageHeader";
import { classes, students, attendanceRecords } from "@/demo-data";
import { DataTable } from "@/components/DataTable";
import { getChartPalette } from "@/theme/chartPalette";
import { useColorMode } from "@/context/ColorModeContext";

type RiskRow = {
  id: string;
  student: string;
  className: string;
  attendance: number;
  risk: "high" | "medium" | "low";
};

export default function AttendanceReports() {
  const { mode } = useColorMode();
  const palette = getChartPalette(mode);
  const classData = classes.map((c) => {
    const classStudents = students.filter((s) => s.class_id === c.id);
    const avgAtt = classStudents.length > 0
      ? Math.round(classStudents.reduce((s, st) => s + st.attendance_pct, 0) / classStudents.length)
      : 0;
    return { name: c.name, attendance: avgAtt };
  });

  const latest7Dates = Array.from(new Set(attendanceRecords.map((r) => r.date)))
    .sort((a, b) => +new Date(a) - +new Date(b))
    .slice(-7);

  const trendData = latest7Dates.map((date) => {
    const dayRecords = attendanceRecords.filter((r) => r.date === date);
    const presentLike = dayRecords.filter((r) => r.status === "present" || r.status === "late").length;
    const percent = dayRecords.length > 0 ? Math.round((presentLike / dayRecords.length) * 100) : 0;
    return { date, attendance: percent };
  });

  const riskRows: RiskRow[] = students
    .map((student) => {
      const risk: RiskRow["risk"] = student.attendance_pct < 70 ? "high" : student.attendance_pct < 85 ? "medium" : "low";
      return {
        id: student.id,
        student: student.name,
        className: classes.find((c) => c.id === student.class_id)?.name ?? student.class_id,
        attendance: student.attendance_pct,
        risk,
      };
    })
    .sort((a, b) => a.attendance - b.attendance)
    .slice(0, 15);

  return (
    <>
      <PageHeader
        title="Attendance Reports"
        breadcrumbs={[
          { label: "Dashboard", to: "/admin" },
          { label: "Attendance" },
          { label: "Reports" },
        ]}
      />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Average Attendance by Class
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={classData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="attendance" fill={palette.categorical[0]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              7-Day Attendance Trend
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="attendance" stroke={palette.categorical[0]} strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <DataTable
            pagination
            pageSize={25}
            title="Attendance Risk Watchlist"
            columns={[
              { key: "student", label: "Student" },
              { key: "className", label: "Class" },
              { key: "attendance", label: "Attendance", render: (row) => `${row.attendance}%` },
              {
                key: "risk",
                label: "Risk",
                render: (row) => (
                  <Chip
                    size="small"
                    label={row.risk}
                    color={row.risk === "high" ? "error" : row.risk === "medium" ? "warning" : "success"}
                  />
                ),
              },
            ]}
            rows={riskRows}
          />
        </Grid>
      </Grid>
    </>
  );
}
