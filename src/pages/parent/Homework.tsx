import { useState } from "react";
import {
  Chip, MenuItem, TextField, Typography, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Divider,
} from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { useAuth } from "@/context/AuthContext";
import { parents, getChildrenOfParent, homework, getSubjectName, getTeacherName, getClassName } from "@/data/mock";
import type { Homework } from "@/types";

export default function ParentHomework() {
  const { user, selectedChildId, setSelectedChildId } = useAuth();
  const parent = parents.find((p) => p.id === user?.id);
  const children = parent ? getChildrenOfParent(parent.id) : [];
  const child = children.find((c) => c.id === selectedChildId) ?? children[0];
  const hw = child ? homework.filter((h) => h.class_id === child.class_id) : [];
  const [viewing, setViewing] = useState<Homework | null>(null);

  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      <PageHeader
        title={`Homework — ${child?.name ?? ""}`}
        breadcrumbs={[{ label: "Dashboard", to: "/parent" }, { label: "Homework" }]}
      />

      {children.length > 1 && (
        <TextField
          select size="small" label="Select Child" value={selectedChildId ?? children[0]?.id ?? ""}
          onChange={(e) => setSelectedChildId(e.target.value)}
          sx={{ mb: 2, minWidth: 280 }}
        >
          {children.map((c) => (
            <MenuItem key={c.id} value={c.id}>{c.name} — {getClassName(c.class_id)}</MenuItem>
          ))}
        </TextField>
      )}

      <DataTable
        columns={[
          {
            key: "title", label: "Title",
            render: (h) => (
              <Typography variant="body2" fontWeight={500} color="primary.main"
                sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                onClick={() => setViewing(h)}>
                {h.title}
              </Typography>
            ),
          },
          { key: "subject_id", label: "Subject", render: (h) => <Chip label={getSubjectName(h.subject_id)} size="small" variant="outlined" /> },
          { key: "teacher_id", label: "Teacher", render: (h) => getTeacherName(h.teacher_id) },
          {
            key: "due_date", label: "Due Date",
            render: (h) => <Chip label={h.due_date} size="small"
              color={h.due_date < today ? "error" : h.due_date === today ? "warning" : "default"} variant="outlined" />,
          },
          { key: "assigned_date", label: "Assigned" },
        ]}
        rows={hw}
      />

      {/* Homework Detail Modal */}
      <Dialog open={!!viewing} onClose={() => setViewing(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Homework Details</DialogTitle>
        <DialogContent>
          {viewing && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="h6">{viewing.title}</Typography>
              <Divider />
              <Typography variant="body1">{viewing.description}</Typography>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary">Subject</Typography>
                  <Typography variant="body2" fontWeight={500}>{getSubjectName(viewing.subject_id)}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary">Teacher</Typography>
                  <Typography variant="body2" fontWeight={500}>{getTeacherName(viewing.teacher_id)}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary">Due Date</Typography>
                  <Typography variant="body2" fontWeight={500}>{viewing.due_date}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary">Assigned Date</Typography>
                  <Typography variant="body2" fontWeight={500}>{viewing.assigned_date}</Typography>
                </Grid>
              </Grid>
              <Chip
                label={viewing.due_date < today ? "Overdue" : viewing.due_date === today ? "Due Today" : "Upcoming"}
                size="small"
                color={viewing.due_date < today ? "error" : viewing.due_date === today ? "warning" : "success"}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewing(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
