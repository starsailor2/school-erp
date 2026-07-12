import { useState } from "react";
import {
  Paper, Table, TableHead, TableBody, TableRow, TableCell, Chip, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Box,
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { students, homework as allHomework, getSubjectName, teachers } from "@/demo-data";
import type { Homework } from "@/types";

export default function StudentHomework() {
  const { user } = useAuth();
  const student = students.find((s) => s.id === user?.id);
  const hw = allHomework.filter((h) => h.class_id === student?.class_id);
  const [viewing, setViewing] = useState<Homework | null>(null);
  const storageKey = `erp_student_hw_submissions_${user?.id ?? "unknown"}`;
  const [submittedIds, setSubmittedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
    } catch {
      return [];
    }
  });

  const getDaysLeft = (due: string) => Math.ceil((new Date(due).getTime() - Date.now()) / 86400000);

  const markSubmitted = (homeworkId: string) => {
    if (submittedIds.includes(homeworkId)) return;
    const next = [...submittedIds, homeworkId];
    setSubmittedIds(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  return (
    <>
      <PageHeader title="My Homework" breadcrumbs={[{ label: "Dashboard", to: "/student" }, { label: "Homework" }]} />
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Subject</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Assigned</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {hw.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Box sx={{ py: 4 }}>
                    <AssignmentIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                    <Typography color="text.secondary">No homework assigned yet</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              hw.map((h) => {
                const daysLeft = getDaysLeft(h.due_date);
                const overdue = daysLeft < 0;
                const submitted = submittedIds.includes(h.id);
                return (
                  <TableRow
                    key={h.id}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => setViewing(h)}
                  >
                    <TableCell>
                      <Chip label={getSubjectName(h.subject_id)} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500} color="primary.main" sx={{ "&:hover": { textDecoration: "underline" } }}>
                        {h.title}
                      </Typography>
                    </TableCell>
                    <TableCell>{h.assigned_date}</TableCell>
                    <TableCell>{h.due_date}</TableCell>
                    <TableCell>
                      <Chip
                        label={submitted ? "Submitted" : overdue ? "Overdue" : daysLeft === 0 ? "Due Today" : daysLeft === 1 ? "Due Tomorrow" : `${daysLeft} days left`}
                        size="small"
                        color={submitted ? "success" : overdue ? "error" : daysLeft <= 1 ? "warning" : "success"}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Homework Detail Modal */}
      <Dialog open={!!viewing} onClose={() => setViewing(null)} maxWidth="sm" fullWidth>
        {viewing && (
          <>
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AssignmentIcon color="primary" /> {viewing.title}
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip label={getSubjectName(viewing.subject_id)} color="primary" size="small" />
                  <Chip label={`Assigned: ${viewing.assigned_date}`} size="small" variant="outlined" />
                  <Chip
                    label={`Due: ${viewing.due_date}`}
                    size="small"
                    color={getDaysLeft(viewing.due_date) < 0 ? "error" : getDaysLeft(viewing.due_date) <= 1 ? "warning" : "success"}
                  />
                </Stack>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Assigned By</Typography>
                  <Typography variant="body2">
                    {teachers.find((t) => t.id === viewing.teacher_id)?.name ?? "Teacher"}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Instructions</Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: "action.hover" }}>
                    <Typography variant="body2">{viewing.description}</Typography>
                  </Paper>
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button
                variant="contained"
                onClick={() => viewing && markSubmitted(viewing.id)}
                disabled={!viewing || submittedIds.includes(viewing.id)}
              >
                {viewing && submittedIds.includes(viewing.id) ? "Submitted" : "Mark as Submitted"}
              </Button>
              <Button onClick={() => setViewing(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}
