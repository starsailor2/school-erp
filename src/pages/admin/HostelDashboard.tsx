import { Grid, Paper, Typography, Stack, Box } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import HotelIcon from "@mui/icons-material/Hotel";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import PersonIcon from "@mui/icons-material/Person";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { ChartCard } from "@/components/ChartCard";
import { getChartPalette, getChartTooltipStyle } from "@/theme/chartPalette";
import { useColorMode } from "@/context/ColorModeContext";
import { hostelBlocks, hostelRooms, hostelAllocations, staffMembers } from "@/demo-data";

export default function HostelDashboard() {
  const { mode } = useColorMode();
  const palette = getChartPalette(mode);
  const tooltipStyle = getChartTooltipStyle(mode);

  const totalBeds = hostelRooms.reduce((s, r) => s + r.capacity, 0);
  const occupied = hostelAllocations.length;
  const vacant = totalBeds - occupied;

  const byBlock = hostelBlocks.map((block) => {
    const rooms = hostelRooms.filter((r) => r.block_id === block.id);
    const capacity = rooms.reduce((s, r) => s + r.capacity, 0);
    const blockOccupied = hostelAllocations.filter((a) => rooms.some((r) => r.id === a.room_id)).length;
    const warden = staffMembers.find((s) => s.id === block.warden_staff_id);
    return { name: block.name, capacity, occupied: blockOccupied, warden: warden?.name ?? "Unassigned" };
  });

  const occupancyPie = [
    { name: "Occupied", value: occupied, color: palette.categorical[0] },
    { name: "Vacant", value: vacant, color: palette.categorical[1] },
  ];

  return (
    <>
      <PageHeader title="Hostel Dashboard" eyebrow="Operations" breadcrumbs={[{ label: "Operations" }, { label: "Hostel" }]} />
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard title="Total Beds" value={totalBeds} numericValue={totalBeds} icon={<HotelIcon />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard title="Occupied Beds" value={occupied} numericValue={occupied} icon={<PersonIcon />} delay={0.05} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard title="Vacant Beds" value={vacant} numericValue={vacant} icon={<MeetingRoomIcon />} delay={0.1} />
        </Grid>
      </Grid>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <ChartCard eyebrow="Occupancy" title="Beds by Block">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byBlock}>
                <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
                <XAxis dataKey="name" stroke={palette.axis} fontSize={11} />
                <YAxis stroke={palette.axis} fontSize={12} />
                <Tooltip {...tooltipStyle} />
                <Legend />
                <Bar dataKey="occupied" name="Occupied" fill={palette.categorical[0]} radius={[4, 4, 0, 0]} />
                <Bar dataKey="capacity" name="Capacity" fill={palette.categorical[1]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ChartCard eyebrow="Occupancy" title="Overall Occupancy">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={occupancyPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {occupancyPie.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>Blocks</Typography>
        <Stack spacing={1.5}>
          {byBlock.map((b) => (
            <Box key={b.name} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1, borderBottom: 1, borderColor: "divider" }}>
              <Box>
                <Typography variant="body2" fontWeight={600}>{b.name}</Typography>
                <Typography variant="caption" color="text.secondary">Warden: {b.warden}</Typography>
              </Box>
              <Typography variant="body2">{b.occupied} / {b.capacity} beds</Typography>
            </Box>
          ))}
        </Stack>
      </Paper>
    </>
  );
}
