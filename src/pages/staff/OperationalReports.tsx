import { Grid, Paper, Stack, Typography, Chip } from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { getStaffFees, getFeePayments } from "@/demo-data/fees/feeTransactionStore";
import { getTransportRoutes } from "@/demo-data/transport/transportRouteStore";
import { getLibraryRecords, getLibraryBooksState } from "@/demo-data/library/libraryCirculationStore";
import { getStudentRequests } from "@/demo-data/staffOps/studentRequestStore";
import { studentTransport } from "@/demo-data";

export default function OperationalReports() {
  const { staffRole } = useAuth();

  const pendingFees = getStaffFees().filter((f) => f.status !== "paid").length;
  const collectedToday = getFeePayments().filter((p) => p.payment_date === new Date().toISOString().split("T")[0]).length;

  const routes = getTransportRoutes();
  const capacityUtilization = routes.length
    ? Math.round(
        routes.reduce((sum, route) => {
          const assigned = studentTransport.filter((s) => s.route_id === route.id).length;
          return sum + (assigned / route.capacity) * 100;
        }, 0) / routes.length,
      )
    : 0;

  const libraryRecords = getLibraryRecords();
  const booksIssued = libraryRecords.filter((r) => r.status === "issued").length;
  const booksAvailable = getLibraryBooksState().reduce((sum, b) => sum + b.available_copies, 0);

  const requests = getStudentRequests();
  const pendingRequests = requests.filter((r) => r.status === "pending" || r.status === "in_progress").length;
  const closedRequests = requests.filter((r) => r.status === "completed").length;

  return (
    <>
      <PageHeader
        title="Operational Reports"
        breadcrumbs={[{ label: "Dashboard", to: "/staff" }, { label: "Reports" }, { label: "Operational" }]}
      />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {(staffRole === "accountant" || staffRole === "office_staff") && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>Fees Snapshot</Typography>
              <Stack direction="row" spacing={1}>
                <Chip color="success" label={`Collected Today: ${collectedToday}`} />
                <Chip color="warning" label={`Pending Payments: ${pendingFees}`} />
              </Stack>
            </Paper>
          </Grid>
        )}

        {staffRole === "transport_manager" && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>Transport Snapshot</Typography>
              <Stack direction="row" spacing={1}>
                <Chip color="primary" label={`Routes Active: ${routes.length}`} />
                <Chip color="secondary" label={`Avg Utilization: ${capacityUtilization}%`} />
              </Stack>
            </Paper>
          </Grid>
        )}

        {staffRole === "library_staff" && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>Library Snapshot</Typography>
              <Stack direction="row" spacing={1}>
                <Chip color="warning" label={`Books Issued: ${booksIssued}`} />
                <Chip color="success" label={`Copies Available: ${booksAvailable}`} />
              </Stack>
            </Paper>
          </Grid>
        )}

        {staffRole === "office_staff" && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>Requests Snapshot</Typography>
              <Stack direction="row" spacing={1}>
                <Chip color="warning" label={`Open Requests: ${pendingRequests}`} />
                <Chip color="success" label={`Closed Requests: ${closedRequests}`} />
              </Stack>
            </Paper>
          </Grid>
        )}
      </Grid>

      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>Role Workflow Summary</Typography>
        <Stack spacing={1}>
          {staffRole === "accountant" && <Typography variant="body2">Workflow: Dashboard {" -> "} Fee Collection {" -> "} Payment Records {" -> "} Receipts {" -> "} Defaulters</Typography>}
          {staffRole === "transport_manager" && <Typography variant="body2">Workflow: Routes {" -> "} Route Details {" -> "} Students Assigned {" -> "} Vehicles {" -> "} Reports</Typography>}
          {staffRole === "library_staff" && <Typography variant="body2">Workflow: Books {" -> "} Issue Book {" -> "} Return Book {" -> "} Library Records</Typography>}
          {staffRole === "office_staff" && <Typography variant="body2">Workflow: Student Lookup {" -> "} Requests {" -> "} Certificates {" -> "} ID Card Requests {" -> "} Reports</Typography>}
        </Stack>
      </Paper>
    </>
  );
}
