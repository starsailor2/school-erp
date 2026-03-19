import { Paper, Typography, Stack, Chip, MenuItem, TextField } from "@mui/material";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { parents, getChildrenOfParent, studentTransport, routes, getClassName } from "@/data/mock";

export default function ParentTransport() {
  const { user, selectedChildId, setSelectedChildId } = useAuth();
  const parent = parents.find((p) => p.id === user?.id);
  const children = parent ? getChildrenOfParent(parent.id) : [];
  const child = children.find((c) => c.id === selectedChildId) ?? children[0];
  const transport = child ? studentTransport.find((t) => t.student_id === child.id) : null;
  const route = transport ? routes.find((r) => r.id === transport.route_id) : null;

  return (
    <>
      <PageHeader title="Transport" breadcrumbs={[{ label: "Dashboard", to: "/parent" }, { label: "Transport" }]} />

      {children.length > 1 && (
        <TextField
          select size="small" label="Select Child" value={selectedChildId ?? children[0]?.id ?? ""}
          onChange={(e) => setSelectedChildId(e.target.value)}
          sx={{ mb: 2, minWidth: 280 }}
        >
          {children.map((c) => (
            <MenuItem key={c.id} value={c.id}>{c.name} — {getClassName(c.class_id)}</MenuItem>
          ))}
        </TextField>
      )}

      {!child ? (
        <Typography color="text.secondary">Select a child from the dashboard.</Typography>
      ) : !transport || !route ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <DirectionsBusIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
          <Typography color="text.secondary">No transport assigned for {child.name}.</Typography>
        </Paper>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6">
              <DirectionsBusIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              {route.name}
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              <Chip label={`Vehicle: ${route.vehicle_number}`} variant="outlined" />
              <Chip label={`Driver: ${route.driver_name}`} color="primary" />
              <Chip label={`Phone: ${route.driver_phone}`} variant="outlined" />
            </Stack>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
              Stop: <strong>{transport.stop_name}</strong> — Pickup: {transport.pickup_time}
            </Typography>
            <Typography variant="subtitle2" sx={{ mt: 1 }}>All Stops on this Route:</Typography>
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
