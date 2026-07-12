import { useState } from "react";
import {
  MenuItem, TextField, Grid, Chip, Avatar, Box, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, Typography, Stack, Divider,
  LinearProgress,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import StatusChip from "@/components/StatusChip";
import { useAuth } from "@/context/AuthContext";
import {
  teachers, getTeacherClasses, students, getClassName, marks, attendanceRecords,
  getSubjectName, parents,
} from "@/demo-data";
import type { Student } from "@/types";

export default function MyStudents() {
  const { user } = useAuth();
  const teacher = teachers.find((t) => t.id === user?.id);
  const allocations = teacher ? getTeacherClasses(teacher.id) : [];
  const classIds = [...new Set(allocations.map((a) => a.class_id))];
  const [classFilter, setClassFilter] = useState(classIds[0] ?? "");
  const [search, setSearch] = useState("");
  const [viewStudent, setViewStudent] = useState<Student | null>(null);

  const filtered = students
    .filter((s) => s.class_id === classFilter)
    .filter((s) => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.admission_number.toLowerCase().includes(search.toLowerCase()));

  const getStudentDetails = (s: Student) => {
    const studentMarks = marks.filter((m) => m.student_id === s.id);
    const attendance = attendanceRecords.filter((a) => a.student_id === s.id);
    const present = attendance.filter((a) => a.status === "present").length;
    const parent = parents.find((p) => p.id === s.parent_id);
    const avgMarks = studentMarks.length > 0 ? Math.round(studentMarks.reduce((sum, m) => sum + m.marks_obtained, 0) / studentMarks.length) : 0;
    return { studentMarks, attendance, present, parent, avgMarks };
  };

  return (
    <>
      <PageHeader
        title="My Students"
        breadcrumbs={[{ label: "Dashboard", to: "/teacher" }, { label: "My Students" }]}
      />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select size="small" label="Class" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
            {classIds.map((cid) => <MenuItem key={cid} value={cid}>{getClassName(cid)}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth size="small" label="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </Grid>
      </Grid>
      <DataTable
        columns={[
          {
            key: "name", label: "Student",
            render: (s) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>{s.name.charAt(0)}</Avatar>
                {s.name}
              </Box>
            ),
          },
          { key: "roll_number", label: "Roll No." },
          { key: "admission_number", label: "Adm. No." },
          { key: "attendance_pct", label: "Attendance", render: (s) => <Chip label={`${s.attendance_pct}%`} size="small" color={s.attendance_pct >= 85 ? "success" : "warning"} /> },
          { key: "fee_status", label: "Fees", render: (s) => <StatusChip status={s.fee_status} /> },
          {
            key: "id", label: "Actions",
            render: (s) => <Button size="small" startIcon={<VisibilityIcon />} onClick={() => setViewStudent(s)}>View</Button>,
          },
        ]}
        rows={filtered}
      />

      {/* Student Detail Modal */}
      <Dialog open={!!viewStudent} onClose={() => setViewStudent(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Student Profile</DialogTitle>
        <DialogContent>
          {viewStudent && (() => {
            const { studentMarks, attendance, present, parent, avgMarks } = getStudentDetails(viewStudent);
            return (
              <Stack spacing={2} sx={{ mt: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar sx={{ width: 56, height: 56, fontSize: 22, bgcolor: "primary.main" }}>{viewStudent.name.charAt(0)}</Avatar>
                  <Box>
                    <Typography variant="h6">{viewStudent.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{viewStudent.admission_number} | Roll #{viewStudent.roll_number}</Typography>
                  </Box>
                </Box>
                <Divider />
                <Grid container spacing={2}>
                  <Grid size={6}><Typography variant="caption" color="text.secondary">Class</Typography><Typography>{getClassName(viewStudent.class_id)}</Typography></Grid>
                  <Grid size={6}><Typography variant="caption" color="text.secondary">Gender</Typography><Typography sx={{ textTransform: "capitalize" }}>{viewStudent.gender}</Typography></Grid>
                  <Grid size={6}><Typography variant="caption" color="text.secondary">DOB</Typography><Typography>{viewStudent.date_of_birth}</Typography></Grid>
                  <Grid size={6}><Typography variant="caption" color="text.secondary">Blood Group</Typography><Typography>{viewStudent.blood_group}</Typography></Grid>
                  <Grid size={6}><Typography variant="caption" color="text.secondary">Phone</Typography><Typography>{viewStudent.phone}</Typography></Grid>
                  <Grid size={6}><Typography variant="caption" color="text.secondary">Email</Typography><Typography variant="body2">{viewStudent.email}</Typography></Grid>
                </Grid>
                <Divider />
                <Typography variant="subtitle2">Attendance</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <LinearProgress variant="determinate" value={attendance.length > 0 ? (present / attendance.length) * 100 : 0} sx={{ flex: 1, height: 8, borderRadius: 4 }} />
                  <Typography variant="body2">{attendance.length > 0 ? Math.round((present / attendance.length) * 100) : 0}%</Typography>
                </Box>
                <Typography variant="subtitle2">Academic Performance</Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Chip label={`Avg: ${avgMarks}/100`} size="small" color={avgMarks >= 80 ? "success" : avgMarks >= 50 ? "warning" : "error"} />
                  {studentMarks.slice(0, 5).map((m) => (
                    <Chip key={m.id} label={`${getSubjectName(m.subject_id)}: ${m.marks_obtained}`} size="small" variant="outlined" />
                  ))}
                </Box>
                {parent && (
                  <>
                    <Divider />
                    <Typography variant="subtitle2">Parent/Guardian</Typography>
                    <Grid container spacing={2}>
                      <Grid size={6}><Typography variant="caption" color="text.secondary">Name</Typography><Typography>{parent.name}</Typography></Grid>
                      <Grid size={6}><Typography variant="caption" color="text.secondary">Phone</Typography><Typography>{parent.phone}</Typography></Grid>
                    </Grid>
                  </>
                )}
              </Stack>
            );
          })()}
        </DialogContent>
        <DialogActions><Button onClick={() => setViewStudent(null)}>Close</Button></DialogActions>
      </Dialog>
    </>
  );
}
