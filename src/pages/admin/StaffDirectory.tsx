import { useMemo, useState } from "react";
import {
  Avatar, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  Grid, MenuItem, Paper, TextField, Typography, Stack, Divider,
} from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { staffMembers } from "@/demo-data";
import type { Staff, StaffRole } from "@/types";

type StaffRow = {
  id: string;
  name: string;
  department: string;
  role_type: string;
  email: string;
};

type StaffTask = {
  id: string;
  staffId: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed";
  assignedDate: string;
};

export default function StaffDirectory() {
  const [rows, setRows] = useState<Staff[]>(staffMembers);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | StaffRole>("all");
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [tasks, setTasks] = useState<StaffTask[]>([]);
  const [taskForm, setTaskForm] = useState({ title: "", description: "" });
  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "Office",
    role_type: "office_staff" as StaffRole,
  });

  const filtered = useMemo(
    () => rows
      .filter((s) => roleFilter === "all" || s.role_type === roleFilter)
      .filter((s) => `${s.name} ${s.email} ${s.department}`.toLowerCase().includes(query.toLowerCase())),
    [rows, roleFilter, query]
  );

  const tableRows: StaffRow[] = filtered.map((s) => ({
    id: s.id,
    name: s.name,
    department: s.department,
    role_type: s.role_type,
    email: s.email,
  }));

  const handleAdd = () => {
    if (!form.name.trim() || !form.email.trim()) return;
    setRows((prev) => [
      ...prev,
      {
        id: `sf${prev.length + 1}`,
        name: form.name.trim(),
        email: form.email.trim(),
        department: form.department,
        role_type: form.role_type,
      },
    ]);
    setOpen(false);
    setForm({ name: "", email: "", department: "Office", role_type: "office_staff" });
  };

  const openProfile = (row: StaffRow) => {
    const staff = rows.find((s) => s.id === row.id);
    if (staff) {
      setSelectedStaff(staff);
      setProfileOpen(true);
    }
  };

  const openTaskDialog = () => {
    setTaskForm({ title: "", description: "" });
    setTaskOpen(true);
  };

  const handleAssignTask = () => {
    if (!selectedStaff || !taskForm.title.trim()) return;
    const newTask: StaffTask = {
      id: `task-${Date.now()}`,
      staffId: selectedStaff.id,
      title: taskForm.title.trim(),
      description: taskForm.description.trim(),
      status: "pending",
      assignedDate: new Date().toISOString().split("T")[0],
    };
    setTasks((prev) => [...prev, newTask]);
    setTaskOpen(false);
  };

  const staffTasks = selectedStaff ? tasks.filter((t) => t.staffId === selectedStaff.id) : [];

  return (
    <>
      <PageHeader
        title="School Staff"
        breadcrumbs={[
          { label: "Dashboard", to: "/admin" },
          { label: "Staff" },
        ]}
        action={<Button variant="contained" size="small" onClick={() => setOpen(true)}>Add Staff</Button>}
      />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <TextField
            fullWidth
            size="small"
            label="Search staff"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            select
            size="small"
            label="Role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as "all" | StaffRole)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="accountant">Accountant</MenuItem>
            <MenuItem value="transport_manager">Transport Manager</MenuItem>
            <MenuItem value="library_staff">Library Staff</MenuItem>
            <MenuItem value="office_staff">Office Staff</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 1.5, height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">Visible Staff</Typography>
            <Chip label={filtered.length} size="small" color="primary" />
          </Paper>
        </Grid>
      </Grid>

      <DataTable<StaffRow>
        columns={[
          {
            key: "name", label: "Name",
            render: (s) => (
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer", "&:hover": { color: "primary.main" } }}
                onClick={() => openProfile(s)}
              >
                <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>{s.name.charAt(0)}</Avatar>
                <Typography variant="body2" sx={{ textDecoration: "underline" }}>{s.name}</Typography>
              </Box>
            ),
          },
          { key: "department", label: "Department" },
          { key: "role_type", label: "Role", render: (s) => <Chip label={s.role_type.replace("_", " ")} size="small" variant="outlined" /> },
          { key: "email", label: "Email" },
          {
            key: "actions", label: "Actions",
            render: (s) => (
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="outlined" onClick={() => openProfile(s)}>View</Button>
                <Button size="small" variant="contained" onClick={() => { openProfile(s); setTimeout(openTaskDialog, 100); }}>Assign Task</Button>
              </Stack>
            ),
          },
        ]}
        rows={tableRows}
      />

      {/* Staff Profile Dialog */}
      <Dialog open={profileOpen} onClose={() => setProfileOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Staff Profile</DialogTitle>
        <DialogContent>
          {selectedStaff && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ width: 56, height: 56, fontSize: 24 }}>{selectedStaff.name.charAt(0)}</Avatar>
                <Box>
                  <Typography variant="h6">{selectedStaff.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{selectedStaff.email}</Typography>
                </Box>
              </Box>
              <Divider />
              <Grid container spacing={2}>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary">Department</Typography>
                  <Typography variant="body2">{selectedStaff.department}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary">Role</Typography>
                  <Typography variant="body2" sx={{ textTransform: "capitalize" }}>{selectedStaff.role_type.replace("_", " ")}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary">Staff ID</Typography>
                  <Typography variant="body2">{selectedStaff.id.toUpperCase()}</Typography>
                </Grid>
              </Grid>
              <Divider />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="subtitle2">Assigned Tasks ({staffTasks.length})</Typography>
                <Button size="small" variant="contained" onClick={openTaskDialog}>Assign Task</Button>
              </Box>
              {staffTasks.length > 0 ? (
                <Stack spacing={1}>
                  {staffTasks.map((t) => (
                    <Paper key={t.id} variant="outlined" sx={{ p: 1.5 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="subtitle2">{t.title}</Typography>
                        <Chip label={t.status.replace("_", " ")} size="small" color={t.status === "completed" ? "success" : t.status === "in_progress" ? "warning" : "default"} />
                      </Box>
                      {t.description && <Typography variant="caption" color="text.secondary">{t.description}</Typography>}
                      <Typography variant="caption" display="block" color="text.secondary">Assigned: {t.assignedDate}</Typography>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">No tasks assigned yet.</Typography>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfileOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Assign Task Dialog */}
      <Dialog open={taskOpen} onClose={() => setTaskOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Task to {selectedStaff?.name}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField fullWidth label="Task Title" value={taskForm.title} onChange={(e) => setTaskForm((prev) => ({ ...prev, title: e.target.value }))} />
            <TextField fullWidth multiline rows={3} label="Description (optional)" value={taskForm.description} onChange={(e) => setTaskForm((prev) => ({ ...prev, description: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTaskOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAssignTask} disabled={!taskForm.title.trim()}>Assign</Button>
        </DialogActions>
      </Dialog>

      {/* Add Staff Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Staff Member</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}>
              <TextField fullWidth label="Name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
            </Grid>
            <Grid size={12}>
              <TextField fullWidth label="Email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Department" value={form.department} onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                select
                label="Role"
                value={form.role_type}
                onChange={(e) => setForm((prev) => ({ ...prev, role_type: e.target.value as StaffRole }))}
              >
                <MenuItem value="accountant">Accountant</MenuItem>
                <MenuItem value="transport_manager">Transport Manager</MenuItem>
                <MenuItem value="library_staff">Library Staff</MenuItem>
                <MenuItem value="office_staff">Office Staff</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>Add</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
