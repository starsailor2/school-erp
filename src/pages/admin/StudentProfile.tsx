import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Paper, Typography, Grid, Box, Avatar, Chip, Stack, Divider, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import {
  students, parents, getClassName, getStudentAttendance, getStudentMarks,
  getStudentFees, getSubjectName, routes, classes,
} from "@/demo-data";

export default function StudentProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const student = students.find((s) => s.id === id);
  const [editOpen, setEditOpen] = useState(false);
  const [transportOpen, setTransportOpen] = useState(false);

  if (!student) return <Typography>Student not found</Typography>;

  const parent = parents.find((p) => p.id === student.parent_id);
  const attendance = getStudentAttendance(student.id).slice(0, 7);
  const marksData = getStudentMarks(student.id);
  const feesData = getStudentFees(student.id);

  return (
    <>
      <PageHeader
        title="Student Profile"
        breadcrumbs={[
          { label: "Dashboard", to: "/admin" },
          { label: "Students", to: "/admin/students" },
          { label: student.name },
        ]}
        action={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<EditIcon />} size="small" onClick={() => setEditOpen(true)}>Edit Student</Button>
            <Button variant="outlined" startIcon={<DirectionsBusIcon />} size="small" onClick={() => setTransportOpen(true)}>Assign Transport</Button>
            <Button variant="outlined" size="small" onClick={() => navigate("/admin/students")}>Back to Directory</Button>
          </Stack>
        }
      />

      <Grid container spacing={2}>
        {/* Basic Info */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 2 }}>
              <Avatar sx={{ width: 72, height: 72, fontSize: 28, bgcolor: "primary.main", mb: 1 }}>
                {student.name.charAt(0)}
              </Avatar>
              <Typography variant="h6">{student.name}</Typography>
              <Typography variant="body2" color="text.secondary">{student.admission_number}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={1.5}>
              <InfoRow label="Class" value={getClassName(student.class_id)} />
              <InfoRow label="Roll No." value={student.roll_number} />
              <InfoRow label="Gender" value={student.gender} />
              <InfoRow label="Date of Birth" value={student.date_of_birth} />
              <InfoRow label="Attendance" value={`${student.attendance_pct}%`} />
              <InfoRow label="Fee Status" value={<Chip label={student.fee_status} size="small" color={student.fee_status === "paid" ? "success" : student.fee_status === "pending" ? "warning" : "error"} />} />
            </Stack>
          </Paper>
        </Grid>

        {/* Parent Info + Attendance + Marks */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>
            {parent && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>Parent Information</Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}><InfoRow label="Name" value={parent.name} /></Grid>
                  <Grid size={{ xs: 6 }}><InfoRow label="Phone" value={parent.phone} /></Grid>
                  <Grid size={{ xs: 6 }}><InfoRow label="Occupation" value={parent.occupation} /></Grid>
                  <Grid size={{ xs: 6 }}><InfoRow label="Address" value={parent.address} /></Grid>
                </Grid>
              </Paper>
            )}

            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>Recent Attendance</Typography>
              <DataTable
                columns={[
                  { key: "date", label: "Date" },
                  {
                    key: "status", label: "Status",
                    render: (a) => <Chip label={a.status} size="small" color={a.status === "present" ? "success" : a.status === "absent" ? "error" : "warning"} />,
                  },
                ]}
                rows={attendance}
              />
            </Paper>

            {marksData.length > 0 && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>Exam Marks (Unit Test 1)</Typography>
                <DataTable
                  columns={[
                    { key: "subject_id", label: "Subject", render: (m) => getSubjectName(m.subject_id) },
                    { key: "marks_obtained", label: "Marks", render: (m) => `${m.marks_obtained}/${m.max_marks}` },
                    {
                      key: "grade", label: "Grade",
                      render: (m) => <Chip label={m.grade} size="small" color={m.marks_obtained >= 80 ? "success" : m.marks_obtained >= 50 ? "warning" : "error"} />,
                    },
                  ]}
                  rows={marksData}
                />
              </Paper>
            )}

            {feesData.length > 0 && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>Fee Details</Typography>
                <DataTable
                  columns={[
                    { key: "fee_type", label: "Type", render: (f) => f.fee_type.charAt(0).toUpperCase() + f.fee_type.slice(1) },
                    { key: "amount", label: "Amount", render: (f) => `₹${f.amount.toLocaleString()}` },
                    { key: "due_date", label: "Due Date" },
                    {
                      key: "status", label: "Status",
                      render: (f) => <Chip label={f.status} size="small" color={f.status === "paid" ? "success" : f.status === "pending" ? "warning" : "error"} />,
                    },
                    { key: "paid_date", label: "Paid Date", render: (f) => f.paid_date ?? "—" },
                  ]}
                  rows={feesData}
                />
              </Paper>
            )}
          </Stack>
        </Grid>
      </Grid>

      {/* Edit Student Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Student</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" defaultValue={student.name} fullWidth size="small" />
            <TextField select label="Class" defaultValue={student.class_id} fullWidth size="small">
              {classes.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </TextField>
            <TextField label="Date of Birth" defaultValue={student.date_of_birth} fullWidth size="small" type="date" slotProps={{ inputLabel: { shrink: true } }} />
            <TextField select label="Gender" defaultValue={student.gender} fullWidth size="small">
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setEditOpen(false)}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Assign Transport Dialog */}
      <Dialog open={transportOpen} onClose={() => setTransportOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Transport</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField select label="Route" defaultValue="" fullWidth size="small">
              {routes.map((r) => <MenuItem key={r.id} value={r.id}>{r.name} ({r.vehicle_number})</MenuItem>)}
            </TextField>
            <TextField label="Pickup Point" fullWidth size="small" />
            <TextField label="Pickup Time" fullWidth size="small" type="time" slotProps={{ inputLabel: { shrink: true } }} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransportOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setTransportOpen(false)}>Assign</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={500}>{value}</Typography>
    </Box>
  );
}
