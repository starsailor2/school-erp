import { useState } from "react";
import {
  Grid, Typography, Stack, Box, Chip, Button, MenuItem, TextField,
  Avatar, Dialog, DialogTitle, DialogContent, DialogActions, Divider,
  LinearProgress,
} from "@mui/material";
import { KpiCard } from "@/components/KpiCard";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import StatusChip from "@/components/StatusChip";
import { useAuth } from "@/context/AuthContext";
import {
  teachers, students, getClassTeacherSections, marks, attendanceRecords,
  getSubjectName, parents,
} from "@/demo-data";
import PeopleIcon from "@mui/icons-material/People";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import VisibilityIcon from "@mui/icons-material/Visibility";
import type { Student } from "@/types";

export default function ClassManagement() {
  const { user } = useAuth();
  const teacher = teachers.find((t) => t.id === user?.id);
  const ctSections = teacher ? getClassTeacherSections(teacher.id) : [];
  const [sectionFilter, setSectionFilter] = useState(ctSections[0]?.id ?? "");
  const [viewStudent, setViewStudent] = useState<Student | null>(null);

  const selectedSection = ctSections.find((s) => s.id === sectionFilter);
  const classStudents = students.filter((s) => s.section_id === sectionFilter);
  const avgAtt = classStudents.length > 0 ? Math.round(classStudents.reduce((s, st) => s + st.attendance_pct, 0) / classStudents.length) : 0;
  const feesPaid = classStudents.filter((s) => s.fee_status === "paid").length;

  const studentRows = classStudents.map((s) => {
    const studentMarks = marks.filter((m) => m.student_id === s.id);
    const total = studentMarks.reduce((sum, m) => sum + m.marks_obtained, 0);
    const avg = studentMarks.length > 0 ? Math.round(total / studentMarks.length) : 0;
    return { ...s, totalMarks: total, avgMarks: avg };
  }).sort((a, b) => b.totalMarks - a.totalMarks);

  return (
    <>
      <PageHeader
        title={`Class Management — ${selectedSection ? `${selectedSection.className} ${selectedSection.name}` : ""}`}
        breadcrumbs={[{ label: "Dashboard", to: "/teacher" }, { label: "Class Management" }]}
      />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select size="small" label="Select Section" value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)}>
            {ctSections.map((s) => <MenuItem key={s.id} value={s.id}>{s.className} — {s.name}</MenuItem>)}
          </TextField>
        </Grid>
      </Grid>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}><KpiCard title="Students" value={classStudents.length} icon={<PeopleIcon />} color="#6366f1" /></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><KpiCard title="Avg Attendance" value={`${avgAtt}%`} icon={<TrendingUpIcon />} color="#10b981" /></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><KpiCard title="Fees Paid" value={`${feesPaid}/${classStudents.length}`} icon={<PeopleIcon />} color="#f59e0b" /></Grid>
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
          { key: "attendance_pct", label: "Attendance", render: (s) => <Chip label={`${s.attendance_pct}%`} size="small" color={s.attendance_pct >= 85 ? "success" : "warning"} /> },
          { key: "avgMarks", label: "Avg Marks", render: (s) => <Chip label={s.avgMarks} size="small" color={s.avgMarks >= 80 ? "success" : s.avgMarks >= 50 ? "warning" : "error"} /> },
          { key: "fee_status", label: "Fees", render: (s) => <StatusChip status={s.fee_status} /> },
          {
            key: "id", label: "Actions",
            render: (s) => <Button size="small" startIcon={<VisibilityIcon />} onClick={() => setViewStudent(s)}>View</Button>,
          },
        ]}
        rows={studentRows}
      />

      <Dialog open={!!viewStudent} onClose={() => setViewStudent(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Student Details</DialogTitle>
        <DialogContent>
          {viewStudent && (() => {
            const studentMarks = marks.filter((m) => m.student_id === viewStudent.id);
            const att = attendanceRecords.filter((a) => a.student_id === viewStudent.id);
            const present = att.filter((a) => a.status === "present").length;
            const parent = parents.find((p) => p.id === viewStudent.parent_id);
            return (
              <Stack spacing={2} sx={{ mt: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar sx={{ width: 48, height: 48, bgcolor: "primary.main" }}>{viewStudent.name.charAt(0)}</Avatar>
                  <Box>
                    <Typography variant="h6">{viewStudent.name}</Typography>
                    <Typography variant="body2" color="text.secondary">Roll #{viewStudent.roll_number} | {viewStudent.admission_number}</Typography>
                  </Box>
                </Box>
                <Divider />
                <Typography variant="subtitle2">Attendance</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <LinearProgress variant="determinate" value={att.length > 0 ? (present / att.length) * 100 : 0} sx={{ flex: 1, height: 8, borderRadius: 4 }} />
                  <Typography variant="body2">{att.length > 0 ? Math.round((present / att.length) * 100) : 0}%</Typography>
                </Box>
                <Typography variant="subtitle2">Marks</Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {studentMarks.map((m) => (
                    <Chip key={m.id} label={`${getSubjectName(m.subject_id)}: ${m.marks_obtained}/${m.max_marks}`} size="small" variant="outlined" />
                  ))}
                  {studentMarks.length === 0 && <Typography variant="body2" color="text.secondary">No marks recorded</Typography>}
                </Box>
                {parent && (
                  <>
                    <Divider />
                    <Typography variant="subtitle2">Parent: {parent.name}</Typography>
                    <Typography variant="body2" color="text.secondary">Phone: {parent.phone} | {parent.occupation}</Typography>
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
