import { useParams, useNavigate } from "react-router-dom";
import {
  Paper, Typography, Grid, Box, Avatar, Chip, Stack, Divider, Button,
} from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import {
  teachers, subjectAllocations, classes, getSubjectName, getClassName,
} from "@/data/mock";

export default function TeacherProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const teacher = teachers.find((t) => t.id === id);
  if (!teacher) return <Typography>Teacher not found</Typography>;

  const allocations = subjectAllocations.filter((a) => a.teacher_id === teacher.id);

  const assignedSections = classes.flatMap((c) =>
    c.sections.filter((s) => s.class_teacher_id === teacher.id).map((s) => `${c.name} ${s.name}`)
  );

  return (
    <>
      <PageHeader
        title="Teacher Profile"
        breadcrumbs={[
          { label: "Dashboard", to: "/admin" },
          { label: "Teachers", to: "/admin/teachers" },
          { label: teacher.name },
        ]}
        action={<Button variant="outlined" onClick={() => navigate("/admin/teachers")}>Back to Directory</Button>}
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 2 }}>
              <Avatar sx={{ width: 72, height: 72, fontSize: 28, bgcolor: "primary.main", mb: 1 }}>
                {teacher.name.charAt(0)}
              </Avatar>
              <Typography variant="h6">{teacher.name}</Typography>
              <Chip
                label={teacher.teacher_type.replace("_", " ")}
                size="small"
                color={teacher.teacher_type === "hod" ? "error" : teacher.teacher_type === "class_teacher" ? "primary" : "default"}
                sx={{ mt: 0.5 }}
              />
            </Box>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={1.5}>
              <InfoRow label="Department" value={teacher.department} />
              <InfoRow label="Email" value={teacher.email} />
              <InfoRow label="Phone" value={teacher.phone} />
              <InfoRow label="Subjects" value={teacher.subjects.map(getSubjectName).join(", ")} />
              <InfoRow label="Assigned Classes" value={teacher.assigned_classes.join(", ") || "—"} />
              {assignedSections.length > 0 && (
                <InfoRow label="Class Teacher Of" value={assignedSections.join(", ")} />
              )}
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>Subject Allocations</Typography>
              <DataTable
                columns={[
                  { key: "class_id", label: "Class", render: (a) => getClassName(a.class_id) },
                  { key: "section_id", label: "Section", render: (a) => a.section_id.split("-s")[1] === "0" ? "A" : a.section_id.split("-s")[1] === "1" ? "B" : "C" },
                  { key: "subject_id", label: "Subject", render: (a) => getSubjectName(a.subject_id) },
                ]}
                rows={allocations}
              />
            </Paper>

            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>Quick Actions</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Button size="small" variant="outlined" onClick={() => navigate("/admin/teachers/subjects")}>
                  Manage Subject Allocation
                </Button>
                <Button size="small" variant="outlined" onClick={() => navigate("/admin/teachers/class-assign")}>
                  Class Teacher Assignment
                </Button>
                <Button size="small" variant="outlined" onClick={() => navigate("/admin/teachers/hod-assign")}>
                  HOD Assignment
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={500} sx={{ textAlign: "right", maxWidth: "60%" }}>{value}</Typography>
    </Box>
  );
}
