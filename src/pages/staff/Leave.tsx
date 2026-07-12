import { useEffect, useState } from "react";
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Grid, Stack,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import StatusChip from "@/components/StatusChip";
import { StatCard } from "@/components/StatCard";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { getIconAccent } from "@/theme/chartPalette";
import { useColorMode } from "@/context/ColorModeContext";
import { useAuth } from "@/context/AuthContext";
import { getLeaveRequestsFor, applyForLeave } from "@/demo-data/staffOps/leaveStore";
import type { LeaveType } from "@/types";

const LEAVE_TYPES: { value: LeaveType; label: string }[] = [
  { value: "sick", label: "Sick Leave" },
  { value: "casual", label: "Casual Leave" },
  { value: "earned", label: "Earned Leave" },
  { value: "unpaid", label: "Unpaid Leave" },
];

export default function StaffLeave() {
  const { user } = useAuth();
  const { mode } = useColorMode();
  const [, setRefresh] = useState(0);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ leaveType: "casual" as LeaveType, startDate: "", endDate: "", reason: "" });

  useEffect(() => {
    const onUpdate = () => setRefresh((v) => v + 1);
    window.addEventListener("erp-leave-requests-updated", onUpdate);
    return () => window.removeEventListener("erp-leave-requests-updated", onUpdate);
  }, []);

  const rows = getLeaveRequestsFor(user.id).sort((a, b) => b.applied_date.localeCompare(a.applied_date));
  const pending = rows.filter((r) => r.status === "pending").length;
  const approved = rows.filter((r) => r.status === "approved").length;

  const submit = () => {
    if (!form.startDate || !form.endDate || !form.reason.trim()) return;
    applyForLeave({
      applicantId: user.id,
      applicantRole: "staff",
      leaveType: form.leaveType,
      startDate: form.startDate,
      endDate: form.endDate,
      reason: form.reason.trim(),
    });
    setOpen(false);
    setForm({ leaveType: "casual", startDate: "", endDate: "", reason: "" });
  };

  return (
    <>
      <PageHeader
        title="My Leave"
        breadcrumbs={[{ label: "Dashboard", to: "/staff" }, { label: "Leave" }]}
        action={<Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Apply for Leave</Button>}
      />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 6, sm: 4 }}>
          <StatCard title="Total Requests" value={rows.length} numericValue={rows.length} icon={<EventBusyIcon />} color={getIconAccent(mode, "leave-total")} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4 }}>
          <StatCard title="Pending" value={pending} numericValue={pending} icon={<HourglassEmptyIcon />} color={getIconAccent(mode, "leave-pending")} delay={0.05} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4 }}>
          <StatCard title="Approved" value={approved} numericValue={approved} icon={<CheckCircleIcon />} color={getIconAccent(mode, "leave-approved")} delay={0.1} />
        </Grid>
      </Grid>

      <DataTable
        pagination
        pageSize={25}
        rows={rows}
        columns={[
          { key: "leave_type", label: "Type", render: (r) => r.leave_type.replace("_", " ") },
          { key: "start_date", label: "From" },
          { key: "end_date", label: "To" },
          { key: "reason", label: "Reason" },
          { key: "applied_date", label: "Applied On" },
          { key: "status", label: "Status", render: (r) => <StatusChip status={r.status} /> },
          { key: "review_note", label: "Note", render: (r) => r.review_note ?? "-" },
        ]}
      />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Apply for Leave</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select fullWidth label="Leave Type" value={form.leaveType}
              onChange={(e) => setForm({ ...form, leaveType: e.target.value as LeaveType })}
            >
              {LEAVE_TYPES.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
            </TextField>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth type="date" label="From" InputLabelProps={{ shrink: true }}
                value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
              <TextField
                fullWidth type="date" label="To" InputLabelProps={{ shrink: true }}
                value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </Stack>
            <TextField
              fullWidth multiline rows={3} label="Reason"
              value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submit}>Submit Request</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
