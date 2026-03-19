import { useState } from "react";
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Grid, MenuItem, TextField,
} from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { students, routes, getClassName } from "@/data/mock";

type AllocationRow = {
  id: string;
  studentName: string;
  className: string;
  routeId: string;
  routeName: string;
  busNumber: string;
  driverName: string;
};

export default function TransportAllocation() {
  const initialRows: AllocationRow[] = students
    .filter((s) => s.transport_route_id)
    .map((s) => {
      const route = routes.find((r) => r.id === s.transport_route_id);
      return {
        id: s.id,
        studentName: s.name,
        className: getClassName(s.class_id),
        routeId: route?.id ?? "",
        routeName: route?.name ?? "—",
        busNumber: route?.vehicle_number ?? "—",
        driverName: route?.driver_name ?? "—",
      };
    });

  const [rows, setRows] = useState<AllocationRow[]>(initialRows);
  const [routeFilter, setRouteFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [selectedRouteId, setSelectedRouteId] = useState("");

  const filtered = rows.filter((row) => routeFilter === "all" || row.routeId === routeFilter);

  const openAssign = (row: AllocationRow) => {
    setEditingId(row.id);
    setSelectedRouteId(row.routeId);
    setOpen(true);
  };

  const handleSave = () => {
    const route = routes.find((item) => item.id === selectedRouteId);
    if (!route) return;
    setRows((prev) => prev.map((row) => (
      row.id === editingId
        ? {
          ...row,
          routeId: route.id,
          routeName: route.name,
          busNumber: route.vehicle_number,
          driverName: route.driver_name,
        }
        : row
    )));
    setOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Student Transport Allocation"
        breadcrumbs={[
          { label: "Dashboard", to: "/admin" },
          { label: "Transport", to: "/admin/transport" },
          { label: "Allocation" },
        ]}
      />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select size="small" label="Route" value={routeFilter} onChange={(e) => setRouteFilter(e.target.value)}>
            <MenuItem value="all">All Routes</MenuItem>
            {routes.map((route) => <MenuItem key={route.id} value={route.id}>{route.name}</MenuItem>)}
          </TextField>
        </Grid>
      </Grid>
      <DataTable
        columns={[
          { key: "studentName", label: "Student" },
          { key: "className", label: "Class" },
          { key: "routeName", label: "Route" },
          { key: "busNumber", label: "Bus Number" },
          { key: "driverName", label: "Driver" },
          { key: "actions", label: "Actions", render: (row) => <Button size="small" variant="outlined" onClick={() => openAssign(row)}>Reassign</Button> },
        ]}
        rows={filtered}
      />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reassign Route</DialogTitle>
        <DialogContent>
          <TextField
            sx={{ mt: 1 }}
            fullWidth
            select
            label="Route"
            value={selectedRouteId}
            onChange={(e) => setSelectedRouteId(e.target.value)}
          >
            {routes.map((route) => <MenuItem key={route.id} value={route.id}>{route.name} ({route.vehicle_number})</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
