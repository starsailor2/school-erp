import { useMemo, useState } from "react";
import {
  Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  Grid, MenuItem, Paper, TextField, Typography,
} from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { teachers, subjects } from "@/demo-data";

type HodRow = {
  id: string;
  subjectName: string;
  department: string;
  hodId: string;
  hodName: string;
  assigned: boolean;
};

export default function HodAssign() {
  const [rows, setRows] = useState<HodRow[]>(subjects.map((sub, i) => {
    // Pre-assign an HOD for the first few subjects based on teacher index
    const teacher = i < teachers.length ? teachers[i] : undefined;
    return {
      id: sub.id,
      subjectName: sub.name,
      department: sub.department,
      hodId: teacher && i < 5 ? teacher.id : "",
      hodName: teacher && i < 5 ? teacher.name : "Not Assigned",
      assigned: i < 5,
    };
  }));
  const [assignmentFilter, setAssignmentFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState("");
  const [selectedHodId, setSelectedHodId] = useState("");

  const departments = [...new Set(subjects.map((s) => s.department))];

  const filtered = useMemo(
    () => rows.filter((row) => {
      if (assignmentFilter === "assigned" && !row.assigned) return false;
      if (assignmentFilter === "vacant" && row.assigned) return false;
      if (deptFilter !== "all" && row.department !== deptFilter) return false;
      return true;
    }),
    [rows, assignmentFilter, deptFilter]
  );

  const openAssignDialog = (row: HodRow) => {
    setEditingSubjectId(row.id);
    setSelectedHodId(row.hodId);
    setOpen(true);
  };

  const handleSave = () => {
    const selected = teachers.find((teacher) => teacher.id === selectedHodId);
    if (!selected) return;
    setRows((prev) => prev.map((row) => (
      row.id === editingSubjectId
        ? { ...row, hodId: selected.id, hodName: selected.name, assigned: true }
        : row
    )));
    setOpen(false);
  };

  return (
    <>
      <PageHeader
        title="HOD Assignment"
        breadcrumbs={[
          { label: "Dashboard", to: "/admin" },
          { label: "Teachers", to: "/admin/teachers" },
          { label: "HOD Assignment" },
        ]}
      />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            select
            size="small"
            label="Status"
            value={assignmentFilter}
            onChange={(e) => setAssignmentFilter(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="assigned">Assigned</MenuItem>
            <MenuItem value="vacant">Vacant</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            select
            size="small"
            label="Department"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <MenuItem value="all">All Departments</MenuItem>
            {departments.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 1.5, display: "flex", gap: 1, alignItems: "center", height: "100%" }}>
            <Typography variant="body2" color="text.secondary">Summary</Typography>
            <Chip label={`Assigned ${rows.filter((r) => r.assigned).length}`} size="small" color="success" />
            <Chip label={`Vacant ${rows.filter((r) => !r.assigned).length}`} size="small" color="warning" />
            <Chip label={`Total ${rows.length}`} size="small" color="info" />
          </Paper>
        </Grid>
      </Grid>
      <DataTable
        columns={[
          { key: "subjectName", label: "Subject" },
          { key: "department", label: "Department" },
          { key: "hodName", label: "HOD" },
          { key: "assigned", label: "Status", render: (r) => <Chip label={r.assigned ? "Assigned" : "Vacant"} size="small" color={r.assigned ? "success" : "warning"} /> },
          { key: "actions", label: "Actions", render: (r) => <Button size="small" variant="outlined" onClick={() => openAssignDialog(r)}>Assign</Button> },
        ]}
        rows={filtered}
      />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign HOD for Subject</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            sx={{ mt: 1 }}
            select
            label="Select Teacher"
            value={selectedHodId}
            onChange={(e) => setSelectedHodId(e.target.value)}
          >
            {teachers.map((teacher) => (
              <MenuItem key={teacher.id} value={teacher.id}>{teacher.name} — {teacher.department}</MenuItem>
            ))}
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
