import { useNavigate } from "react-router-dom";
import { Grid, Paper, Typography, Stack, Box, Chip, Button } from "@mui/material";
import TaskIcon from "@mui/icons-material/Task";
import PeopleIcon from "@mui/icons-material/People";
import PaymentIcon from "@mui/icons-material/Payment";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import { KpiCard } from "@/components/KpiCard";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { staffMembers, students, routes, announcements } from "@/demo-data";
import { getStaffFees, getFeePayments } from "@/demo-data/fees/feeTransactionStore";
import { getLibraryRecords } from "@/demo-data/library/libraryCirculationStore";
import { getStudentRequests } from "@/demo-data/staffOps/studentRequestStore";
import { getStaffTasks } from "@/demo-data/staffOps/staffTaskStore";

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { user, staffRole } = useAuth();
  const staff = staffMembers.find((s) => s.id === user?.id);

  const pendingFeePayments = getStaffFees().filter((f) => f.status !== "paid").length;
  const feeCollectionsToday = getFeePayments().filter((p) => p.payment_date === new Date().toISOString().split("T")[0]).length;
  const booksIssued = getLibraryRecords().filter((r) => r.status === "issued").length;
  const studentRequests = getStudentRequests().filter((r) => r.status !== "completed").length;
  const todaysTasks = getStaffTasks().filter((t) => t.status !== "completed").slice(0, 4);
  const recentRequests = getStudentRequests().slice(0, 4);

  return (
    <>
      <PageHeader title="Staff Dashboard" />
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Welcome, {staff?.name ?? "Staff"} | {staff?.department} | {staffRole.replace("_", " ")}
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <KpiCard title="Total Students" value={students.length} icon={<PeopleIcon />} color="#6366f1"
            onClick={() => navigate("/staff/students")} />
        </Grid>
        {staffRole === "accountant" && (
          <Grid size={{ xs: 6, sm: 3 }}>
            <KpiCard title="Fee Collections Today" value={feeCollectionsToday} icon={<PaymentIcon />} color="#10b981"
              onClick={() => navigate("/staff/fees/records")} />
          </Grid>
        )}
        {staffRole === "accountant" && (
          <Grid size={{ xs: 6, sm: 3 }}>
            <KpiCard title="Pending Fee Payments" value={pendingFeePayments} icon={<PaymentIcon />} color="#ef4444"
              onClick={() => navigate("/staff/fees/collection")} />
          </Grid>
        )}
        {staffRole === "library_staff" && (
          <Grid size={{ xs: 6, sm: 3 }}>
            <KpiCard title="Books Issued" value={booksIssued} icon={<MenuBookIcon />} color="#f59e0b"
              onClick={() => navigate("/staff/library/records")} />
          </Grid>
        )}
        {staffRole === "transport_manager" && (
          <Grid size={{ xs: 6, sm: 3 }}>
            <KpiCard title="Bus Routes Active" value={routes.length} icon={<DirectionsBusIcon />} color="#10b981"
              onClick={() => navigate("/staff/transport/routes")} />
          </Grid>
        )}
        {(staffRole === "office_staff" || staffRole === "accountant") && (
          <Grid size={{ xs: 6, sm: 3 }}>
            <KpiCard title="Student Requests" value={studentRequests} icon={<TaskIcon />} color="#0ea5e9"
              onClick={() => navigate("/staff/students/requests")} />
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
        </Stack>
      </Paper>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>Today's Tasks</Typography>
            <Stack spacing={1}>
              {todaysTasks.map((t) => (
                <Box key={t.id} sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">{t.title}</Typography>
                  <Chip label={t.status.replace("_", " ")} size="small" />
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
                <Box key={r.id} sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">{r.request_type.replace(/_/g, " ")}</Typography>
                  <Chip label={r.status.replace("_", " ")} size="small" />
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
