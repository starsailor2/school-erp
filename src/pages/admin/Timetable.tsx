import { useState, useMemo } from "react";
import {
  Paper, Tabs, Tab, Table, TableHead, TableBody, TableRow, TableCell,
  Chip, Grid, TextField, MenuItem, Button, ToggleButtonGroup, ToggleButton, Box,
} from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { timetable, classes, teachers, subjects } from "@/demo-data";
import type { TimetableEntry } from "@/types";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function Timetable() {
  const [day, setDay] = useState(0);
  const [viewMode, setViewMode] = useState<"class" | "teacher">("class");
  const [classFilter, setClassFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [teacherFilter, setTeacherFilter] = useState("all");
  const [entriesByDay, setEntriesByDay] = useState<Record<string, TimetableEntry[]>>(timetable);

  const selectedClass = classes.find((c) => c.name === classFilter);
  const sections = selectedClass?.sections ?? [];

  const entries = useMemo(() => {
    return (entriesByDay[days[day]] ?? []).filter((entry) => {
      if (viewMode === "class") {
        if (classFilter !== "all" && entry.class_name !== classFilter.replace("Class ", "")) return false;
        if (sectionFilter !== "all" && entry.section !== sectionFilter) return false;
      } else {
        if (teacherFilter !== "all" && entry.teacher !== teacherFilter) return false;
      }
      return true;
    });
  }, [entriesByDay, day, viewMode, classFilter, sectionFilter, teacherFilter]);

  const addPeriod = () => {
    const dayName = days[day];
    const current = entriesByDay[dayName] ?? [];
    const nextPeriod = current.length + 1;
    const randomSubject = subjects[nextPeriod % subjects.length];
    const randomTeacher = teachers[nextPeriod % teachers.length];

    const newEntry: TimetableEntry = {
      period: nextPeriod,
      subject: randomSubject.name,
      teacher: randomTeacher.name,
      class_name: classFilter === "all" ? "1" : classFilter.replace("Class ", ""),
      section: sectionFilter === "all" ? "A" : sectionFilter,
      time: `${7 + nextPeriod}:00 - ${7 + nextPeriod}:45`,
    };

    setEntriesByDay((prev) => ({ ...prev, [dayName]: [...current, newEntry] }));
  };

  return (
    <>
      <PageHeader
        title="Timetable"
        breadcrumbs={[
          { label: "Dashboard", to: "/admin" },
          { label: "Academics" },
          { label: "Timetable" },
        ]}
        action={<Button size="small" variant="contained" onClick={addPeriod}>Add Period</Button>}
      />

      <Box sx={{ mb: 2 }}>
        <ToggleButtonGroup size="small" exclusive value={viewMode} onChange={(_, v) => { if (v) setViewMode(v); }}>
          <ToggleButton value="class">Class Timetable</ToggleButton>
          <ToggleButton value="teacher">Teacher Timetable</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {viewMode === "class" ? (
          <>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth select size="small" label="Class" value={classFilter} onChange={(e) => { setClassFilter(e.target.value); setSectionFilter("all"); }}>
                <MenuItem value="all">All Classes</MenuItem>
                {classes.map((classItem) => <MenuItem key={classItem.id} value={classItem.name}>{classItem.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth select size="small" label="Section" value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)} disabled={classFilter === "all"}>
                <MenuItem value="all">All Sections</MenuItem>
                {sections.map((s) => <MenuItem key={s.id} value={s.name}>{s.name}</MenuItem>)}
              </TextField>
            </Grid>
          </>
        ) : (
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth select size="small" label="Teacher" value={teacherFilter} onChange={(e) => setTeacherFilter(e.target.value)}>
              <MenuItem value="all">All Teachers</MenuItem>
              {teachers.map((t) => <MenuItem key={t.id} value={t.name}>{t.name}</MenuItem>)}
            </TextField>
          </Grid>
        )}
      </Grid>

      <Paper sx={{ mb: 2 }}>
        <Tabs value={day} onChange={(_, v) => setDay(v)} variant="scrollable" scrollButtons="auto">
          {days.map((d) => <Tab key={d} label={d} />)}
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
              <TableCell>Class</TableCell>
              <TableCell>Section</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map((e, i) => (
              <TableRow key={`${e.class_name}-${e.section}-${e.period}-${i}`}>
                <TableCell>{e.period}</TableCell>
                <TableCell>{e.time}</TableCell>
                <TableCell><Chip label={e.subject} size="small" variant="outlined" /></TableCell>
                <TableCell>{e.teacher}</TableCell>
                <TableCell>{e.class_name}</TableCell>
                <TableCell>{e.section}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
}
