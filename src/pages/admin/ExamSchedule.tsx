import {
  Paper, Table, TableHead, TableBody, TableRow, TableCell, Chip,
  Grid, MenuItem, TextField,
} from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { useState } from "react";
import { exams, subjects, classes } from "@/data/mock";

export default function ExamSchedule() {
  const [examFilter, setExamFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");

  const schedule = exams
    .filter((ex) => examFilter === "all" || ex.id === examFilter)
    .flatMap((ex) =>
      subjects.slice(0, 5).flatMap((sub, i) => {
      const d = new Date(ex.start_date);
      d.setDate(d.getDate() + i);
      return classes.slice(0, 4)
        .filter((classItem) => classFilter === "all" || classItem.id === classFilter)
        .map((classItem) => ({
          id: `${ex.id}-${sub.id}-${classItem.id}`,
          exam: ex.name,
          className: classItem.name,
          subject: sub.name,
          date: d.toISOString().split("T")[0],
          time: "09:00 AM - 12:00 PM",
          totalMarks: 100,
        }));
      })
    );

  return (
    <>
      <PageHeader
        title="Exam Schedule"
        breadcrumbs={[
          { label: "Dashboard", to: "/admin" },
          { label: "Examinations", to: "/admin/exams" },
          { label: "Schedule" },
        ]}
      />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select size="small" label="Exam" value={examFilter} onChange={(e) => setExamFilter(e.target.value)}>
            <MenuItem value="all">All Exams</MenuItem>
            {exams.map((exam) => <MenuItem key={exam.id} value={exam.id}>{exam.name}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select size="small" label="Class" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
            <MenuItem value="all">All Classes</MenuItem>
            {classes.map((classItem) => <MenuItem key={classItem.id} value={classItem.id}>{classItem.name}</MenuItem>)}
          </TextField>
        </Grid>
      </Grid>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Exam</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Total Marks</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schedule.map((s) => (
              <TableRow key={s.id}>
                <TableCell><Chip label={s.exam} size="small" /></TableCell>
                <TableCell>{s.className}</TableCell>
                <TableCell>{s.subject}</TableCell>
                <TableCell>{s.date}</TableCell>
                <TableCell>{s.time}</TableCell>
                <TableCell>{s.totalMarks}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
}
