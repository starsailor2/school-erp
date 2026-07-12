import { useMemo, useState } from "react";
import {
  Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid,
  IconButton, MenuItem, Paper, Stack, TextField, Tooltip, Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { exams } from "@/demo-data";
import type { Exam } from "@/types";

type ExamStatus = "upcoming" | "ongoing" | "completed";

const formatType = (type: string) => type.replace(/_/g, " ");

const getStatus = (start: string, end: string): ExamStatus => {
  const now = new Date();
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (now < startDate) return "upcoming";
  if (now > endDate) return "completed";
  return "ongoing";
};

export default function ExamSetup() {
  const [rows, setRows] = useState<Exam[]>(exams);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Exam | null>(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({
    name: "",
    exam_type: "unit_test" as Exam["exam_type"],
    start_date: "",
    end_date: "",
  });

  const filtered = useMemo(
    () => rows
      .filter((r) => typeFilter === "all" || r.exam_type === typeFilter)
      .filter((r) => `${r.name} ${r.exam_type}`.toLowerCase().includes(query.toLowerCase()))
      .map((r) => ({ ...r, status: getStatus(r.start_date, r.end_date) })),
    [rows, typeFilter, query]
  );

  const counts = filtered.reduce(
    (acc, exam) => {
      acc[exam.status as ExamStatus] += 1;
      return acc;
    },
    { upcoming: 0, ongoing: 0, completed: 0 }
  );

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", exam_type: "unit_test", start_date: "", end_date: "" });
    setOpen(true);
  };

  const openEdit = (exam: Exam) => {
    setEditing(exam);
    setForm({
      name: exam.name,
      exam_type: exam.exam_type,
      start_date: exam.start_date,
      end_date: exam.end_date,
    });
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.start_date || !form.end_date) return;
    if (editing) {
      setRows((prev) => prev.map((e) => (e.id === editing.id ? { ...e, ...form, name: form.name.trim() } : e)));
    } else {
      setRows((prev) => [
        { id: `ex${Date.now()}`, ...form, name: form.name.trim() },
        ...prev,
      ]);
    }
    setOpen(false);
  };

  const handleDelete = (id: string) => setRows((prev) => prev.filter((e) => e.id !== id));

  return (
    <>
      <PageHeader
        title="Exam Setup"
        breadcrumbs={[
          { label: "Dashboard", to: "/admin" },
          { label: "Examinations" },
        ]}
        action={<Button variant="contained" size="small" onClick={openCreate}>Create Exam</Button>}
      />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            label="Search exam"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            select
            size="small"
            label="Exam Type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="unit_test">Unit Test</MenuItem>
            <MenuItem value="mid_term">Mid Term</MenuItem>
            <MenuItem value="final_exam">Final Exam</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 1.5, display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center", height: "100%" }}>
            <Typography variant="body2" color="text.secondary">Status</Typography>
            <Chip label={`Upcoming ${counts.upcoming}`} size="small" color="info" />
            <Chip label={`Ongoing ${counts.ongoing}`} size="small" color="warning" />
            <Chip label={`Completed ${counts.completed}`} size="small" color="success" />
          </Paper>
        </Grid>
      </Grid>

      <DataTable
        columns={[
          { key: "name", label: "Exam Name" },
          { key: "exam_type", label: "Type", render: (e) => <Chip label={formatType(e.exam_type)} size="small" variant="outlined" /> },
          { key: "start_date", label: "Start Date" },
          { key: "end_date", label: "End Date" },
          {
            key: "status",
            label: "Status",
            render: (e) => {
              const status = getStatus(e.start_date, e.end_date);
              return <Chip label={status} size="small" color={status === "completed" ? "success" : status === "ongoing" ? "warning" : "info"} />;
            },
          },
          {
            key: "actions",
            label: "Actions",
            render: (e) => (
              <Stack direction="row" spacing={0.5}>
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => openEdit(e)}><EditIcon fontSize="small" /></IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton size="small" color="error" onClick={() => handleDelete(e.id)}><DeleteIcon fontSize="small" /></IconButton>
                </Tooltip>
              </Stack>
            ),
          },
        ]}
        rows={filtered}
      />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? "Edit Exam" : "Create Exam"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Exam Name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                select
                label="Type"
                value={form.exam_type}
                onChange={(e) => setForm((prev) => ({ ...prev, exam_type: e.target.value as Exam["exam_type"] }))}
              >
                <MenuItem value="unit_test">Unit Test</MenuItem>
                <MenuItem value="mid_term">Mid Term</MenuItem>
                <MenuItem value="final_exam">Final Exam</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                slotProps={{ inputLabel: { shrink: true } }}
                value={form.start_date}
                onChange={(e) => setForm((prev) => ({ ...prev, start_date: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                slotProps={{ inputLabel: { shrink: true } }}
                value={form.end_date}
                onChange={(e) => setForm((prev) => ({ ...prev, end_date: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>{editing ? "Update" : "Create"}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
