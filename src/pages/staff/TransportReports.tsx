import { Paper, Stack, Typography } from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { routes, studentTransport } from "@/data/mock";

export default function TransportReports() {
  const activeRoutes = routes.length;
  const allocatedStudents = studentTransport.length;
  const avgUtilization = Math.round(
    routes.reduce((sum, route) => {
      const assigned = studentTransport.filter((s) => s.route_id === route.id).length;
      return sum + (assigned / route.capacity) * 100;
    }, 0) / routes.length,
  );

  return (
    <>
      <PageHeader
        title="Transport Reports"
        breadcrumbs={[{ label: "Dashboard", to: "/staff" }, { label: "Transport", to: "/staff/transport/routes" }, { label: "Reports" }]}
      />
      <Stack spacing={2}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">Routes Active</Typography>
          <Typography variant="h5" fontWeight={700}>{activeRoutes}</Typography>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">Students Allocated</Typography>
          <Typography variant="h5" fontWeight={700}>{allocatedStudents}</Typography>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">Average Capacity Utilization</Typography>
          <Typography variant="h5" fontWeight={700}>{avgUtilization}%</Typography>
        </Paper>
      </Stack>
    </>
  );
}
