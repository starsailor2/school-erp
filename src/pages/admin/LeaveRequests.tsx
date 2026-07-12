import { useEffect, useState } from "react";
import { Grid, MenuItem, TextField, Button, Box } from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import StatusChip from "@/components/StatusChip";
import { StatCard } from "@/components/StatCard";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { getIconAccent } from "@/theme/chartPalette";
import { useColorMode } from "@/context/ColorModeContext";
import { getLeaveRequests, reviewLeaveRequest } from "@/demo-data/staffOps/leaveStore";
import { teachers, staffMembers } from "@/demo-data";

function applicantName(id: string, role: "teacher" | "staff") {
  if (role === "teacher") return teachers.find((t) => t.id === id)?.name ?? id;
  return staffMembers.find((s) => s.id === id)?.name ?? id;
}

export default function LeaveRequests() {
  const { mode } = useColorMode();
  const [, setRefresh] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    const onUpdate = () => setRefresh((v) => v + 1);
    window.addEventListener("erp-leave-requests-updated", onUpdate);
    return () => window.removeEventListener("erp-leave-requests-updated", onUpdate);
  }, []);

  const all = getLeaveRequests();
  const rows = all
    .filter((r) => statusFilter === "all" || r.status === statusFilter)
    .filter((r) => roleFilter === "all" || r.applicant_role === roleFilter)
    .map((r) => ({ ...r, applicantName: applicantName(r.applicant_id, r.applicant_role) }))
    .sort((a, b) => b.applied_date.localeCompare(a.applied_date));

  const pending = all.filter((r) => r.status === "pending").length;
  const approved = all.filter((r) => r.status === "approved").length;
  const rejected = all.filter((r) => r.status === "rejected").length;

  return (
    <>
      <PageHeader
        title="Leave Requests"
        breadcrumbs={[{ label: "Dashboard", to: "/admin" }, { label: "School Staff", to: "/admin/staff" }, { label: "Leave Requests" }]}
      />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard title="Total Requests" value={all.length} numericValue={all.length} icon={<EventBusyIcon />} color={getIconAccent(mode, "leave-total")} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard title="Pending Review" value={pending} numericValue={pending} icon={<HourglassEmptyIcon />} color={getIconAccent(mode, "leave-pending")} delay={0.05} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard title="Approved" value={approved} numericValue={approved} icon={<CheckCircleIcon />} color={getIconAccent(mode, "leave-approved")} delay={0.1} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard title="Rejected" value={rejected} numericValue={rejected} icon={<CancelIcon />} color={getIconAccent(mode, "leave-rejected")} delay={0.15} />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select size="small" label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select size="small" label="Role" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="teacher">Teacher</MenuItem>
            <MenuItem value="staff">Staff</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      <DataTable
        pagination
        pageSize={25}
        rows={rows}
        columns={[
          { key: "applicantName", label: "Applicant" },
          { key: "applicant_role", label: "Role", render: (r) => r.applicant_role },
          { key: "leave_type", label: "Type", render: (r) => r.leave_type.replace("_", " ") },
          { key: "start_date", label: "From" },
          { key: "end_date", label: "To" },
          { key: "reason", label: "Reason" },
          { key: "status", label: "Status", render: (r) => <StatusChip status={r.status} /> },
          {
            key: "actions",
            label: "Actions",
            render: (r) => (
              <Box sx={{ display: "flex", gap: 0.5 }}>
                <Button
                  size="small" variant="outlined" color="success"
                  disabled={r.status !== "pending"}
                  onClick={() => reviewLeaveRequest(r.id, "approved", "admin")}
                >
                  Approve
                </Button>
                <Button
                  size="small" variant="outlined" color="error"
                  disabled={r.status !== "pending"}
                  onClick={() => reviewLeaveRequest(r.id, "rejected", "admin", "Not approved by administration.")}
                >
                  Reject
                </Button>
              </Box>
            ),
          },
        ]}
      />
    </>
  );
}
