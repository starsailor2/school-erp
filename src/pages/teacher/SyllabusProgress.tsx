import { useState } from "react";
import {
  Grid, Paper, Typography, Box, LinearProgress, Chip, MenuItem, TextField,
  Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions, Slider,
  Snackbar, Alert,
} from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import {
  teachers, subjects, getClassName, getSubjectName,
} from "@/data/mock";

interface SyllabusEntry {
  id: string;
  subjectId: string;
  classId: string;
  chaptersTotal: number;
  chaptersCompleted: number;
  lastUpdated: string;
}

const initialProgress: SyllabusEntry[] = [
  { id: "sp1", subjectId: "sub1", classId: "c1", chaptersTotal: 15, chaptersCompleted: 11, lastUpdated: "2026-03-14" },
  { id: "sp2", subjectId: "sub2", classId: "c1", chaptersTotal: 12, chaptersCompleted: 7, lastUpdated: "2026-03-12" },
  { id: "sp3", subjectId: "sub3", classId: "c2", chaptersTotal: 14, chaptersCompleted: 9, lastUpdated: "2026-03-13" },
  { id: "sp4", subjectId: "sub4", classId: "c2", chaptersTotal: 10, chaptersCompleted: 8, lastUpdated: "2026-03-11" },
  { id: "sp5", subjectId: "sub1", classId: "c4", chaptersTotal: 18, chaptersCompleted: 12, lastUpdated: "2026-03-10" },
  { id: "sp6", subjectId: "sub9", classId: "c5", chaptersTotal: 10, chaptersCompleted: 6, lastUpdated: "2026-03-09" },
  { id: "sp7", subjectId: "sub5", classId: "c3", chaptersTotal: 16, chaptersCompleted: 13, lastUpdated: "2026-03-08" },
  { id: "sp8", subjectId: "sub2", classId: "c4", chaptersTotal: 14, chaptersCompleted: 5, lastUpdated: "2026-03-07" },
];

export default function SyllabusProgress() {
  const { user } = useAuth();
  const teacher = teachers.find((t) => t.id === user?.id);
  const department = teacher?.department ?? "";
  const deptSubjects = subjects.filter((s) => s.department === department);
  const deptSubjectIds = deptSubjects.map((s) => s.id);

  const [entries, setEntries] = useState(
    initialProgress.filter((e) => deptSubjectIds.includes(e.subjectId))
  );
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<SyllabusEntry | null>(null);
  const [editValue, setEditValue] = useState(0);
  const [classFilter, setClassFilter] = useState("");
  const [snack, setSnack] = useState(false);

  const classIds = [...new Set(entries.map((e) => e.classId))];
  const filtered = classFilter ? entries.filter((e) => e.classId === classFilter) : entries;

  const openEdit = (entry: SyllabusEntry) => {
    setEditing(entry);
    setEditValue(entry.chaptersCompleted);
    setEditOpen(true);
  };

  const handleSave = () => {
    if (!editing) return;
    setEntries((prev) =>
      prev.map((e) =>
        e.id === editing.id
          ? { ...e, chaptersCompleted: editValue, lastUpdated: new Date().toISOString().split("T")[0] }
          : e
      )
    );
    setEditOpen(false);
    setSnack(true);
  };

  const totalChapters = filtered.reduce((s, e) => s + e.chaptersTotal, 0);
  const completedChapters = filtered.reduce((s, e) => s + e.chaptersCompleted, 0);
  const overallPct = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

  return (
    <>
      <PageHeader
        title="Syllabus Progress"
        breadcrumbs={[
          { label: "Dashboard", to: "/teacher" },
          { label: "Department", to: "/teacher/department" },
          { label: "Syllabus Progress" },
        ]}
      />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select size="small" label="Filter by Class" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
            <MenuItem value="">All Classes</MenuItem>
            {classIds.map((cid) => <MenuItem key={cid} value={cid}>{getClassName(cid)}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 8 }}>
          <Paper sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body2" fontWeight={500}>Overall: {overallPct}%</Typography>
            <LinearProgress
              variant="determinate"
              value={overallPct}
              sx={{ flex: 1, height: 10, borderRadius: 5 }}
              color={overallPct >= 70 ? "success" : overallPct >= 50 ? "warning" : "error"}
            />
            <Typography variant="body2" color="text.secondary">
              {completedChapters}/{totalChapters} chapters
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Stack spacing={2}>
        {filtered.map((entry) => {
          const pct = Math.round((entry.chaptersCompleted / entry.chaptersTotal) * 100);
          return (
            <Paper key={entry.id} sx={{ p: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Box>
                  <Typography variant="subtitle2">
                    {getSubjectName(entry.subjectId)} — {getClassName(entry.classId)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Last updated: {entry.lastUpdated}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={`${pct}%`}
                    size="small"
                    color={pct >= 80 ? "success" : pct >= 50 ? "warning" : "error"}
                  />
                  <Button size="small" variant="outlined" onClick={() => openEdit(entry)}>
                    Update
                  </Button>
                </Stack>
              </Box>
              <LinearProgress
                variant="determinate"
                value={pct}
                sx={{ height: 8, borderRadius: 4 }}
                color={pct >= 80 ? "success" : pct >= 50 ? "warning" : "error"}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                {entry.chaptersCompleted} of {entry.chaptersTotal} chapters completed
              </Typography>
            </Paper>
          );
        })}
        {filtered.length === 0 && (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">No syllabus data found for this department</Typography>
          </Paper>
        )}
      </Stack>

      {/* Update Progress Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Update Syllabus Progress</DialogTitle>
        <DialogContent>
          {editing && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                {getSubjectName(editing.subjectId)} — {getClassName(editing.classId)}
              </Typography>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Chapters completed: {editValue} / {editing.chaptersTotal}
              </Typography>
              <Slider
                value={editValue}
                onChange={(_, v) => setEditValue(v as number)}
                min={0}
                max={editing.chaptersTotal}
                step={1}
                marks
                valueLabelDisplay="auto"
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack} autoHideDuration={3000} onClose={() => setSnack(false)}>
        <Alert severity="success" onClose={() => setSnack(false)}>Progress updated!</Alert>
      </Snackbar>
    </>
  );
}
