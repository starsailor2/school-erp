import { useMemo, useState } from "react";
import {
  Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid,
  MenuItem, Paper, TextField, Typography,
} from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { routes, students } from "@/data/mock";
import type { Route } from "@/types";

export default function TransportRoutes() {
  const [rows, setRows] = useState<Route[]>(routes);
  const [query, setQuery] = useState("");
  const [utilization, setUtilization] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    vehicle_number: "",
    driver_name: "",
    driver_phone: "",
    capacity: 40,
    stops: "",
  });

  const displayRows = useMemo(
    () => rows
      .map((r) => {
        const assigned = students.filter((s) => s.transport_route_id === r.id).length;
        const utilizationPct = r.capacity > 0 ? Math.round((assigned / r.capacity) * 100) : 0;
        return { ...r, assigned, utilizationPct };
      })
      .filter((r) => `${r.name} ${r.vehicle_number} ${r.driver_name}`.toLowerCase().includes(query.toLowerCase()))
      .filter((r) => {
        if (utilization === "all") return true;
        if (utilization === "high") return r.utilizationPct >= 80;
        if (utilization === "medium") return r.utilizationPct >= 50 && r.utilizationPct < 80;
        return r.utilizationPct < 50;
      }),
    [rows, query, utilization]
  );

  const handleAdd = () => {
    if (!form.name.trim() || !form.vehicle_number.trim()) return;
    setRows((prev) => [
      ...prev,
      {
        id: `r${prev.length + 1}`,
        name: form.name.trim(),
        vehicle_number: form.vehicle_number.trim(),
        driver_name: form.driver_name.trim() || "TBD",
        driver_phone: form.driver_phone.trim() || "N/A",
        capacity: form.capacity,
        stops: form.stops.split(",").map((x) => x.trim()).filter(Boolean),
      },
    ]);
    setOpen(false);
    setForm({ name: "", vehicle_number: "", driver_name: "", driver_phone: "", capacity: 40, stops: "" });
  };

  return (
    <>
      <PageHeader
        title="Transport Routes"
        breadcrumbs={[
          { label: "Dashboard", to: "/admin" },
          { label: "Transport" },
        ]}
        action={<Button variant="contained" size="small" onClick={() => setOpen(true)}>Add Route</Button>}
      />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <TextField fullWidth size="small" label="Search route" value={query} onChange={(e) => setQuery(e.target.value)} />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField fullWidth select size="small" label="Utilization" value={utilization} onChange={(e) => setUtilization(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="high">High (80%+)</MenuItem>
            <MenuItem value="medium">Medium (50-79%)</MenuItem>
            <MenuItem value="low">Low (&lt; 50%)</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 1.5, height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">Routes</Typography>
            <Chip label={displayRows.length} size="small" color="primary" />
          </Paper>
        </Grid>
      </Grid>

      <DataTable
        columns={[
          { key: "name", label: "Route" },
          { key: "vehicle_number", label: "Vehicle" },
          { key: "driver_name", label: "Driver" },
          { key: "capacity", label: "Capacity" },
          { key: "assigned", label: "Assigned Students" },
          { key: "utilizationPct", label: "Utilization", render: (r) => <Chip size="small" label={`${r.utilizationPct}%`} color={r.utilizationPct >= 80 ? "error" : r.utilizationPct >= 50 ? "warning" : "success"} /> },
          { key: "stops", label: "Stops", render: (r) => r.stops.join(" → ") },
        ]}
        rows={displayRows}
      />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Transport Route</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Route Name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Vehicle Number" value={form.vehicle_number} onChange={(e) => setForm((prev) => ({ ...prev, vehicle_number: e.target.value }))} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Driver Name" value={form.driver_name} onChange={(e) => setForm((prev) => ({ ...prev, driver_name: e.target.value }))} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Driver Phone" value={form.driver_phone} onChange={(e) => setForm((prev) => ({ ...prev, driver_phone: e.target.value }))} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth type="number" label="Capacity" value={form.capacity} onChange={(e) => setForm((prev) => ({ ...prev, capacity: Number(e.target.value) }))} />
            </Grid>
            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField fullWidth label="Stops" helperText="Comma separated" value={form.stops} onChange={(e) => setForm((prev) => ({ ...prev, stops: e.target.value }))} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>Add Route</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
