import { useMemo, useState } from "react";
import {
  Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid,
  MenuItem, TextField,
} from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { routes } from "@/data/mock";

type VehicleStatus = "active" | "maintenance" | "inactive";

interface VehicleRow {
  id: string;
  vehicleNumber: string;
  driver: string;
  route: string;
  capacity: number;
  status: VehicleStatus;
  lastService: string;
}

type VehicleTableRow = {
  id: string;
  vehicleNumber: string;
  driver: string;
  route: string;
  capacity: number;
  status: VehicleStatus;
  lastService: string;
};

export default function Vehicles() {
  const [rows, setRows] = useState<VehicleRow[]>(
    routes.map((r) => ({
      id: r.id,
      vehicleNumber: r.vehicle_number,
      driver: r.driver_name,
      route: r.name,
      capacity: r.capacity,
      status: "active",
      lastService: "2026-02-15",
    }))
  );
  const [statusFilter, setStatusFilter] = useState<"all" | VehicleStatus>("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<VehicleRow, "id">>({
    vehicleNumber: "",
    driver: "",
    route: "",
    capacity: 40,
    status: "active",
    lastService: "",
  });

  const filtered = useMemo(
    () => rows.filter((v) => statusFilter === "all" || v.status === statusFilter),
    [rows, statusFilter]
  );

  const tableRows: VehicleTableRow[] = filtered.map((row) => ({
    id: row.id,
    vehicleNumber: row.vehicleNumber,
    driver: row.driver,
    route: row.route,
    capacity: row.capacity,
    status: row.status,
    lastService: row.lastService,
  }));

  const handleAdd = () => {
    if (!form.vehicleNumber.trim()) return;
    setRows((prev) => [
      ...prev,
      {
        id: `vh-${Date.now()}`,
        ...form,
        vehicleNumber: form.vehicleNumber.trim(),
        driver: form.driver.trim(),
      },
    ]);
    setOpen(false);
    setForm({ vehicleNumber: "", driver: "", route: "", capacity: 40, status: "active", lastService: "" });
  };

  return (
    <>
      <PageHeader
        title="Vehicles"
        breadcrumbs={[
          { label: "Dashboard", to: "/admin" },
          { label: "Transport", to: "/admin/transport" },
          { label: "Vehicles" },
        ]}
        action={<Button variant="contained" size="small" onClick={() => setOpen(true)}>Add Vehicle</Button>}
      />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth
            select
            size="small"
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | VehicleStatus)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="maintenance">Maintenance</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      <DataTable<VehicleTableRow>
        columns={[
          { key: "vehicleNumber", label: "Vehicle Number" },
          { key: "driver", label: "Driver" },
          { key: "route", label: "Route" },
          { key: "capacity", label: "Capacity" },
          {
            key: "status",
            label: "Status",
            render: (r) => (
              <Chip
                label={r.status}
                size="small"
                color={r.status === "active" ? "success" : r.status === "maintenance" ? "warning" : "default"}
              />
            ),
          },
          { key: "lastService", label: "Last Service" },
        ]}
        rows={tableRows}
      />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Vehicle</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Vehicle Number" value={form.vehicleNumber} onChange={(e) => setForm((prev) => ({ ...prev, vehicleNumber: e.target.value }))} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Driver" value={form.driver} onChange={(e) => setForm((prev) => ({ ...prev, driver: e.target.value }))} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Route" value={form.route} onChange={(e) => setForm((prev) => ({ ...prev, route: e.target.value }))} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth type="number" label="Capacity" value={form.capacity} onChange={(e) => setForm((prev) => ({ ...prev, capacity: Number(e.target.value) }))} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                select
                label="Status"
                value={form.status}
                onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as VehicleStatus }))}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="date"
                label="Last Service"
                slotProps={{ inputLabel: { shrink: true } }}
                value={form.lastService}
                onChange={(e) => setForm((prev) => ({ ...prev, lastService: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>Add Vehicle</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
