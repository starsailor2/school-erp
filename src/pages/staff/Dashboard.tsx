import { useNavigate } from "react-router-dom";
import { Grid, Paper, Typography, Stack, Box, Chip, Button } from "@mui/material";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import TaskIcon from "@mui/icons-material/Task";
import PeopleIcon from "@mui/icons-material/People";
import PaymentIcon from "@mui/icons-material/Payment";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import HotelIcon from "@mui/icons-material/Hotel";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import { StatCard } from "@/components/StatCard";
import { ChartCard } from "@/components/ChartCard";
import { PageHeader } from "@/components/PageHeader";
import { SeverityAvatar, type Severity } from "@/components/SeverityAvatar";
import StatusChip from "@/components/StatusChip";
import { getChartPalette, getChartTooltipStyle, getIconAccent } from "@/theme/chartPalette";
import { useColorMode } from "@/context/ColorModeContext";
import { useAuth } from "@/context/AuthContext";
import { canViewFeature } from "@/data/staffPermissions";
import {
  staffMembers, students, routes, studentTransport, libraryBooks, announcements,
  hostelAllocations, hostelRooms, hostelBlocks, messAttendance,
} from "@/demo-data";
import { getStaffFees, getFeePayments } from "@/demo-data/fees/feeTransactionStore";
import { getLibraryRecords } from "@/demo-data/library/libraryCirculationStore";
import { getStudentRequests } from "@/demo-data/staffOps/studentRequestStore";
import { getStaffTasks } from "@/demo-data/staffOps/staffTaskStore";

function severityForStatus(status: string): Severity {
  if (status === "completed" || status === "approved" || status === "fulfilled") return "good";
  if (status === "rejected") return "critical";
  return "warning";
}

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { user, staffRole } = useAuth();
  const { mode } = useColorMode();
  const palette = getChartPalette(mode);
  const tooltipStyle = getChartTooltipStyle(mode);
  const staff = staffMembers.find((s) => s.id === user?.id);

  const pendingFeePayments = getStaffFees().filter((f) => f.status !== "paid").length;
  const feeCollectionsToday = getFeePayments().filter((p) => p.payment_date === new Date().toISOString().split("T")[0]).length;
  const booksIssued = getLibraryRecords().filter((r) => r.status === "issued").length;
  const studentRequestsCount = getStudentRequests().filter((r) => r.status !== "completed").length;
  const todaysTasks = getStaffTasks().filter((t) => t.status !== "completed").slice(0, 4);
  const recentRequests = getStudentRequests().slice(0, 4);

  const totalBeds = hostelRooms.reduce((s, r) => s + r.capacity, 0);
  const hostelOccupied = hostelAllocations.length;

  const feeStatusForStaff = [
    { name: "Paid", value: getStaffFees().filter((f) => f.status === "paid").length, color: palette.status.good },
    { name: "Pending", value: getStaffFees().filter((f) => f.status === "pending").length, color: palette.status.warning },
    { name: "Overdue", value: getStaffFees().filter((f) => f.status === "overdue").length, color: palette.status.critical },
  ];
  const feeStatusForStaffTotal = feeStatusForStaff.reduce((s, d) => s + d.value, 0);

  const routeUtilization = routes.map((r) => ({
    name: r.name,
    riders: studentTransport.filter((st) => st.route_id === r.id).length,
    capacity: r.capacity,
  }));

  const circulationByCategory = (() => {
    const byCategory = new Map<string, number>();
    for (const b of libraryBooks) {
      byCategory.set(b.category, (byCategory.get(b.category) ?? 0) + (b.total_copies - b.available_copies));
    }
    return [...byCategory.entries()].map(([category, issued]) => ({ category, issued }));
  })();

  const hostelOccupancyForStaff = hostelBlocks.map((block) => {
    const blockRooms = hostelRooms.filter((r) => r.block_id === block.id);
    const capacity = blockRooms.reduce((s, r) => s + r.capacity, 0);
    const occupied = hostelAllocations.filter((a) => blockRooms.some((r) => r.id === a.room_id)).length;
    return { name: block.name.replace(" Block", ""), occupied, capacity };
  });

  const messTrendForStaff = (() => {
    const byDate = new Map<string, number>();
    for (const rec of messAttendance) {
      if (!rec.consumed) continue;
      byDate.set(rec.date, (byDate.get(rec.date) ?? 0) + 1);
    }
    return [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-14).map(([date, count]) => ({
      day: new Date(date).toLocaleDateString("en", { day: "2-digit", month: "short" }),
      meals: count,
    }));
  })();

  return (
    <>
      <PageHeader title="Staff Dashboard" eyebrow="Staff Portal" />
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Welcome, {staff?.name ?? "Staff"} | {staff?.department} | {staffRole.replace("_", " ")}
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard title="Total Students" value={students.length} numericValue={students.length} icon={<PeopleIcon />} color={getIconAccent(mode, "students")} onClick={() => navigate("/staff/students")} />
        </Grid>
        {staffRole === "accountant" && (
          <>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard title="Fee Collections Today" value={feeCollectionsToday} numericValue={feeCollectionsToday} icon={<PaymentIcon />} color={getIconAccent(mode, "fees")} onClick={() => navigate("/staff/fees/records")} delay={0.05} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard title="Pending Fee Payments" value={pendingFeePayments} numericValue={pendingFeePayments} icon={<PaymentIcon />} color={getIconAccent(mode, "fees-pending")} onClick={() => navigate("/staff/fees/collection")} delay={0.1} />
            </Grid>
          </>
        )}
        {staffRole === "library_staff" && (
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard title="Books Issued" value={booksIssued} numericValue={booksIssued} icon={<MenuBookIcon />} color={getIconAccent(mode, "library")} onClick={() => navigate("/staff/library/records")} delay={0.05} />
          </Grid>
        )}
        {staffRole === "transport_manager" && (
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard title="Bus Routes Active" value={routes.length} numericValue={routes.length} icon={<DirectionsBusIcon />} color={getIconAccent(mode, "transport")} onClick={() => navigate("/staff/transport/routes")} delay={0.05} />
          </Grid>
        )}
        {staffRole === "hostel_warden" && (
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard title="Hostel Occupancy" value={`${totalBeds > 0 ? Math.round((hostelOccupied / totalBeds) * 100) : 0}%`} numericValue={totalBeds > 0 ? Math.round((hostelOccupied / totalBeds) * 100) : 0} formatValue={(n) => `${n}%`} icon={<HotelIcon />} color={getIconAccent(mode, "hostel")} onClick={() => navigate("/staff/hostel/allocation")} delay={0.05} />
          </Grid>
        )}
        {staffRole === "mess_manager" && (
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard title="Meals Served Today" value={messTrendForStaff[messTrendForStaff.length - 1]?.meals ?? 0} numericValue={messTrendForStaff[messTrendForStaff.length - 1]?.meals ?? 0} icon={<RestaurantIcon />} color={getIconAccent(mode, "mess")} onClick={() => navigate("/staff/mess/attendance")} delay={0.05} />
          </Grid>
        )}
        {(staffRole === "office_staff" || staffRole === "accountant") && (
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard title="Student Requests" value={studentRequestsCount} numericValue={studentRequestsCount} icon={<TaskIcon />} color={getIconAccent(mode, "requests")} onClick={() => navigate("/staff/students/requests")} delay={0.15} />
          </Grid>
        )}
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {canViewFeature(staffRole, "fees") && staffRole === "accountant" && (
          <Grid size={{ xs: 12, md: 6 }}>
            <ChartCard
              eyebrow="Finance"
              title="Collections This Month"
              legend={feeStatusForStaff.map((d) => ({
                label: d.name,
                value: `${d.value} fees`,
                percent: feeStatusForStaffTotal > 0 ? Math.round((d.value / feeStatusForStaffTotal) * 100) : 0,
                color: d.color,
              }))}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={feeStatusForStaff} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80}>
                    {feeStatusForStaff.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
        )}
        {staffRole === "transport_manager" && (
          <Grid size={{ xs: 12, md: 6 }}>
            <ChartCard eyebrow="Transport" title="Route Utilization">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={routeUtilization}>
                  <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
                  <XAxis dataKey="name" stroke={palette.axis} fontSize={11} />
                  <YAxis stroke={palette.axis} fontSize={12} />
                  <Tooltip {...tooltipStyle} />
                  <Legend />
                  <Bar dataKey="riders" name="Riders" fill={palette.categorical[0]} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="capacity" name="Capacity" fill={palette.categorical[1]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
        )}
        {staffRole === "library_staff" && (
          <Grid size={{ xs: 12, md: 6 }}>
            <ChartCard eyebrow="Library" title="Circulation by Category">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={circulationByCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
                  <XAxis dataKey="category" stroke={palette.axis} fontSize={11} />
                  <YAxis stroke={palette.axis} fontSize={12} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="issued" name="Copies Issued" fill={palette.categorical[0]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
        )}
        {staffRole === "hostel_warden" && (
          <Grid size={{ xs: 12, md: 6 }}>
            <ChartCard eyebrow="Hostel" title="Room Occupancy">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hostelOccupancyForStaff}>
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
        )}
        {staffRole === "mess_manager" && (
          <Grid size={{ xs: 12, md: 6 }}>
            <ChartCard eyebrow="Mess" title="Daily Consumption — Last 14 Days">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={messTrendForStaff}>
                  <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
                  <XAxis dataKey="day" stroke={palette.axis} fontSize={11} />
                  <YAxis stroke={palette.axis} fontSize={12} />
                  <Tooltip {...tooltipStyle} />
                  <Line type="monotone" dataKey="meals" name="Meals" stroke={palette.categorical[0]} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
        )}
      </Grid>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>Quick Workflow</Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          {staffRole === "accountant" && (
            <>
              <Button size="small" variant="outlined" onClick={() => navigate("/staff/fees/collection")}>Check Fee Payments</Button>
              <Button size="small" variant="outlined" onClick={() => navigate("/staff/fees/records")}>Record Fee Collection</Button>
              <Button size="small" variant="outlined" onClick={() => navigate("/staff/fees/receipts")}>Generate Receipts</Button>
              <Button size="small" variant="outlined" onClick={() => navigate("/staff/fees/defaulters")}>Review Defaulters</Button>
            </>
          )}
          {staffRole === "transport_manager" && (
            <>
              <Button size="small" variant="outlined" onClick={() => navigate("/staff/transport/routes")}>Check Routes</Button>
              <Button size="small" variant="outlined" onClick={() => navigate("/staff/transport/students")}>Update Student Allocation</Button>
              <Button size="small" variant="outlined" onClick={() => navigate("/staff/transport/vehicles")}>Review Vehicle Status</Button>
            </>
          )}
          {staffRole === "library_staff" && (
            <>
              <Button size="small" variant="outlined" onClick={() => navigate("/staff/library/books")}>Check Books</Button>
              <Button size="small" variant="outlined" onClick={() => navigate("/staff/library/issue")}>Issue Book</Button>
              <Button size="small" variant="outlined" onClick={() => navigate("/staff/library/return")}>Return Book</Button>
              <Button size="small" variant="outlined" onClick={() => navigate("/staff/library/records")}>Library Records</Button>
            </>
          )}
          {staffRole === "office_staff" && (
            <>
              <Button size="small" variant="outlined" onClick={() => navigate("/staff/students")}>Student Lookup</Button>
              <Button size="small" variant="outlined" onClick={() => navigate("/staff/students/requests")}>Admission/Requests</Button>
              <Button size="small" variant="outlined" onClick={() => navigate("/staff/certificates")}>Certificates</Button>
              <Button size="small" variant="outlined" onClick={() => navigate("/staff/id-cards")}>ID Cards</Button>
            </>
          )}
          {staffRole === "hostel_warden" && (
            <>
              <Button size="small" variant="outlined" onClick={() => navigate("/staff/hostel/allocation")}>Room Allocation</Button>
              <Button size="small" variant="outlined" onClick={() => navigate("/staff/hostel/roster")}>View Roster</Button>
            </>
          )}
          {staffRole === "mess_manager" && (
            <>
              <Button size="small" variant="outlined" onClick={() => navigate("/staff/mess/attendance")}>Mark Meal Attendance</Button>
              <Button size="small" variant="outlined" onClick={() => navigate("/staff/mess/menu")}>View Weekly Menu</Button>
            </>
          )}
        </Stack>
      </Paper>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>Today's Tasks</Typography>
            <Stack spacing={1}>
              {todaysTasks.map((t) => (
                <Box key={t.id} sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                  <SeverityAvatar severity={severityForStatus(t.status)} icon={<TaskIcon fontSize="small" />} size={30} />
                  <Typography variant="body2" sx={{ flex: 1 }}>{t.title}</Typography>
                  <StatusChip status={t.status} />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>Recent Student Requests</Typography>
            <Stack spacing={1}>
              {recentRequests.map((r) => (
                <Box key={r.id} sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                  <SeverityAvatar severity={severityForStatus(r.status)} icon={<PeopleIcon fontSize="small" />} size={30} />
                  <Typography variant="body2" sx={{ flex: 1 }}>{r.request_type.replace(/_/g, " ")}</Typography>
                  <StatusChip status={r.status} />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>Recent Notices</Typography>
            <Stack spacing={1}>
              {announcements.slice(0, 4).map((a) => (
                <Box key={a.id} sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>{a.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{a.content}</Typography>
                  </Box>
                  <Chip label={a.date} size="small" variant="outlined" />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
