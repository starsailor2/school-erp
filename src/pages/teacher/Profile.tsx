import { useState } from "react";
import {
  Paper, Typography, Avatar, Divider, Stack, Box, Chip, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid,
  Snackbar, Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { teachers, getSubjectName, getClassName } from "@/demo-data";

export default function TeacherProfile() {
  const { user } = useAuth();
  const teacher = teachers.find((t) => t.id === user?.id);
  const [editOpen, setEditOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    phone: teacher?.phone ?? "",
    email: teacher?.email ?? "",
    designation: teacher?.designation ?? "",
  });
  const [form, setForm] = useState({ ...profileData });
  const [snack, setSnack] = useState(false);

  if (!teacher) return <Typography>Teacher not found</Typography>;

  const openEdit = () => {
    setForm({ ...profileData });
    setEditOpen(true);
  };

  const handleSave = () => {
    setProfileData({ ...form });
    setEditOpen(false);
    setSnack(true);
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <>
      <PageHeader
        title="My Profile"
        breadcrumbs={[{ label: "Dashboard", to: "/teacher" }, { label: "Profile" }]}
        action={
          <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={openEdit}>
            Edit Profile
          </Button>
        }
      />
      <Paper sx={{ p: 3, maxWidth: 600 }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 2 }}>
          <Avatar sx={{ width: 72, height: 72, fontSize: 28, bgcolor: "primary.main", mb: 1 }}>
            {teacher.name.charAt(0)}
          </Avatar>
          <Typography variant="h6">{teacher.name}</Typography>
          <Chip label={teacher.teacher_type.replace("_", " ")} size="small" sx={{ mt: 0.5 }} />
        </Box>
        <Divider sx={{ my: 2 }} />
        <Stack spacing={1.5}>
          <Row label="Department" value={teacher.department} />
          <Row label="Designation" value={profileData.designation} />
          <Row label="Email" value={profileData.email} />
          <Row label="Phone" value={profileData.phone} />
          <Row label="Subjects" value={teacher.subjects.map(getSubjectName).join(", ")} />
          <Row label="Classes" value={teacher.assigned_classes.map(getClassName).join(", ")} />
        </Stack>
      </Paper>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}>
              <TextField fullWidth label="Email" value={form.email} onChange={set("email")} />
            </Grid>
            <Grid size={12}>
              <TextField fullWidth label="Phone" value={form.phone} onChange={set("phone")} />
            </Grid>
            <Grid size={12}>
              <TextField fullWidth label="Designation" value={form.designation} onChange={set("designation")} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack} autoHideDuration={3000} onClose={() => setSnack(false)}>
        <Alert severity="success" onClose={() => setSnack(false)}>Profile updated successfully!</Alert>
      </Snackbar>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={500}>{value}</Typography>
    </Box>
  );
}
