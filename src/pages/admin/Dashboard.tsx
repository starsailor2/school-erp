import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Grid, Paper, Typography, Box, Stack, Chip } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import EventNoteIcon from "@mui/icons-material/EventNote";
import PaymentIcon from "@mui/icons-material/Payment";
import HotelIcon from "@mui/icons-material/Hotel";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import { StatCard } from "@/components/StatCard";
import { ChartCard } from "@/components/ChartCard";
import StatusChip from "@/components/StatusChip";
import { SeverityAvatar } from "@/components/SeverityAvatar";
import { PageHeader } from "@/components/PageHeader";
import { getChartPalette, getChartTooltipStyle, getIconAccent } from "@/theme/chartPalette";
import { useColorMode } from "@/context/ColorModeContext";
import {
  students, teachers, staffMembers, classes, fees, attendanceRecords,
  announcements, hostelAllocations, hostelRooms, hostelBlocks,
  messPlans, messAttendance, getClassName,
} from "@/demo-data";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { mode } = useColorMode();
  const palette = getChartPalette(mode);
  const tooltipStyle = getChartTooltipStyle(mode);

  const stats = useMemo(() => {
    const totalStudents = students.length;
    const totalStaff = teachers.length + staffMembers.length;

    const todayStr = new Date().toISOString().split("T")[0];
    const todayAtt = attendanceRecords.filter((a) => a.date === todayStr);
    const presentToday = todayAtt.filter((a) => a.status === "present").length;
    const attendancePct = todayAtt.length > 0 ? Math.round((presentToday / todayAtt.length) * 100) : 0;

    const currentMonthFees = fees.filter((f) => {
      const d = new Date(f.due_date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const collected = currentMonthFees.filter((f) => f.status === "paid").length;
    const collectionRate = currentMonthFees.length > 0 ? Math.round((collected / currentMonthFees.length) * 100) : 0;

    const occupiedBeds = hostelAllocations.length;
    const totalBeds = hostelRooms.reduce((s, r) => s + r.capacity, 0);
    const hostelOccupancy = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    return { totalStudents, totalStaff, attendancePct, collectionRate, hostelOccupancy, messPlansActive: messPlans.length };
  }, []);

  const classDistribution = classes.slice(0, 12).map((c) => ({
    name: c.name.replace("Class ", "C"),
    students: c.sections.reduce((sum, s) => sum + s.student_count, 0),
  }));

  const feeStatusData = [
    { name: "Paid", value: fees.filter((f) => f.status === "paid").length, color: palette.status.good },
    { name: "Pending", value: fees.filter((f) => f.status === "pending").length, color: palette.status.warning },
    { name: "Overdue", value: fees.filter((f) => f.status === "overdue").length, color: palette.status.critical },
  ];
  const feeStatusTotal = feeStatusData.reduce((s, d) => s + d.value, 0);

  const feeCollectionTrend = useMemo(() => {
    const byMonth = new Map<string, { collected: number; due: number }>();
    for (const f of fees) {
      if (f.fee_type !== "tuition") continue;
      const d = new Date(f.due_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const entry = byMonth.get(key) ?? { collected: 0, due: 0 };
      entry.due += f.amount;
      if (f.status === "paid") entry.collected += f.amount;
      byMonth.set(key, entry);
    }
    return [...byMonth.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([key, v]) => ({
        month: new Date(`${key}-01`).toLocaleDateString("en", { month: "short" }),
        collected: Math.round(v.collected / 1000),
        due: Math.round(v.due / 1000),
      }));
  }, []);

  const attendanceTrend = useMemo(() => {
    const byDate = new Map<string, { present: number; total: number }>();
    for (const a of attendanceRecords) {
      const entry = byDate.get(a.date) ?? { present: 0, total: 0 };
      entry.total += 1;
      if (a.status === "present") entry.present += 1;
      byDate.set(a.date, entry);
    }
    return [...byDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30)
      .map(([date, v]) => ({
        day: new Date(date).toLocaleDateString("en", { day: "2-digit", month: "short" }),
        attendance: Math.round((v.present / v.total) * 100),
      }));
  }, []);

  const hostelByBlock = useMemo(() =>
    hostelBlocks.map((block) => {
      const roomsInBlock = hostelRooms.filter((r) => r.block_id === block.id);
      const capacity = roomsInBlock.reduce((s, r) => s + r.capacity, 0);
      const occupied = hostelAllocations.filter((a) => roomsInBlock.some((r) => r.id === a.room_id)).length;
      return { name: block.name.replace(" Block", ""), occupied, capacity };
    }), []);

  const messConsumptionTrend = useMemo(() => {
    const byDate = new Map<string, number>();
    for (const rec of messAttendance) {
      if (!rec.consumed) continue;
      byDate.set(rec.date, (byDate.get(rec.date) ?? 0) + 1);
    }
    return [...byDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ day: new Date(date).toLocaleDateString("en", { day: "2-digit", month: "short" }), meals: count }));
  }, []);

  const recentAdmissions = students.slice(-5).reverse();
  const feeDefaulters = fees.filter((f) => f.status === "overdue").slice(0, 5);

  return (
    <>
      <PageHeader title="Admin Dashboard" eyebrow="Overview" />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 4, lg: 2 }}>
          <StatCard title="Total Students" value={stats.totalStudents} numericValue={stats.totalStudents} icon={<PeopleIcon />} color={getIconAccent(mode, "students")} onClick={() => navigate("/admin/students")} delay={0} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, lg: 2 }}>
          <StatCard title="Total Staff" value={stats.totalStaff} numericValue={stats.totalStaff} icon={<SchoolIcon />} color={getIconAccent(mode, "staff")} onClick={() => navigate("/admin/staff")} delay={0.05} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, lg: 2 }}>
          <StatCard title="Attendance Today" value={`${stats.attendancePct}%`} numericValue={stats.attendancePct} formatValue={(n) => `${n}%`} icon={<EventNoteIcon />} color={getIconAccent(mode, "attendance")} onClick={() => navigate("/admin/attendance/students")} delay={0.1} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, lg: 2 }}>
          <StatCard title="Fee Collection Rate" value={`${stats.collectionRate}%`} numericValue={stats.collectionRate} formatValue={(n) => `${n}%`} icon={<PaymentIcon />} color={getIconAccent(mode, "fees")} onClick={() => navigate("/admin/fees/collection")} delay={0.15} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, lg: 2 }}>
          <StatCard title="Hostel Occupancy" value={`${stats.hostelOccupancy}%`} numericValue={stats.hostelOccupancy} formatValue={(n) => `${n}%`} icon={<HotelIcon />} color={getIconAccent(mode, "hostel")} onClick={() => navigate("/admin/hostel")} delay={0.2} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, lg: 2 }}>
          <StatCard title="Mess Plans Active" value={stats.messPlansActive} numericValue={stats.messPlansActive} icon={<RestaurantIcon />} color={getIconAccent(mode, "mess")} onClick={() => navigate("/admin/mess")} delay={0.25} />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <ChartCard eyebrow="Finance" title="Fee Collection — Last 12 Months" subtitle="Amount in ₹ thousands" delay={0.1}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={feeCollectionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
                <XAxis dataKey="month" stroke={palette.axis} fontSize={12} />
                <YAxis stroke={palette.axis} fontSize={12} />
                <Tooltip {...tooltipStyle} />
                <Legend />
                <Line type="monotone" dataKey="collected" name="Collected" stroke={palette.categorical[0]} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="due" name="Due" stroke={palette.categorical[1]} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ChartCard
            eyebrow="Finance"
            title="Fee Status Breakdown"
            delay={0.15}
            legend={feeStatusData.map((d) => ({
              label: d.name,
              value: `${d.value} fees`,
              percent: feeStatusTotal > 0 ? Math.round((d.value / feeStatusTotal) * 100) : 0,
              color: d.color,
            }))}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={feeStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80}>
                  {feeStatusData.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard eyebrow="Attendance" title="School-wide Attendance — Last 30 Days" delay={0.2}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
                <XAxis dataKey="day" stroke={palette.axis} fontSize={11} interval={4} />
                <YAxis domain={[60, 100]} stroke={palette.axis} fontSize={12} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="attendance" name="Attendance %" stroke={palette.categorical[0]} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard eyebrow="Academics" title="Students per Class" delay={0.25}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classDistribution} style={{ backgroundColor: "transparent" }}>
                <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
                <XAxis dataKey="name" stroke={palette.axis} fontSize={12} />
                <YAxis stroke={palette.axis} fontSize={12} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="students" name="Students" fill={palette.categorical[0]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard eyebrow="Hostel" title="Occupancy by Block" delay={0.35}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hostelByBlock} style={{ backgroundColor: "transparent" }}>
                <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
                <XAxis dataKey="name" stroke={palette.axis} fontSize={11} />
                <YAxis stroke={palette.axis} fontSize={12} />
                <Tooltip {...tooltipStyle} />
                <Legend />
                <Bar dataKey="occupied" name="Occupied" fill={palette.categorical[0]} radius={[4, 4, 0, 0]} />
                <Bar dataKey="capacity" name="Capacity" fill={palette.categorical[1]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard eyebrow="Mess" title="Meals Served — Last 30 Days" delay={0.4}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={messConsumptionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
                <XAxis dataKey="day" stroke={palette.axis} fontSize={10} interval={4} />
                <YAxis stroke={palette.axis} fontSize={12} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="meals" name="Meals" stroke={palette.categorical[0]} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
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
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Fee Defaulter Watchlist</Typography>
            <Stack spacing={1}>
              {feeDefaulters.map((f) => {
                const student = students.find((s) => s.id === f.student_id);
                return (
                  <Box key={f.id} sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                    <SeverityAvatar severity="critical" icon={<WarningAmberIcon fontSize="small" />} size={32} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={500} noWrap>{student?.name ?? f.student_id}</Typography>
                      <Typography variant="caption" color="text.secondary">₹{f.amount.toLocaleString()} · {f.fee_type}</Typography>
                    </Box>
                    <StatusChip status="overdue" />
                  </Box>
                );
              })}
              {feeDefaulters.length === 0 && <Typography variant="body2" color="text.secondary">No overdue fees.</Typography>}
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
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
        </Grid>
      </Grid>
    </>
  );
}
