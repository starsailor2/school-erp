import { useMemo, useState } from "react";
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid,
  TextField,
} from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { staffMembers } from "@/data/mock";

interface RolePolicy {
  id: number;
  role: string;
  roleType: string;
  department: string;
  permissions: string;
}

export default function StaffRoles() {
  const [policies, setPolicies] = useState<RolePolicy[]>([
    { id: 1, role: "Accountant", roleType: "accountant", department: "Accounts", permissions: "Fee Management, Receipts" },
    { id: 2, role: "Transport Manager", roleType: "transport_manager", department: "Transport", permissions: "Routes, Vehicles, Allocation" },
    { id: 3, role: "Library Staff", roleType: "library_staff", department: "Library", permissions: "Books, Issue/Return" },
    { id: 4, role: "Office Staff", roleType: "office_staff", department: "Office", permissions: "Certificates, ID Cards, Student Requests" },
  ]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ permissions: "", department: "" });

  const rows = useMemo(
    () => policies.map((policy) => ({
      ...policy,
      count: staffMembers.filter((member) => member.role_type === policy.roleType).length,
    })),
    [policies]
  );

  const openEdit = (row: RolePolicy) => {
    setEditingId(row.id);
    setForm({ permissions: row.permissions, department: row.department });
    setOpen(true);
  };

  const handleSave = () => {
    if (!editingId) return;
    setPolicies((prev) => prev.map((policy) => (
      policy.id === editingId
        ? { ...policy, permissions: form.permissions, department: form.department }
        : policy
    )));
    setOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Staff Roles"
        breadcrumbs={[
          { label: "Dashboard", to: "/admin" },
          { label: "Staff", to: "/admin/staff" },
          { label: "Roles" },
        ]}
      />
      <DataTable
        columns={[
          { key: "role", label: "Role" },
          { key: "department", label: "Department" },
          { key: "count", label: "Members" },
          { key: "permissions", label: "Key Permissions" },
          {
            key: "actions",
            label: "Actions",
            render: (r) => <Button size="small" variant="outlined" onClick={() => openEdit(r)}>Edit Policy</Button>,
          },
        ]}
        rows={rows}
      />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Role Policy</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Department"
                value={form.department}
                onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Permissions"
                value={form.permissions}
                onChange={(e) => setForm((prev) => ({ ...prev, permissions: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
