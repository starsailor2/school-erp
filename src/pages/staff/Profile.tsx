import { Paper, Typography, Avatar, Stack, Box, Divider, Chip } from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { staffMembers } from "@/data/mock";

export default function StaffProfile() {
  const { user, staffRole } = useAuth();
  const staff = staffMembers.find((s) => s.id === user?.id);
  if (!staff) return <Typography>Staff not found</Typography>;

  return (
    <>
      <PageHeader title="My Profile" breadcrumbs={[{ label: "Dashboard", to: "/staff" }, { label: "Profile" }]} />
      <Paper sx={{ p: 3, maxWidth: 500 }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 2 }}>
          <Avatar sx={{ width: 72, height: 72, fontSize: 28, bgcolor: "primary.main", mb: 1 }}>{staff.name.charAt(0)}</Avatar>
          <Typography variant="h6">{staff.name}</Typography>
          <Chip label={staffRole.replace("_", " ")} size="small" sx={{ mt: 0.5 }} />
        </Box>
        <Divider sx={{ my: 2 }} />
        <Stack spacing={1.5}>
          <Row label="Department" value={staff.department} />
          <Row label="Role" value={staff.role_type.replace("_", " ")} />
          <Row label="Staff ID" value={staff.id} />
        </Stack>
      </Paper>
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
