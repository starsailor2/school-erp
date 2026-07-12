import { useState } from "react";
import {
  Paper, Tabs, Tab, Table, TableHead, TableBody, TableRow, TableCell, Chip, Typography, Box,
} from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { timetable, students, classes } from "@/demo-data";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function StudentTimetable() {
  const { user } = useAuth();
  const student = students.find((s) => s.id === user?.id);
  const cls = student ? classes.find((c) => c.id === student.class_id) : null;
  const sec = cls?.sections.find((s) => s.id === student?.section_id);
  const classNum = cls?.name.replace("Class ", "") ?? "";
  const sectionLetter = sec?.name ?? "";

  const todayIdx = Math.max(0, Math.min(new Date().getDay() - 1, 5));
  const [day, setDay] = useState(todayIdx >= 0 ? todayIdx : 0);

  const entries = (timetable[days[day]] ?? []).filter(
    (e) => e.class_name === classNum && e.section === sectionLetter
  );

  return (
    <>
      <PageHeader title="My Timetable" breadcrumbs={[{ label: "Dashboard", to: "/student" }, { label: "Timetable" }]} />
      <Paper sx={{ mb: 2 }}>
        <Tabs value={day} onChange={(_, v) => setDay(v)} variant="scrollable" scrollButtons="auto">
          {days.map((d, i) => (
            <Tab key={d} label={d} sx={i === todayIdx ? { fontWeight: 700 } : undefined} />
          ))}
        </Tabs>
      </Paper>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Period</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Teacher</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography color="text.secondary" sx={{ py: 3 }}>No classes scheduled</Typography>
                </TableCell>
              </TableRow>
            ) : (
              entries.map((e) => (
                <TableRow
                  key={e.period}
                  hover
                  sx={
                    e.subject === "Lunch Break"
                      ? { bgcolor: "action.selected" }
                      : undefined
                  }
                >
                  <TableCell>
                    <Chip label={`P${e.period}`} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{e.time}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip
                        label={e.subject}
                        size="small"
                        color={e.subject === "Lunch Break" ? "warning" : e.subject === "Physical Training" ? "success" : "primary"}
                        variant={e.subject === "Lunch Break" ? "outlined" : "filled"}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>{e.teacher || "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
}
