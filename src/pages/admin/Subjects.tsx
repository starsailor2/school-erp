import { useMemo, useState } from "react";
import {
  Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid,
  IconButton, MenuItem, Paper, Stack, TextField, Tooltip, Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { subjects } from "@/demo-data";
import type { Subject } from "@/types";

export default function Subjects() {
  const [rows, setRows] = useState<Subject[]>(subjects);
  const [query, setQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", department: "Science" });

  const departments = Array.from(new Set(rows.map((s) => s.department)));

  const filtered = useMemo(
    () => rows
      .filter((s) => departmentFilter === "all" || s.department === departmentFilter)
      .filter((s) => `${s.name} ${s.department}`.toLowerCase().includes(query.toLowerCase())),
    [rows, query, departmentFilter]
  );

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({ name: "", department: "Science" });
    setOpen(true);
  };

  const handleOpenEdit = (subject: Subject) => {
    setEditingId(subject.id);
    setForm({ name: subject.name, department: subject.department });
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editingId) {
      setRows((prev) => prev.map((s) => (s.id === editingId ? { ...s, ...form, name: form.name.trim() } : s)));
    } else {
      setRows((prev) => [
        ...prev,
        { id: `sub${prev.length + 1}`, name: form.name.trim(), department: form.department },
      ]);
    }
    setOpen(false);
  };

  const handleDelete = (id: string) => setRows((prev) => prev.filter((s) => s.id !== id));

  return (
    <>
      <PageHeader
        title="Subjects"
        breadcrumbs={[
          { label: "Dashboard", to: "/admin" },
          { label: "Academics" },
          { label: "Subjects" },
        ]}
        action={<Button variant="contained" size="small" onClick={handleOpenCreate}>Add Subject</Button>}
      />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <TextField
            fullWidth
            size="small"
            label="Search subject"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            select
            label="Department"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <MenuItem value="all">All Departments</MenuItem>
            {departments.map((dept) => <MenuItem key={dept} value={dept}>{dept}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", height: "100%" }}>
            <Typography variant="body2" color="text.secondary">Visible Subjects</Typography>
            <Chip label={filtered.length} size="small" color="primary" />
          </Paper>
        </Grid>
      </Grid>

      <DataTable
        columns={[
          { key: "name", label: "Subject" },
          { key: "department", label: "Department", render: (s) => <Chip label={s.department} size="small" variant="outlined" /> },
          {
            key: "actions",
            label: "Actions",
            render: (s) => (
              <Stack direction="row" spacing={0.5}>
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => handleOpenEdit(s)}><EditIcon fontSize="small" /></IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton size="small" color="error" onClick={() => handleDelete(s.id)}><DeleteIcon fontSize="small" /></IconButton>
                </Tooltip>
              </Stack>
            ),
          },
        ]}
        rows={filtered}
      />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? "Edit Subject" : "Add Subject"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 7 }}>
              <TextField
                fullWidth
                label="Subject Name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 5 }}>
              <TextField
                fullWidth
                select
                label="Department"
                value={form.department}
                onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
              >
                {["Science", "Language", "Social Science", "Sports"].map((d) => (
                  <MenuItem key={d} value={d}>{d}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>{editingId ? "Update" : "Add"}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
