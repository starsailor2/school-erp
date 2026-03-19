import { useState } from "react";
import { Button, Chip, Dialog, DialogContent, DialogTitle, Grid, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { getStudentRequests, saveStudentRequests, updateStudentRequest } from "@/data/studentRequestStore";
import { students } from "@/data/mock";
import { useAuth } from "@/context/AuthContext";
import type { StudentRequestType } from "@/types";

export default function Certificates() {
  const { user } = useAuth();
  const [, setRefresh] = useState(0);
  const [studentId, setStudentId] = useState("");
  const [requestType, setRequestType] = useState<StudentRequestType>("bonafide_certificate");
  const [note, setNote] = useState("");
  const [previewId, setPreviewId] = useState<string | null>(null);

  const rows = getStudentRequests()
    .filter((r) => r.request_type === "transfer_certificate" || r.request_type === "bonafide_certificate" || r.request_type === "character_certificate")
    .map((r) => {
      const student = students.find((s) => s.id === r.student_id);
      return { ...r, studentName: student?.name ?? "-" };
    });

  const markCompleted = (id: string) => {
    updateStudentRequest(id, user.id, "certificate:generated", (r) => ({
      ...r,
      status: "completed",
      closed_date: new Date().toISOString().split("T")[0],
    }));
    setRefresh((v) => v + 1);
  };

  const createRequest = () => {
    if (!studentId) return;
    const today = new Date().toISOString().split("T")[0];
    const newRow = {
      id: `sr-${Date.now()}`,
      student_id: studentId,
      request_type: requestType,
      status: "pending" as const,
      requested_date: today,
      assigned_to: user.id,
      note: note.trim() || undefined,
      updated_date: today,
      history: [
        {
          date: today,
          by: user.id,
          action: "certificate:requested",
          to_status: "pending" as const,
          note: note.trim() || undefined,
        },
      ],
    };
    saveStudentRequests([newRow, ...getStudentRequests()]);
    setStudentId("");
    setNote("");
    setRefresh((v) => v + 1);
  };

  return (
    <>
      <PageHeader
        title="Certificates"
        breadcrumbs={[{ label: "Dashboard", to: "/staff" }, { label: "Certificates" }]}
      />

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>Generate Certificate Request</Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField fullWidth size="small" select label="Student" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
              {students.map((s) => (
                <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField fullWidth size="small" select label="Certificate Type" value={requestType} onChange={(e) => setRequestType(e.target.value as StudentRequestType)}>
              <MenuItem value="bonafide_certificate">Bonafide Certificate</MenuItem>
              <MenuItem value="transfer_certificate">Transfer Certificate</MenuItem>
              <MenuItem value="character_certificate">Character Certificate</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField fullWidth size="small" label="Note" value={note} onChange={(e) => setNote(e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Button size="small" variant="contained" onClick={createRequest}>Create Request</Button>
          </Grid>
        </Grid>
      </Paper>

      <DataTable
        rows={rows}
        columns={[
          { key: "studentName", label: "Student" },
          { key: "request_type", label: "Type", render: (r) => r.request_type.replace(/_/g, " ") },
          { key: "requested_date", label: "Requested On" },
          {
            key: "status",
            label: "Status",
            render: (r) => <Chip size="small" label={r.status.replace("_", " ")} color={r.status === "completed" ? "success" : r.status === "in_progress" ? "primary" : "default"} />,
          },
          {
            key: "actions",
            label: "Actions",
            render: (r) => (
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="outlined" onClick={() => setPreviewId(r.id)}>Preview</Button>
                <Button size="small" variant="outlined" disabled={r.status === "completed"} onClick={() => markCompleted(r.id)}>
                  Generate
                </Button>
              </Stack>
            ),
          },
        ]}
      />

      <Dialog open={!!previewId} onClose={() => setPreviewId(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Certificate Preview</DialogTitle>
        <DialogContent>
          {(() => {
            const req = rows.find((r) => r.id === previewId);
            if (!req) return <Typography variant="body2">Request not found.</Typography>;
            return (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" align="center">KALNET School</Typography>
                <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 2 }}>
                  {req.request_type.replace(/_/g, " ")}
                </Typography>
                <Typography variant="body2">Student: {req.studentName}</Typography>
                <Typography variant="body2">Request Date: {req.requested_date}</Typography>
                <Typography variant="body2">Status: {req.status}</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  This is a system-generated preview. Final print can be issued after approval.
                </Typography>
              </Paper>
            );
          })()}
        </DialogContent>
      </Dialog>
    </>
  );
}
