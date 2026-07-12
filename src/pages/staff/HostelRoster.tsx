import { Paper, Typography, Stack, Box, Chip } from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { hostelBlocks, hostelRooms, hostelAllocations, students } from "@/demo-data";

export default function HostelRoster() {
  return (
    <>
      <PageHeader title="Hostel Roster" eyebrow="Hostel" />
      <Stack spacing={2}>
        {hostelBlocks.map((block) => {
          const rooms = hostelRooms.filter((r) => r.block_id === block.id);
          return (
            <Paper key={block.id} sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>{block.name}</Typography>
              <Stack spacing={1}>
                {rooms.map((room) => {
                  const occupants = hostelAllocations
                    .filter((a) => a.room_id === room.id && a.status === "active")
                    .map((a) => students.find((s) => s.id === a.student_id)?.name)
                    .filter((n): n is string => Boolean(n));
                  if (occupants.length === 0) return null;
                  return (
                    <Box key={room.id} sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                      <Chip size="small" label={`Room ${room.room_number}`} />
                      <Typography variant="body2" color="text.secondary">{occupants.join(", ")}</Typography>
                    </Box>
                  );
                })}
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    </>
  );
}
