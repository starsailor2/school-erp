import { Paper, Table, TableHead, TableBody, TableRow, TableCell, Chip, Typography, Stack, Box, Grid } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { students, getStudentAttendance } from "@/data/mock";

export default function StudentAttendance() {
  const { user } = useAuth();
  const student = students.find((s) => s.id === user?.id);
  const records = student ? getStudentAttendance(student.id) : [];
  const present = records.filter((r) => r.status === "present").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const late = records.filter((r) => r.status === "late").length;
  const pct = records.length ? Math.round((present / records.length) * 100) : 0;

  // Monthly chart data (group by date)
  const monthMap = new Map<string, { present: number; absent: number; late: number }>();
  records.forEach((r) => {
    const monthKey = r.date.slice(0, 7); // YYYY-MM
    if (!monthMap.has(monthKey)) monthMap.set(monthKey, { present: 0, absent: 0, late: 0 });
    const entry = monthMap.get(monthKey)!;
    if (r.status === "present") entry.present++;
    else if (r.status === "absent") entry.absent++;
    else entry.late++;
  });
  // Daily chart (last 7 days)
  const dailyData = [...records].reverse().map((r) => ({
    date: new Date(r.date).toLocaleDateString("en-US", { day: "numeric", month: "short" }),
    value: r.status === "present" ? 1 : 0,
    status: r.status,
  }));

  return (
    <>
      <PageHeader title="My Attendance" breadcrumbs={[{ label: "Dashboard", to: "/student" }, { label: "Attendance" }]} />

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">Total Days</Typography>
            <Typography variant="h5" fontWeight={700}>{records.length}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">Present</Typography>
            <Typography variant="h5" color="success.main" fontWeight={700}>{present}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">Absent</Typography>
            <Typography variant="h5" color="error.main" fontWeight={700}>{absent}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">Percentage</Typography>
            <Typography variant="h5" fontWeight={700} color={pct >= 75 ? "success.main" : "error.main"}>{pct}%</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* Daily Attendance Chart */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>Daily Attendance</Typography>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis hide />
                <Tooltip formatter={(_v: number, _n: string, props: { payload?: { status?: string } }) => [props.payload?.status ?? "", "Status"]} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {dailyData.map((entry, index) => (
                    <Cell key={index} fill={entry.status === "present" ? "#22c55e" : entry.status === "absent" ? "#ef4444" : "#f59e0b"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Summary Pie-style */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>Attendance Breakdown</Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              {[
                { label: "Present", count: present, color: "success.main", pct: records.length ? Math.round((present / records.length) * 100) : 0 },
                { label: "Absent", count: absent, color: "error.main", pct: records.length ? Math.round((absent / records.length) * 100) : 0 },
                { label: "Late", count: late, color: "warning.main", pct: records.length ? Math.round((late / records.length) * 100) : 0 },
              ].map((item) => (
                <Box key={item.label}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                    <Typography variant="body2">{item.label}</Typography>
                    <Typography variant="body2" fontWeight={500}>{item.count} ({item.pct}%)</Typography>
                  </Stack>
                  <Box sx={{ height: 8, borderRadius: 4, bgcolor: "action.hover", overflow: "hidden" }}>
                    <Box sx={{ height: "100%", width: `${item.pct}%`, bgcolor: item.color, borderRadius: 4 }} />
                  </Box>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Records Table */}
      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Day</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>{r.date}</TableCell>
                <TableCell>{new Date(r.date).toLocaleDateString("en-US", { weekday: "long" })}</TableCell>
                <TableCell>
                  <Chip label={r.status} size="small" color={r.status === "present" ? "success" : r.status === "absent" ? "error" : "warning"} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
}
