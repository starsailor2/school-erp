import { Paper, Table, TableHead, TableBody, TableRow, TableCell, Chip, Typography, Box } from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { teachers, timetable } from "@/data/mock";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const LUNCH_PERIOD = 5;

export default function TeacherTimetable() {
  const { user } = useAuth();
  const teacher = teachers.find((t) => t.id === user?.id);

  // Build per-day grid with lunch/free for this teacher
  const myWeekEntries: Record<string, { period: number; time: string; subject: string; class_name: string; section: string; type: "class" | "lunch" | "free" }[]> = {};
  let maxPeriods = 0;
  for (const day of DAYS) {
    const allDayEntries = timetable[day] ?? [];
    const teacherEntries = allDayEntries.filter((e) => e.teacher === teacher?.name);
    const dayMax = allDayEntries.reduce((m, e) => Math.max(m, e.period), 0);
    if (dayMax > maxPeriods) maxPeriods = dayMax;
    const daySlots: typeof myWeekEntries[string] = [];
    for (let p = 1; p <= dayMax; p++) {
      if (p === LUNCH_PERIOD) {
        daySlots.push({ period: p, time: "12:00 - 12:30", subject: "Lunch Break", class_name: "", section: "", type: "lunch" });
      } else {
        const entry = teacherEntries.find((e) => e.period === p);
        if (entry) {
          daySlots.push({ period: p, time: entry.time, subject: entry.subject, class_name: entry.class_name, section: entry.section, type: "class" });
        } else {
          const anyEntry = allDayEntries.find((e) => e.period === p);
          daySlots.push({ period: p, time: anyEntry?.time ?? "", subject: "Free", class_name: "", section: "", type: "free" });
        }
      }
    }
    myWeekEntries[day] = daySlots;
  }

  const periods = Array.from({ length: maxPeriods || 9 }, (_, i) => i + 1);
  const todayIdx = new Date().getDay();
  const todayName = todayIdx === 0 ? "" : DAYS[todayIdx - 1];

  return (
    <>
      <PageHeader
        title="My Timetable"
        breadcrumbs={[{ label: "Dashboard", to: "/teacher" }, { label: "Timetable" }]}
      />
      <Paper sx={{ overflowX: "auto" }}>
        <Table size="small" sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, bgcolor: "action.hover", position: "sticky", left: 0, zIndex: 1, minWidth: 110 }}>
                Day / Period
              </TableCell>
              {periods.map((p) => {
                const isLunch = p === LUNCH_PERIOD;
                return (
                  <TableCell key={p} align="center" sx={{ fontWeight: 700, bgcolor: isLunch ? "action.selected" : "action.hover", minWidth: isLunch ? 80 : 100 }}>
                    {isLunch ? "Lunch" : `Period ${p > LUNCH_PERIOD ? p - 1 : p}`}
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      {isLunch ? "12:00 - 12:30" : p < LUNCH_PERIOD ? `${7 + p}:00 - ${7 + p}:45` : `${6 + p}:00 - ${6 + p}:45`}
                    </Typography>
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {DAYS.map((day) => {
              const isToday = day === todayName;
              return (
                <TableRow key={day} sx={{ bgcolor: isToday ? "action.selected" : "transparent" }}>
                  <TableCell sx={{
                    fontWeight: 600,
                    position: "sticky", left: 0, zIndex: 1,
                    bgcolor: isToday ? "action.selected" : "background.paper",
                    whiteSpace: "nowrap",
                  }}>
                    {day}
                    {isToday && <Chip label="Today" size="small" color="primary" sx={{ ml: 1 }} />}
                  </TableCell>
                  {periods.map((p) => {
                    const entry = myWeekEntries[day]?.find((e) => e.period === p);
                    if (!entry) {
                      return (
                        <TableCell key={p} align="center" sx={{ color: "text.disabled" }}>—</TableCell>
                      );
                    }
                    if (entry.type === "lunch") {
                      return (
                        <TableCell key={p} align="center" sx={{ bgcolor: "action.hover" }}>
                          <Typography variant="body2" fontWeight={600} color="warning.main">🍽 Lunch</Typography>
                        </TableCell>
                      );
                    }
                    if (entry.type === "free") {
                      return (
                        <TableCell key={p} align="center" sx={{ bgcolor: "action.hover" }}>
                          <Box sx={{ py: 0.5 }}>
                            <Typography variant="body2" color="success.main" fontWeight={500}>Free</Typography>
                          </Box>
                        </TableCell>
                      );
                    }
                    return (
                      <TableCell key={p} align="center">
                        <Box sx={{ py: 0.5 }}>
                          <Chip
                            label={`${entry.class_name}-${entry.section}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ fontWeight: 600, mb: 0.5 }}
                          />
                          <Typography variant="caption" display="block" color="text.secondary">
                            {entry.subject}
                          </Typography>
                        </Box>
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
}
