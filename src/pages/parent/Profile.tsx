import { Paper, Typography, Stack, Avatar, Divider, Box, Chip, Grid } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import WorkIcon from "@mui/icons-material/Work";
import HomeIcon from "@mui/icons-material/Home";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { parents, getChildrenOfParent, getClassName, getStudentAttendance } from "@/data/mock";

export default function ParentProfile() {
  const { user } = useAuth();
  const parent = parents.find((p) => p.id === user?.id);
  const children = parent ? getChildrenOfParent(parent.id) : [];

  if (!parent) return <Typography>Parent not found.</Typography>;

  return (
    <>
      <PageHeader title="My Profile" breadcrumbs={[{ label: "Dashboard", to: "/parent" }, { label: "Profile" }]} />
      <Paper sx={{ p: 4 }}>
        <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 3 }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: "primary.main", fontSize: 32 }}>
            {parent.name.split(" ").map((n) => n[0]).join("")}
          </Avatar>
          <Stack>
            <Typography variant="h5">{parent.name}</Typography>
            <Chip label="Parent" size="small" color="primary" variant="outlined" sx={{ alignSelf: "flex-start", mt: 0.5 }} />
          </Stack>
        </Stack>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <EmailIcon color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">Email</Typography>
                <Typography variant="body2" fontWeight={500}>{parent.email}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <PhoneIcon color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">Phone</Typography>
                <Typography variant="body2" fontWeight={500}>{parent.phone}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <WorkIcon color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">Occupation</Typography>
                <Typography variant="body2" fontWeight={500}>{parent.occupation || "—"}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <HomeIcon color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">Address</Typography>
                <Typography variant="body2" fontWeight={500}>{parent.address || "—"}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <PersonIcon color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">Number of Children</Typography>
                <Typography variant="body2" fontWeight={500}>{children.length}</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Typography variant="h6" sx={{ mb: 2 }}>Children</Typography>
        <Stack spacing={2}>
          {children.map((c) => {
            const att = getStudentAttendance(c.id);
            const present = att.filter((a) => a.status === "present").length;
            const pct = att.length ? Math.round((present / att.length) * 100) : 0;
            const sectionIdx = c.section_id?.split("-")[1]?.replace("s", "") ?? "0";
            const sectionLetter = String.fromCharCode(65 + parseInt(sectionIdx));
            return (
              <Paper key={c.id} variant="outlined" sx={{ p: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>{c.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {getClassName(c.class_id)} — Section {sectionLetter} · Admission No: {c.admission_number}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Roll No: {c.roll_number} · Gender: {c.gender}
                    </Typography>
                  </Box>
                  <Stack alignItems="center">
                    <Chip label={`${pct}% Attendance`} size="small" color={pct >= 80 ? "success" : pct >= 60 ? "warning" : "error"} />
                  </Stack>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      </Paper>
    </>
  );
}
