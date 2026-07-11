import { useState } from "react";
import { TextField, Grid, Chip, Box, Button, MenuItem, Paper } from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import StatusChip from "@/components/StatusChip";
import { teachers } from "@/demo-data";
import type { AttendanceStatus } from "@/types";

type TeacherAttendanceRow = {
  id: string;
  name: string;
  department: string;
  status: AttendanceStatus;
  checkIn: string;
};

const statusById: AttendanceStatus[] = ["present", "present", "present", "late", "absent"];

function getDefaultStatus(teacherId: string): AttendanceStatus {
  const numeric = Number(teacherId.replace(/\D/g, "")) || 0;
  return statusById[numeric % statusById.length];
}

export default function TeacherAttendance() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [overrides, setOverrides] = useState<Record<string, AttendanceStatus>>({});

  const rows: TeacherAttendanceRow[] = teachers
    .filter((t) => departmentFilter === "all" || t.department === departmentFilter)
    .map((t) => {
      const status = overrides[t.id] ?? getDefaultStatus(t.id);
      return {
        id: t.id,
        name: t.name,
        department: t.department,
        status,
        checkIn: status === "absent" ? "-" : status === "late" ? "08:35 AM" : "08:05 AM",
      };
    });

  const presentCount = rows.filter((r) => r.status === "present").length;
  const absentCount = rows.filter((r) => r.status === "absent").length;
  const lateCount = rows.filter((r) => r.status === "late").length;

  const departments = Array.from(new Set(teachers.map((t) => t.department)));

  const markStatus = (teacherId: string, status: AttendanceStatus) => {
    setOverrides((prev) => ({ ...prev, [teacherId]: status }));
  };

  const markAll = (status: AttendanceStatus) => {
    const updates: Record<string, AttendanceStatus> = {};
    teachers.forEach((teacher) => {
      updates[teacher.id] = status;
    });
    setOverrides((prev) => ({ ...prev, ...updates }));
  };

  return (
    <>
      <PageHeader
        title="Teacher Attendance"
        breadcrumbs={[
          { label: "Dashboard", to: "/admin" },
          { label: "Attendance" },
          { label: "Teacher Attendance" },
        ]}
      />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth size="small" type="date" label="Date" value={date} onChange={(e) => setDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select size="small" label="Department" value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
            <MenuItem value="all">All Departments</MenuItem>
            {departments.map((dept) => <MenuItem key={dept} value={dept}>{dept}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 1.3, display: "flex", gap: 1, alignItems: "center", height: "100%" }}>
            <Chip label={`Present ${presentCount}`} color="success" size="small" />
            <Chip label={`Absent ${absentCount}`} color="error" size="small" />
            <Chip label={`Late ${lateCount}`} color="warning" size="small" />
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        <Button size="small" variant="outlined" color="success" onClick={() => markAll("present")}>Mark All Present</Button>
        <Button size="small" variant="outlined" color="error" onClick={() => markAll("absent")}>Mark All Absent</Button>
        <Button size="small" variant="outlined" color="warning" onClick={() => markAll("late")}>Mark All Late</Button>
      </Box>

      <DataTable
        columns={[
          { key: "name", label: "Teacher" },
          { key: "department", label: "Department" },
          {
            key: "status", label: "Status",
            render: (r) => <StatusChip status={r.status} />,
          },
          { key: "checkIn", label: "Check-in" },
          {
            key: "actions",
            label: "Mark",
            render: (r) => (
              <Box sx={{ display: "flex", gap: 0.5 }}>
                <Button size="small" color="success" onClick={() => markStatus(r.id, "present")}>P</Button>
                <Button size="small" color="error" onClick={() => markStatus(r.id, "absent")}>A</Button>
                <Button size="small" color="warning" onClick={() => markStatus(r.id, "late")}>L</Button>
              </Box>
            ),
          },
        ]}
        rows={rows}
      />
    </>
  );
}
