import { Paper, Typography, Stack, Avatar, Divider, Chip, Grid, Box } from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import PersonIcon from "@mui/icons-material/Person";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { students, parents, classes, teachers, getStudentFees, getClassName, getStudentAttendance } from "@/demo-data";

export default function StudentProfile() {
  const { user } = useAuth();
  const student = students.find((s) => s.id === user?.id);
  const parent = student ? parents.find((p) => p.id === student.parent_id) : null;
  const fees = student ? getStudentFees(student.id) : [];
  const hasPending = fees.some((f) => f.status !== "paid");
  const attendance = student ? getStudentAttendance(student.id) : [];
  const present = attendance.filter((a) => a.status === "present").length;
  const pct = attendance.length ? Math.round((present / attendance.length) * 100) : 0;

  // Get class teacher name
  const cls = student ? classes.find((c) => c.id === student.class_id) : null;
  const sec = cls?.sections.find((s) => s.id === student?.section_id);
  const sectionLetter = sec?.name ?? "";
  const classTeacherId = sec?.class_teacher_id;
  const classTeacher = classTeacherId ? teachers.find((t) => t.id === classTeacherId) : null;

  if (!student) return <Typography>Student not found.</Typography>;

  return (
    <>
      <PageHeader title="My Profile" breadcrumbs={[{ label: "Dashboard", to: "/student" }, { label: "Profile" }]} />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Avatar sx={{ width: 100, height: 100, bgcolor: "primary.main", fontSize: 40, mx: "auto", mb: 2 }}>
              {student.name.split(" ").map((n) => n[0]).join("")}
            </Avatar>
            <Typography variant="h5" gutterBottom>{student.name}</Typography>
            <Typography color="text.secondary" gutterBottom>{student.email}</Typography>
            <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap>
              <Chip icon={<SchoolIcon />} label={`${getClassName(student.class_id)} ${sectionLetter}`} color="primary" />
              <Chip label={`Roll No: ${student.roll_number}`} variant="outlined" />
              <Chip label={student.gender} size="small" variant="outlined" />
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" spacing={3} justifyContent="center">
              <Box textAlign="center">
                <Typography variant="h6" color={pct >= 75 ? "success.main" : "error.main"}>{pct}%</Typography>
                <Typography variant="caption" color="text.secondary">Attendance</Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h6" color={hasPending ? "warning.main" : "success.main"}>{hasPending ? "Pending" : "Clear"}</Typography>
                <Typography variant="caption" color="text.secondary">Fees</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom><SchoolIcon sx={{ mr: 1, verticalAlign: "middle" }} />Academic Details</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Admission Number</Typography>
                <Typography variant="body1" fontWeight={500}>{student.admission_number}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Class & Section</Typography>
                <Typography variant="body1" fontWeight={500}>{getClassName(student.class_id)} — Section {sectionLetter}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Roll Number</Typography>
                <Typography variant="body1" fontWeight={500}>{student.roll_number}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Class Teacher</Typography>
                <Typography variant="body1" fontWeight={500}>{classTeacher?.name ?? "—"}</Typography>
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom><PersonIcon sx={{ mr: 1, verticalAlign: "middle" }} />Personal Details</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Date of Birth</Typography>
                <Typography variant="body1" fontWeight={500}>{student.date_of_birth}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Phone</Typography>
                <Typography variant="body1" fontWeight={500}>{student.phone}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Blood Group</Typography>
                <Typography variant="body1" fontWeight={500}>{student.blood_group}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Address</Typography>
                <Typography variant="body1" fontWeight={500}>{student.address}</Typography>
              </Grid>
            </Grid>
          </Paper>

          {parent && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Parent / Guardian</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">Name</Typography>
                  <Typography variant="body1" fontWeight={500}>{parent.name}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">Occupation</Typography>
                  <Typography variant="body1" fontWeight={500}>{parent.occupation}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">Email</Typography>
                  <Typography variant="body1" fontWeight={500}>{parent.email}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">Phone</Typography>
                  <Typography variant="body1" fontWeight={500}>{parent.phone}</Typography>
                </Grid>
              </Grid>
            </Paper>
          )}
        </Grid>
      </Grid>
    </>
  );
}
