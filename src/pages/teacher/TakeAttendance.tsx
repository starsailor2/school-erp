import { useState } from "react";
import {
  MenuItem, TextField, Grid, Chip, Button, Box, Stack, Snackbar, Alert,
  ToggleButtonGroup, ToggleButton, Avatar,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { useAuth } from "@/context/AuthContext";
import {
  teachers, getTeacherClasses, students, attendanceRecords, getClassName,
} from "@/demo-data";
import type { AttendanceStatus } from "@/types";

type Status = AttendanceStatus | "not_marked";

export default function TakeAttendance() {
  const { user } = useAuth();
  const teacher = teachers.find((t) => t.id === user?.id);
  const allocations = teacher ? getTeacherClasses(teacher.id) : [];
  const classIds = [...new Set(allocations.map((a) => a.class_id))];
  const [classFilter, setClassFilter] = useState(classIds[0] ?? "");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [overrides, setOverrides] = useState<Record<string, Status>>({});
  const [snack, setSnack] = useState(false);

  const classStudents = students.filter((s) => s.class_id === classFilter);
  const rows = classStudents.map((s) => {
    const record = attendanceRecords.find((a) => a.student_id === s.id && a.date === date);
    return { ...s, status: (overrides[s.id] ?? record?.status ?? "not_marked") as Status };
  });

  const markStatus = (studentId: string, status: Status) =>
    setOverrides((o) => ({ ...o, [studentId]: status }));

  const markAll = (status: AttendanceStatus) => {
    const map: Record<string, Status> = {};
    classStudents.forEach((s) => { map[s.id] = status; });
    setOverrides(map);
  };

  const handleSubmit = () => {
    setSnack(true);
    setOverrides({});
  };

  const present = rows.filter((r) => r.status === "present").length;
  const absent = rows.filter((r) => r.status === "absent").length;
  const late = rows.filter((r) => r.status === "late").length;

  return (
    <>
      <PageHeader
        title="Take Attendance"
        breadcrumbs={[{ label: "Dashboard", to: "/teacher" }, { label: "Attendance" }]}
      />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField fullWidth select size="small" label="Class" value={classFilter} onChange={(e) => { setClassFilter(e.target.value); setOverrides({}); }}>
            {classIds.map((cid) => <MenuItem key={cid} value={cid}>{getClassName(cid)}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField fullWidth size="small" type="date" label="Date" value={date} onChange={(e) => { setDate(e.target.value); setOverrides({}); }} slotProps={{ inputLabel: { shrink: true } }} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Box sx={{ display: "flex", gap: 1, height: "100%", alignItems: "center", flexWrap: "wrap" }}>
            <Chip label={`Present: ${present}`} color="success" />
            <Chip label={`Absent: ${absent}`} color="error" />
            <Chip label={`Late: ${late}`} color="warning" />
            <Box sx={{ flex: 1 }} />
            <Button size="small" variant="outlined" color="success" onClick={() => markAll("present")}>Mark All Present</Button>
            <Button size="small" variant="outlined" color="error" onClick={() => markAll("absent")}>Mark All Absent</Button>
          </Box>
        </Grid>
      </Grid>
      <DataTable
        columns={[
          {
            key: "name", label: "Student",
            render: (r) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>{r.name.charAt(0)}</Avatar>
                {r.name}
              </Box>
            ),
          },
          { key: "roll_number", label: "Roll No." },
          {
            key: "status", label: "Status",
            render: (r) => (
              <ToggleButtonGroup
                size="small"
                exclusive
                value={r.status === "not_marked" ? null : r.status}
                onChange={(_, val) => { if (val) markStatus(r.id, val); }}
              >
                <ToggleButton value="present" color="success"><CheckCircleIcon fontSize="small" sx={{ mr: 0.5 }} />P</ToggleButton>
                <ToggleButton value="absent" color="error"><CancelIcon fontSize="small" sx={{ mr: 0.5 }} />A</ToggleButton>
                <ToggleButton value="late" color="warning"><AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />L</ToggleButton>
              </ToggleButtonGroup>
            ),
          },
        ]}
        rows={rows}
      />
      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Button variant="contained" onClick={handleSubmit} disabled={rows.some((r) => r.status === "not_marked")}>
          Submit Attendance
        </Button>
        <Button variant="outlined" onClick={() => setOverrides({})}>Reset</Button>
      </Stack>
      <Snackbar open={snack} autoHideDuration={3000} onClose={() => setSnack(false)}>
        <Alert severity="success" onClose={() => setSnack(false)}>Attendance submitted successfully!</Alert>
      </Snackbar>
    </>
  );
}
