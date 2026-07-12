import { useEffect, useState } from "react";
import { Grid, MenuItem, TextField, Button, Box } from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import StatusChip from "@/components/StatusChip";
import { StatCard } from "@/components/StatCard";
import EventIcon from "@mui/icons-material/Event";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { getIconAccent } from "@/theme/chartPalette";
import { useColorMode } from "@/context/ColorModeContext";
import { useAuth } from "@/context/AuthContext";
import { getPTMs, updatePTMStatus } from "@/demo-data/communication/ptmStore";
import { students, parents, getClassName } from "@/demo-data";

export default function TeacherMeetings() {
  const { user } = useAuth();
  const { mode } = useColorMode();
  const [, setRefresh] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const onUpdate = () => setRefresh((v) => v + 1);
    window.addEventListener("erp-ptm-updated", onUpdate);
    return () => window.removeEventListener("erp-ptm-updated", onUpdate);
  }, []);

  const all = getPTMs().filter((m) => m.teacher_id === user.id);
  const rows = all
    .filter((m) => statusFilter === "all" || m.status === statusFilter)
    .map((m) => {
      const student = students.find((s) => s.id === m.student_id);
      return {
        ...m,
        studentName: student?.name ?? m.student_id,
        className: student ? getClassName(student.class_id) : "-",
        parentName: parents.find((p) => p.id === m.parent_id)?.name ?? m.parent_id,
      };
    })
    .sort((a, b) => b.proposed_date.localeCompare(a.proposed_date));

  const pending = all.filter((m) => m.status === "pending").length;
  const confirmed = all.filter((m) => m.status === "confirmed").length;

  return (
    <>
      <PageHeader
        title="Parent-Teacher Meetings"
        breadcrumbs={[{ label: "Dashboard", to: "/teacher" }, { label: "Meetings" }]}
      />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 6, sm: 4 }}>
          <StatCard title="Total Requests" value={all.length} numericValue={all.length} icon={<EventIcon />} color={getIconAccent(mode, "ptm-total")} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4 }}>
          <StatCard title="Pending" value={pending} numericValue={pending} icon={<HourglassEmptyIcon />} color={getIconAccent(mode, "ptm-pending")} delay={0.05} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4 }}>
          <StatCard title="Confirmed" value={confirmed} numericValue={confirmed} icon={<CheckCircleIcon />} color={getIconAccent(mode, "ptm-confirmed")} delay={0.1} />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select size="small" label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="declined">Declined</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      <DataTable
        pagination
        pageSize={25}
        rows={rows}
        columns={[
          { key: "studentName", label: "Student" },
          { key: "className", label: "Class" },
          { key: "parentName", label: "Parent" },
          { key: "proposed_date", label: "Date" },
          { key: "proposed_time", label: "Time" },
          { key: "reason", label: "Reason", render: (r) => r.reason ?? "-" },
          { key: "status", label: "Status", render: (r) => <StatusChip status={r.status} /> },
          {
            key: "actions",
            label: "Actions",
            render: (r) => (
              <Box sx={{ display: "flex", gap: 0.5 }}>
                <Button size="small" variant="outlined" color="success" disabled={r.status !== "pending"} onClick={() => updatePTMStatus(r.id, "confirmed")}>
                  Confirm
                </Button>
                <Button size="small" variant="outlined" color="error" disabled={r.status !== "pending"} onClick={() => updatePTMStatus(r.id, "declined")}>
                  Decline
                </Button>
                <Button size="small" variant="outlined" disabled={r.status !== "confirmed"} onClick={() => updatePTMStatus(r.id, "completed", "Meeting held.")}>
                  Mark Completed
                </Button>
              </Box>
            ),
          },
        ]}
        emptyTitle="No meeting requests"
      />
    </>
  );
}
