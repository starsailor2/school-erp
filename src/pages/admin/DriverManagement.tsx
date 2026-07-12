import { useState } from "react";
import {
  TextField, MenuItem, Button, Chip, Stack, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid,
} from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { routes } from "@/demo-data";

interface Driver {
  id: string;
  name: string;
  phone: string;
  license: string;
  assignedRoute: string;
  busNumber: string;
  status: "active" | "on_leave" | "inactive";
}

const mockDrivers: Driver[] = [
  { id: "d1", name: "Rajesh Kumar", phone: "+91 98765 43210", license: "KA01-2020-0012345", assignedRoute: routes[0]?.name ?? "Route 1", busNumber: "KA01AB1234", status: "active" },
  { id: "d2", name: "Mohan Singh", phone: "+91 98765 43211", license: "KA01-2019-0054321", assignedRoute: routes[1]?.name ?? "Route 2", busNumber: "KA01CD5678", status: "active" },
  { id: "d3", name: "Suresh Yadav", phone: "+91 98765 43212", license: "KA01-2021-0098765", assignedRoute: routes[2]?.name ?? "Route 3", busNumber: "KA01EF9012", status: "active" },
  { id: "d4", name: "Dinesh Prasad", phone: "+91 98765 43213", license: "KA01-2018-0011111", assignedRoute: "Unassigned", busNumber: "—", status: "on_leave" },
  { id: "d5", name: "Ramesh Verma", phone: "+91 98765 43214", license: "KA01-2022-0022222", assignedRoute: "Unassigned", busNumber: "—", status: "inactive" },
];

export default function DriverManagement() {
  const [drivers, setDrivers] = useState(mockDrivers);
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [form, setForm] = useState({ name: "", phone: "", license: "" });

  const filtered = drivers.filter((d) => statusFilter === "all" || d.status === statusFilter);

  const handleAdd = () => {
    setDrivers((prev) => [
      ...prev,
      { id: `d${prev.length + 1}`, ...form, assignedRoute: "Unassigned", busNumber: "—", status: "active" as const },
    ]);
    setOpen(false);
    setForm({ name: "", phone: "", license: "" });
  };

  return (
    <>
      <PageHeader
        title="Driver Management"
        breadcrumbs={[{ label: "Dashboard", to: "/admin" }, { label: "Transport", to: "/admin/transport" }, { label: "Drivers" }]}
        action={<Button variant="contained" size="small" onClick={() => setOpen(true)}>Add Driver</Button>}
      />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField select fullWidth size="small" label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="on_leave">On Leave</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      <DataTable
        columns={[
          {
            key: "name", label: "Driver",
            render: (d) => (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: "primary.main" }}>{d.name.charAt(0)}</Avatar>
                <span>{d.name}</span>
              </Stack>
            ),
          },
          { key: "phone", label: "Phone" },
          { key: "license", label: "License No." },
          { key: "assignedRoute", label: "Route" },
          { key: "busNumber", label: "Bus No." },
          {
            key: "status", label: "Status",
            render: (d) => <Chip label={d.status.replace("_", " ")} size="small" color={d.status === "active" ? "success" : d.status === "on_leave" ? "warning" : "default"} />,
          },
        ]}
        rows={filtered}
      />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Driver</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Driver Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth size="small" />
            <TextField label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} fullWidth size="small" />
            <TextField label="License Number" value={form.license} onChange={(e) => setForm({ ...form, license: e.target.value })} fullWidth size="small" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd} disabled={!form.name}>Add</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
