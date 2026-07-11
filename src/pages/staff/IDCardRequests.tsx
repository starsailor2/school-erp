import { useState } from "react";
import { Avatar, Box, Button, Dialog, DialogContent, DialogTitle, Grid, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import StatusChip from "@/components/StatusChip";
import { getStudentRequests, saveStudentRequests, updateStudentRequest } from "@/demo-data/staffOps/studentRequestStore";
import { students } from "@/demo-data";
import { useAuth } from "@/context/AuthContext";

export default function IDCardRequests() {
  const { user } = useAuth();
  const [, setRefresh] = useState(0);
  const [studentId, setStudentId] = useState("");
  const [reason, setReason] = useState("");
  const [previewId, setPreviewId] = useState<string | null>(null);

  const rows = getStudentRequests()
    .filter((r) => r.request_type === "duplicate_id_card")
    .map((r) => {
      const student = students.find((s) => s.id === r.student_id);
      return { ...r, studentName: student?.name ?? "-" };
    });

  const markInProgress = (id: string) => {
    updateStudentRequest(id, user.id, "id-card:processing", (r) => ({
      ...r,
      status: "in_progress",
      assigned_to: user.id,
    }));
    setRefresh((v) => v + 1);
  };

  const createRequest = () => {
    if (!studentId) return;
    const today = new Date().toISOString().split("T")[0];
    const newRow = {
      id: `sr-${Date.now()}`,
      student_id: studentId,
      request_type: "duplicate_id_card" as const,
      status: "pending" as const,
      requested_date: today,
      assigned_to: user.id,
      note: reason.trim() || undefined,
      updated_date: today,
      history: [
        {
          date: today,
          by: user.id,
          action: "id-card:requested",
          to_status: "pending" as const,
          note: reason.trim() || undefined,
        },
      ],
    };
    saveStudentRequests([newRow, ...getStudentRequests()]);
    setStudentId("");
    setReason("");
    setRefresh((v) => v + 1);
  };

  return (
    <>
      <PageHeader
        title="ID Card Requests"
        breadcrumbs={[{ label: "Dashboard", to: "/staff" }, { label: "ID Card Requests" }]}
      />

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>Create ID Card Request</Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField fullWidth size="small" select label="Student" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
              {students.map((s) => (
                <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth size="small" label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Lost ID card" />
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <Button fullWidth size="small" variant="contained" onClick={createRequest}>Add</Button>
          </Grid>
        </Grid>
      </Paper>

      <DataTable
        rows={rows}
        columns={[
          { key: "studentName", label: "Student" },
          { key: "requested_date", label: "Requested On" },
          {
            key: "status",
            label: "Status",
            render: (r) => <StatusChip status={r.status} />,
          },
          {
            key: "actions",
            label: "Actions",
            render: (r) => (
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="outlined" onClick={() => setPreviewId(r.id)}>Preview</Button>
                <Button size="small" variant="outlined" disabled={r.status !== "pending"} onClick={() => markInProgress(r.id)}>
                  Start Processing
                </Button>
              </Stack>
            ),
          },
        ]}
      />

      <Dialog open={!!previewId} onClose={() => setPreviewId(null)} maxWidth="sm" fullWidth>
        <DialogTitle>ID Card Preview</DialogTitle>
        <DialogContent>
          {(() => {
            const req = rows.find((r) => r.id === previewId);
            const student = students.find((s) => s.id === req?.student_id);
            if (!req || !student) return <Typography variant="body2">Request not found.</Typography>;
            return (
              <Paper variant="outlined" sx={{ p: 2, maxWidth: 340 }}>
                <Typography variant="caption" color="text.secondary">KALNET SCHOOL ID CARD</Typography>
                <Stack direction="row" spacing={1.5} sx={{ mt: 1, alignItems: "center" }}>
                  <Avatar sx={{ width: 52, height: 52 }}>{student.name.charAt(0)}</Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={700}>{student.name}</Typography>
                    <Typography variant="caption">Admission: {student.admission_number}</Typography>
                    <Typography variant="caption" sx={{ display: "block" }}>Status: {req.status}</Typography>
                  </Box>
                </Stack>
              </Paper>
            );
          })()}
        </DialogContent>
      </Dialog>
    </>
  );
}
