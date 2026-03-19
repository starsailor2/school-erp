import { useState } from "react";
import { MenuItem, TextField, Grid, Chip, Paper, Typography } from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { homework, classes, getClassName, getSubjectName, getTeacherName } from "@/data/mock";

export default function HomeworkMonitor() {
  const [classFilter, setClassFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const today = new Date().toISOString().split("T")[0];

  const enriched = homework
    .filter((h) => classFilter === "all" || h.class_id === classFilter)
    .filter((h) => subjectFilter === "all" || h.subject_id === subjectFilter)
    .map((h) => {
      const due = new Date(h.due_date);
      const now = new Date(today);
      const daysLeft = Math.ceil((+due - +now) / (1000 * 60 * 60 * 24));
      const status = daysLeft < 0 ? "completed" : daysLeft <= 2 ? "due_soon" : "active";
      return { ...h, status, daysLeft };
    })
    .filter((h) => statusFilter === "all" || h.status === statusFilter);

  const completedCount = enriched.filter((h) => h.status === "completed").length;
  const dueSoonCount = enriched.filter((h) => h.status === "due_soon").length;
  const activeCount = enriched.filter((h) => h.status === "active").length;

  return (
    <>
      <PageHeader
        title="Homework Monitor"
        breadcrumbs={[
          { label: "Dashboard", to: "/admin" },
          { label: "Homework" },
        ]}
      />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField fullWidth select size="small" label="Class" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
            <MenuItem value="all">All Classes</MenuItem>
            {classes.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField fullWidth select size="small" label="Subject" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
            <MenuItem value="all">All Subjects</MenuItem>
            {Array.from(new Set(homework.map((h) => h.subject_id))).map((id) => (
              <MenuItem key={id} value={id}>{getSubjectName(id)}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField fullWidth select size="small" label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="due_soon">Due Soon</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <Paper sx={{ p: 1.2, display: "flex", gap: 1, alignItems: "center", height: "100%", flexWrap: "wrap" }}>
            <Chip label={`Active ${activeCount}`} size="small" color="info" />
            <Chip label={`Due Soon ${dueSoonCount}`} size="small" color="warning" />
            <Chip label={`Completed ${completedCount}`} size="small" color="success" />
          </Paper>
        </Grid>
      </Grid>

      {enriched.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            {statusFilter === "completed"
              ? "All homework for the selected filters has been assigned and completed."
              : "No homework currently assigned for the selected filters."}
          </Typography>
        </Paper>
      ) : (
        <DataTable
          columns={[
            { key: "title", label: "Title" },
            { key: "class_id", label: "Class", render: (h) => getClassName(h.class_id) },
            { key: "subject_id", label: "Subject", render: (h) => getSubjectName(h.subject_id) },
            { key: "teacher_id", label: "Teacher", render: (h) => getTeacherName(h.teacher_id) },
            { key: "due_date", label: "Due Date" },
            { key: "assigned_date", label: "Assigned" },
            {
              key: "status",
              label: "Status",
              render: (h) => (
                <Chip
                  size="small"
                  label={h.status === "completed" ? "Completed" : h.status === "due_soon" ? "Due Soon" : "Active"}
                  color={h.status === "completed" ? "success" : h.status === "due_soon" ? "warning" : "info"}
                />
              ),
            },
          ]}
          rows={enriched}
        />
      )}
    </>
  );
}
