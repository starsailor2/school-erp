import { Paper, Typography, Stack, Chip, Avatar } from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import HotelIcon from "@mui/icons-material/Hotel";
import { useAuth } from "@/context/AuthContext";
import { getHostelAllocationForStudent, getRoommates, hostelRooms, hostelBlocks, staffMembers, students } from "@/demo-data";

export default function ParentHostel() {
  const { selectedChildId } = useAuth();
  const child = students.find((s) => s.id === selectedChildId);
  const allocation = getHostelAllocationForStudent(selectedChildId);

  if (!allocation) {
    return (
      <>
        <PageHeader title="My Hostel" eyebrow="Hostel" />
        <Paper sx={{ p: 2 }}>
          <EmptyState icon={<HotelIcon fontSize="inherit" />} title="Not a hostel resident" description={`${child?.name ?? "This child"} is not currently allocated to a hostel room.`} />
        </Paper>
      </>
    );
  }

  const room = hostelRooms.find((r) => r.id === allocation.room_id);
  const block = hostelBlocks.find((b) => b.id === room?.block_id);
  const warden = staffMembers.find((s) => s.id === block?.warden_staff_id);
  const roommates = getRoommates(selectedChildId);

  return (
    <>
      <PageHeader title="My Hostel" eyebrow="Hostel" />
      <Stack spacing={2}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>Room Details</Typography>
          <Stack spacing={0.5}>
            <Typography variant="body2">Block: {block?.name}</Typography>
            <Typography variant="body2">Room: {room?.room_number} ({room?.type})</Typography>
            <Typography variant="body2">Since: {allocation.check_in_date}</Typography>
            <Typography variant="body2">Warden: {warden?.name} ({warden?.email})</Typography>
          </Stack>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>Roommates</Typography>
          {roommates.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No roommates.</Typography>
          ) : (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {roommates.map((r) => (
                <Chip key={r.id} avatar={<Avatar>{r.name.charAt(0)}</Avatar>} label={r.name} variant="outlined" />
              ))}
            </Stack>
          )}
        </Paper>
      </Stack>
    </>
  );
}
