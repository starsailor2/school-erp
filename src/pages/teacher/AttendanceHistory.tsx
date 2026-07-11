import { useState } from "react";
import {
  MenuItem, TextField, Grid, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, Typography, Box, Stack, Avatar,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { useAuth } from "@/context/AuthContext";
import { teachers, getTeacherClasses, students, attendanceRecords, getClassName } from "@/demo-data";
import type { Student } from "@/types";

export default function AttendanceHistory() {
  const { user } = useAuth();
  const teacher = teachers.find((t) => t.id === user?.id);
  const allocations = teacher ? getTeacherClasses(teacher.id) : [];
  const classIds = [...new Set(allocations.map((a) => a.class_id))];
  const [classFilter, setClassFilter] = useState(classIds[0] ?? "");
  const [statusFilter, setStatusFilter] = useState("");
  const [viewStudent, setViewStudent] = useState<Student | null>(null);

  const classStudents = students.filter((s) => s.class_id === classFilter);
  const rows = classStudents.map((s) => {
    const records = attendanceRecords.filter((a) => a.student_id === s.id);
    const present = records.filter((a) => a.status === "present").length;
    const absent = records.filter((a) => a.status === "absent").length;
    const late = records.filter((a) => a.status === "late").length;
    return {
      ...s, totalDays: records.length, presentDays: present, absentDays: absent, lateDays: late,
      pct: records.length > 0 ? Math.round((present / records.length) * 100) : 0,
    };
  });

  const filtered = statusFilter === "low" ? rows.filter((r) => r.pct < 75)
    : statusFilter === "medium" ? rows.filter((r) => r.pct >= 75 && r.pct < 85)
    : statusFilter === "good" ? rows.filter((r) => r.pct >= 85)
    : rows;

  const getStudentRecords = (s: Student) =>
    attendanceRecords.filter((a) => a.student_id === s.id).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <PageHeader
        title="Attendance History"
        breadcrumbs={[{ label: "Dashboard", to: "/teacher" }, { label: "Attendance", to: "/teacher/attendance" }, { label: "History" }]}
      />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select size="small" label="Class" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
            {classIds.map((cid) => <MenuItem key={cid} value={cid}>{getClassName(cid)}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select size="small" label="Attendance Level" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="">All Students</MenuItem>
            <MenuItem value="good">Good (≥85%)</MenuItem>
            <MenuItem value="medium">Average (75-85%)</MenuItem>
            <MenuItem value="low">Low (&lt;75%)</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Box sx={{ display: "flex", gap: 1, height: "100%", alignItems: "center" }}>
            <Chip label={`Total: ${filtered.length}`} size="small" variant="outlined" />
            <Chip label={`Low: ${rows.filter((r) => r.pct < 75).length}`} size="small" color="error" />
          </Box>
        </Grid>
      </Grid>
      <DataTable
        columns={[
          {
            key: "name", label: "Student",
            render: (r) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>{r.name.charAt(0)}</Avatar>
                {r.name}
              </Box>
            ),
          },
          { key: "roll_number", label: "Roll No." },
          { key: "totalDays", label: "Total" },
          { key: "presentDays", label: "Present" },
          { key: "absentDays", label: "Absent" },
          { key: "lateDays", label: "Late" },
          { key: "pct", label: "Percentage", render: (r) => <Chip label={`${r.pct}%`} size="small" color={r.pct >= 85 ? "success" : r.pct >= 75 ? "warning" : "error"} /> },
          {
            key: "id", label: "Details",
            render: (r) => <Button size="small" startIcon={<VisibilityIcon />} onClick={() => setViewStudent(r)}>View</Button>,
          },
        ]}
        rows={filtered}
      />

      {/* Student Attendance Detail Modal */}
      <Dialog open={!!viewStudent} onClose={() => setViewStudent(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Attendance Details — {viewStudent?.name}</DialogTitle>
        <DialogContent>
          {viewStudent && (() => {
            const records = getStudentRecords(viewStudent);
            return (
              <Stack spacing={1} sx={{ mt: 1 }}>
                {records.map((r) => (
                  <Box key={r.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body2">{r.date}</Typography>
                    <Chip label={r.status} size="small"
                      color={r.status === "present" ? "success" : r.status === "absent" ? "error" : "warning"} />
                  </Box>
                ))}
                {records.length === 0 && <Typography color="text.secondary">No records found</Typography>}
              </Stack>
            );
          })()}
        </DialogContent>
        <DialogActions><Button onClick={() => setViewStudent(null)}>Close</Button></DialogActions>
      </Dialog>
    </>
  );
}
