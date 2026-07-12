import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Grid, Paper, Stack, Typography, Chip, TextField } from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { students, studentTransport, getClassName } from "@/demo-data";
import { getTransportRoutes, updateTransportRoute } from "@/demo-data/transport/transportRouteStore";

export default function TransportRouteDetails() {
  const navigate = useNavigate();
  const params = useParams();
  const [refresh, setRefresh] = useState(0);

  const route = getTransportRoutes().find((r) => r.id === params.routeId);
  const [driverName, setDriverName] = useState(route?.driver_name ?? "");
  const [driverPhone, setDriverPhone] = useState(route?.driver_phone ?? "");
  const [stopsInput, setStopsInput] = useState((route?.stops ?? []).join(", "));

  useEffect(() => {
    setDriverName(route?.driver_name ?? "");
    setDriverPhone(route?.driver_phone ?? "");
    setStopsInput((route?.stops ?? []).join(", "));
  }, [route, refresh]);

  useEffect(() => {
    const onUpdate = () => setRefresh((v) => v + 1);
    window.addEventListener("erp-transport-routes-updated", onUpdate);
    return () => window.removeEventListener("erp-transport-routes-updated", onUpdate);
  }, []);

  const assignedRows = useMemo(() => {
    if (!route) return [];
    return studentTransport
      .filter((s) => s.route_id === route.id)
      .map((allocation) => {
        const student = students.find((s) => s.id === allocation.student_id);
        return {
          id: allocation.id,
          studentName: student?.name ?? "-",
          className: student ? getClassName(student.class_id) : "-",
          stop: allocation.stop_name,
          pickup: allocation.pickup_time,
        };
      });
  }, [route]);

  if (!route) {
    return (
      <>
        <PageHeader
          title="Route Details"
          breadcrumbs={[{ label: "Dashboard", to: "/staff" }, { label: "Transport", to: "/staff/transport/routes" }, { label: "Route Details" }]}
        />
        <Paper sx={{ p: 3 }}>
          <Typography variant="body2">Route not found.</Typography>
        </Paper>
      </>
    );
  }

  const saveRouteDetails = () => {
    const cleanedStops = stopsInput.split(",").map((s) => s.trim()).filter(Boolean);
    updateTransportRoute(route.id, (r) => ({
      ...r,
      driver_name: driverName.trim() || r.driver_name,
      driver_phone: driverPhone.trim() || r.driver_phone,
      stops: cleanedStops.length > 0 ? cleanedStops : r.stops,
    }));
  };

  return (
    <>
      <PageHeader
        title={`${route.name} Details`}
        breadcrumbs={[{ label: "Dashboard", to: "/staff" }, { label: "Transport", to: "/staff/transport/routes" }, { label: "Route Details" }]}
        action={
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="outlined" onClick={() => navigate("/staff/transport/students")}>Students Assigned</Button>
            <Button size="small" variant="outlined" onClick={() => navigate("/staff/transport/vehicles")}>Vehicle</Button>
          </Stack>
        }
      />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">Bus</Typography>
            <Typography variant="h6" fontWeight={700}>{route.vehicle_number}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">Driver</Typography>
            <Typography variant="h6" fontWeight={700}>{route.driver_name}</Typography>
            <Typography variant="body2" color="text.secondary">{route.driver_phone}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">Capacity</Typography>
            <Typography variant="h6" fontWeight={700}>{assignedRows.length}/{route.capacity}</Typography>
            <Chip size="small" sx={{ mt: 0.5 }} label={`${Math.round((assignedRows.length / route.capacity) * 100)}% utilized`} />
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>Edit Route Details</Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField fullWidth size="small" label="Driver Name" value={driverName} onChange={(e) => setDriverName(e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField fullWidth size="small" label="Driver Phone" value={driverPhone} onChange={(e) => setDriverPhone(e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField fullWidth size="small" label="Stops (comma separated)" value={stopsInput} onChange={(e) => setStopsInput(e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Button size="small" variant="contained" onClick={saveRouteDetails}>Save Route Updates</Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>Stops</Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 1 }}>
          {route.stops.map((stop) => (
            <Chip key={stop} label={stop} variant="outlined" />
          ))}
        </Stack>
      </Paper>

      <DataTable
        rows={assignedRows}
        columns={[
          { key: "studentName", label: "Student" },
          { key: "className", label: "Class" },
          { key: "stop", label: "Stop" },
          { key: "pickup", label: "Pickup Time" },
        ]}
      />
    </>
  );
}
