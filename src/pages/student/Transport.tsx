import { Paper, Typography, Stack, Chip } from "@mui/material";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { studentTransport, routes } from "@/demo-data";

export default function StudentTransport() {
  const { user } = useAuth();
  const transport = studentTransport.find((t) => t.student_id === user?.id);
  const route = transport ? routes.find((r) => r.id === transport.route_id) : null;

  return (
    <>
      <PageHeader title="Transport" breadcrumbs={[{ label: "Dashboard", to: "/student" }, { label: "Transport" }]} />
      {!transport || !route ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <DirectionsBusIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
          <Typography color="text.secondary">No transport assigned.</Typography>
        </Paper>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6">
              <DirectionsBusIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              {route.name}
            </Typography>
            <Stack direction="row" spacing={2}>
              <Chip label={`Vehicle: ${route.vehicle_number}`} variant="outlined" />
              <Chip label={`Driver: ${route.driver_name}`} color="primary" />
              <Chip label={`Phone: ${route.driver_phone}`} variant="outlined" />
            </Stack>
            <Typography variant="subtitle2" color="text.secondary">
              Stop: <strong>{transport.stop_name}</strong> — Pickup: {transport.pickup_time}
            </Typography>
            <Typography variant="subtitle2" sx={{ mt: 1 }}>All Stops:</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {route.stops.map((stop, i) => (
                <Chip
                  key={i}
                  label={stop}
                  size="small"
                  color={stop === transport.stop_name ? "primary" : "default"}
                  variant={stop === transport.stop_name ? "filled" : "outlined"}
                />
              ))}
            </Stack>
          </Stack>
        </Paper>
      )}
    </>
  );
}
