import { useEffect, useState } from "react";
import { Paper, Typography, Stack, Box, Button, Grid, TextField, MenuItem, Dialog, DialogTitle, DialogContent } from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import StatusChip from "@/components/StatusChip";
import { getStudentRequests, updateStudentRequest } from "@/demo-data/staffOps/studentRequestStore";
import { students } from "@/demo-data";
import { useAuth } from "@/context/AuthContext";
import type { StudentRequestStatus } from "@/types";

export default function StudentRequests() {
  const { user } = useAuth();
  const [, setRefresh] = useState(0);
  const [statusFilter, setStatusFilter] = useState<"all" | StudentRequestStatus>("all");
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [timelineId, setTimelineId] = useState<string | null>(null);

  const requests = getStudentRequests()
    .map((r) => ({
      ...r,
      studentName: students.find((s) => s.id === r.student_id)?.name ?? "-",
      type: r.request_type.replace(/_/g, " "),
      date: r.requested_date,
    }))
    .filter((r) => statusFilter === "all" || r.status === statusFilter);

  useEffect(() => {
    const onUpdate = () => setRefresh((v) => v + 1);
    window.addEventListener("erp-student-requests-updated", onUpdate);
    return () => window.removeEventListener("erp-student-requests-updated", onUpdate);
  }, []);

  const setStatus = (id: string, status: StudentRequestStatus) => {
    updateStudentRequest(id, user.id, `status:${status}`, (r) => {
      const today = new Date().toISOString().split("T")[0];
      return {
        ...r,
        status,
        assigned_to: status === "in_progress" ? user.id : r.assigned_to,
        closed_date: status === "completed" || status === "rejected" ? today : undefined,
      };
    });
  };

  const saveNote = (id: string) => {
    updateStudentRequest(id, user.id, "note:update", (r) => {
      return {
        ...r,
        note: noteDraft.trim(),
      };
    });
    setActiveNoteId(null);
    setNoteDraft("");
  };

  return (
    <>
      <PageHeader
        title="Student Requests"
        breadcrumbs={[{ label: "Dashboard", to: "/staff" }, { label: "Students", to: "/staff/students" }, { label: "Requests" }]}
      />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth
            size="small"
            select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | StudentRequestStatus)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </TextField>
        </Grid>
      </Grid>
      <Paper sx={{ p: 2 }}>
        <Stack spacing={2}>
          {requests.map((r) => (
            <Box key={r.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight={500}>{r.studentName}</Typography>
                <Typography variant="caption" color="text.secondary">{r.type} — Requested: {r.date}</Typography>
                {r.updated_date && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    Last Updated: {r.updated_date}
                  </Typography>
                )}
                {r.note && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    Note: {r.note}
                  </Typography>
                )}
                {r.history && r.history.length > 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                    Timeline: {r.history.slice(-2).map((h) => `${h.date} by ${h.by} (${h.action})`).join(" | ")}
                  </Typography>
                )}
                {activeNoteId === r.id && (
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <TextField size="small" fullWidth value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} placeholder="Add request note" />
                    <Button size="small" variant="outlined" onClick={() => saveNote(r.id)}>Save</Button>
                  </Stack>
                )}
              </Box>
              <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                <StatusChip status={r.status} />
                <Button size="small" variant="outlined" disabled={r.status !== "pending"} onClick={() => setStatus(r.id, "in_progress")}>
                  Start
                </Button>
                <Button size="small" variant="outlined" disabled={r.status === "completed" || r.status === "rejected"} onClick={() => setStatus(r.id, "completed")}>
                  Complete
                </Button>
                <Button size="small" variant="outlined" color="error" disabled={r.status === "completed" || r.status === "rejected"} onClick={() => setStatus(r.id, "rejected")}>
                  Reject
                </Button>
                <Button size="small" variant="outlined" onClick={() => { setActiveNoteId(r.id); setNoteDraft(r.note ?? ""); }}>
                  Note
                </Button>
                <Button size="small" variant="outlined" onClick={() => setTimelineId(r.id)}>
                  Timeline
                </Button>
              </Box>
            </Box>
          ))}
        </Stack>
      </Paper>

      <Dialog open={!!timelineId} onClose={() => setTimelineId(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Request Timeline</DialogTitle>
        <DialogContent>
          <Stack spacing={1} sx={{ mt: 1 }}>
            {getStudentRequests()
              .find((r) => r.id === timelineId)
              ?.history?.map((entry, idx) => (
                <Paper key={`${entry.date}-${idx}`} variant="outlined" sx={{ p: 1.25 }}>
                  <Typography variant="body2" fontWeight={600}>{entry.action}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {entry.date} | by {entry.by} | {entry.from_status ?? "-"} {" -> "} {entry.to_status ?? "-"}
                  </Typography>
                  {entry.note && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                      Note: {entry.note}
                    </Typography>
                  )}
                </Paper>
              ))}
            {!getStudentRequests().find((r) => r.id === timelineId)?.history?.length && (
              <Typography variant="body2" color="text.secondary">No timeline entries yet.</Typography>
            )}
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
