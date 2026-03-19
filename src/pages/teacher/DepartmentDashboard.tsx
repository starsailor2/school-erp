import { useState } from "react";
import {
  Grid, Typography, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, Stack, Box, Avatar, Divider,
} from "@mui/material";
import { KpiCard } from "@/components/KpiCard";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { useAuth } from "@/context/AuthContext";
import {
  teachers, subjects, subjectAllocations, getSubjectName, getClassName,
} from "@/data/mock";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import VisibilityIcon from "@mui/icons-material/Visibility";
import type { Teacher } from "@/types";

export default function DepartmentDashboard() {
  const { user } = useAuth();
  const teacher = teachers.find((t) => t.id === user?.id);
  const department = teacher?.department ?? "";
  const deptSubjects = subjects.filter((s) => s.department === department);
  const deptTeachers = teachers.filter((t) => t.department === department);
  const deptAllocations = subjectAllocations.filter((a) =>
    deptSubjects.some((s) => s.id === a.subject_id)
  );

  const [viewTeacher, setViewTeacher] = useState<Teacher | null>(null);

  const teacherAllocs = (t: Teacher) =>
    subjectAllocations.filter((a) => a.teacher_id === t.id);

  return (
    <>
      <PageHeader
        title={`${department} Department`}
        breadcrumbs={[{ label: "Dashboard", to: "/teacher" }, { label: "Department" }]}
      />
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}><KpiCard title="Subjects" value={deptSubjects.length} icon={<SchoolIcon />} color="#6366f1" /></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><KpiCard title="Teachers" value={deptTeachers.length} icon={<PeopleIcon />} color="#10b981" /></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><KpiCard title="Allocations" value={deptAllocations.length} icon={<PeopleIcon />} color="#f59e0b" /></Grid>
      </Grid>

      <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>Department Teachers</Typography>
      <DataTable
        columns={[
          {
            key: "name", label: "Teacher",
            render: (t) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>{t.name.charAt(0)}</Avatar>
                {t.name}
              </Box>
            ),
          },
          { key: "teacher_type", label: "Type", render: (t) => <Chip label={t.teacher_type.replace("_", " ")} size="small" variant="outlined" /> },
          { key: "subjects", label: "Subjects", render: (t) => t.subjects.map(getSubjectName).join(", ") },
          { key: "designation", label: "Designation" },
          {
            key: "id", label: "Actions",
            render: (t) => <Button size="small" startIcon={<VisibilityIcon />} onClick={() => setViewTeacher(t)}>View</Button>,
          },
        ]}
        rows={deptTeachers}
      />

      <Typography variant="h6" fontWeight={600} sx={{ mb: 1, mt: 3 }}>Subject Allocations</Typography>
      <DataTable
        columns={[
          { key: "subject_id", label: "Subject", render: (a) => getSubjectName(a.subject_id) },
          { key: "teacher_id", label: "Teacher", render: (a) => teachers.find((t) => t.id === a.teacher_id)?.name ?? a.teacher_id },
          { key: "class_id", label: "Class", render: (a) => getClassName(a.class_id) },
          { key: "section_id", label: "Section", render: (a) => a.section_id.split("-")[1]?.toUpperCase() },
        ]}
        rows={deptAllocations}
      />

      {/* Teacher Detail Modal */}
      <Dialog open={!!viewTeacher} onClose={() => setViewTeacher(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Teacher Details</DialogTitle>
        <DialogContent>
          {viewTeacher && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: "primary.main" }}>{viewTeacher.name.charAt(0)}</Avatar>
                <Box>
                  <Typography variant="h6">{viewTeacher.name}</Typography>
                  <Chip label={viewTeacher.teacher_type.replace("_", " ")} size="small" />
                </Box>
              </Box>
              <Divider />
              <Grid container spacing={2}>
                <Grid size={6}><Typography variant="caption" color="text.secondary">Department</Typography><Typography>{viewTeacher.department}</Typography></Grid>
                <Grid size={6}><Typography variant="caption" color="text.secondary">Designation</Typography><Typography>{viewTeacher.designation}</Typography></Grid>
                <Grid size={6}><Typography variant="caption" color="text.secondary">Email</Typography><Typography variant="body2">{viewTeacher.email}</Typography></Grid>
                <Grid size={6}><Typography variant="caption" color="text.secondary">Phone</Typography><Typography>{viewTeacher.phone}</Typography></Grid>
              </Grid>
              <Divider />
              <Typography variant="subtitle2">Subjects</Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {viewTeacher.subjects.map((s) => <Chip key={s} label={getSubjectName(s)} size="small" variant="outlined" />)}
              </Box>
              <Typography variant="subtitle2">Class Allocations</Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {teacherAllocs(viewTeacher).map((a) => (
                  <Chip key={a.id} label={`${getClassName(a.class_id)} - ${getSubjectName(a.subject_id)}`} size="small" variant="outlined" />
                ))}
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setViewTeacher(null)}>Close</Button></DialogActions>
      </Dialog>
    </>
  );
}
