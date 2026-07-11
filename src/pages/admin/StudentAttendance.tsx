import { useState } from "react";
import {
  Grid, MenuItem, TextField, Chip, Button, Box,
} from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { students, classes, attendanceRecords } from "@/demo-data";
import type { AttendanceStatus } from "@/types";

type AttendanceRow = {
  id: string;
  studentId: string;
  name: string;
  rollNumber: number;
  sectionId: string;
  sectionName: string;
  status: AttendanceStatus | "not_marked";
  attendancePct: number;
};

export default function StudentAttendance() {
  const [classFilter, setClassFilter] = useState("c1");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const classObj = classes.find((c) => c.id === classFilter);

  const classStudents = students
    .filter((s) => s.class_id === classFilter)
    .filter((s) => sectionFilter === "all" || s.section_id === sectionFilter);

  const [overrides, setOverrides] = useState<Record<string, AttendanceStatus>>({});

  const rows: AttendanceRow[] = classStudents.map((s) => {
    const record = attendanceRecords.find(
      (a) => a.student_id === s.id && a.date === date
    );
    const sectionName = classes
      .flatMap((c) => c.sections)
      .find((sec) => sec.id === s.section_id)?.name ?? "-";
    return {
      id: `${s.id}-${date}`,
      studentId: s.id,
      name: s.name,
      rollNumber: s.roll_number,
      sectionId: s.section_id,
      sectionName,
      status: overrides[s.id] ?? record?.status ?? "not_marked",
      attendancePct: s.attendance_pct,
    };
  });

  const presentCount = rows.filter((r) => r.status === "present").length;
  const absentCount = rows.filter((r) => r.status === "absent").length;
  const lateCount = rows.filter((r) => r.status === "late").length;

  const markStatus = (studentId: string, status: AttendanceStatus) => {
    setOverrides((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status: AttendanceStatus) => {
    const updates: Record<string, AttendanceStatus> = {};
    classStudents.forEach((student) => {
      updates[student.id] = status;
    });
    setOverrides((prev) => ({ ...prev, ...updates }));
  };

  return (
    <>
      <PageHeader
        title="Student Attendance"
        breadcrumbs={[
          { label: "Dashboard", to: "/admin" },
          { label: "Attendance" },
          { label: "Student Attendance" },
        ]}
      />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select size="small" label="Class" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
            {classes.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField fullWidth select size="small" label="Section" value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)}>
            <MenuItem value="all">All Sections</MenuItem>
            {(classObj?.sections ?? []).map((section) => <MenuItem key={section.id} value={section.id}>{section.name}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField fullWidth size="small" type="date" label="Date" value={date} onChange={(e) => setDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", height: "100%" }}>
            <Chip label={`Present: ${presentCount}`} color="success" />
            <Chip label={`Absent: ${absentCount}`} color="error" />
            <Chip label={`Late: ${lateCount}`} color="warning" />
            <Chip label={`Total: ${rows.length}`} color="default" />
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        <Button size="small" variant="outlined" color="success" onClick={() => markAll("present")}>Mark All Present</Button>
        <Button size="small" variant="outlined" color="error" onClick={() => markAll("absent")}>Mark All Absent</Button>
        <Button size="small" variant="outlined" color="warning" onClick={() => markAll("late")}>Mark All Late</Button>
      </Box>

      <DataTable
        columns={[
          { key: "name", label: "Student" },
          { key: "rollNumber", label: "Roll No." },
          { key: "sectionName", label: "Section" },
          {
            key: "status", label: "Status",
            render: (r) => (
              <Chip
                label={r.status === "not_marked" ? "Not Marked" : r.status}
                size="small"
                color={r.status === "present" ? "success" : r.status === "absent" ? "error" : r.status === "late" ? "warning" : "default"}
              />
            ),
          },
          { key: "attendancePct", label: "Overall %", render: (r) => `${r.attendancePct}%` },
          {
            key: "actions",
            label: "Mark",
            render: (r) => (
              <Box sx={{ display: "flex", gap: 0.5 }}>
                <Button size="small" variant="text" color="success" onClick={() => markStatus(r.studentId, "present")}>P</Button>
                <Button size="small" variant="text" color="error" onClick={() => markStatus(r.studentId, "absent")}>A</Button>
                <Button size="small" variant="text" color="warning" onClick={() => markStatus(r.studentId, "late")}>L</Button>
              </Box>
            ),
          },
        ]}
        rows={rows}
      />
    </>
  );
}
