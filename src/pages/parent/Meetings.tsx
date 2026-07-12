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
import EventIcon from "@mui/icons-material/Event";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { getIconAccent } from "@/theme/chartPalette";
import { useColorMode } from "@/context/ColorModeContext";
import { useAuth } from "@/context/AuthContext";
import { getPTMs, requestPTM } from "@/demo-data/communication/ptmStore";
import { getChildrenOfParent, getClassName } from "@/demo-data";
import { getTeacherName } from "@/demo-data/people/teachers";
import { classes } from "@/demo-data/academics/classes";

export default function ParentMeetings() {
  const { user } = useAuth();
  const { mode } = useColorMode();
  const [, setRefresh] = useState(0);
  const children = getChildrenOfParent(user.id);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ studentId: children[0]?.id ?? "", proposedDate: "", proposedTime: "10:00", reason: "" });

  useEffect(() => {
    const onUpdate = () => setRefresh((v) => v + 1);
    window.addEventListener("erp-ptm-updated", onUpdate);
    return () => window.removeEventListener("erp-ptm-updated", onUpdate);
  }, []);

  const classTeacherFor = (studentId: string) => {
    const child = children.find((c) => c.id === studentId);
    if (!child) return undefined;
    return classes.find((c) => c.id === child.class_id)?.sections.find((s) => s.id === child.section_id)?.class_teacher_id;
  };

  const rows = getPTMs()
    .filter((m) => m.parent_id === user.id)
    .map((m) => ({
      ...m,
      studentName: children.find((c) => c.id === m.student_id)?.name ?? m.student_id,
      teacherName: getTeacherName(m.teacher_id),
      className: (() => {
        const child = children.find((c) => c.id === m.student_id);
        return child ? getClassName(child.class_id) : "-";
      })(),
    }))
    .sort((a, b) => b.proposed_date.localeCompare(a.proposed_date));

  const pending = rows.filter((r) => r.status === "pending").length;
  const confirmed = rows.filter((r) => r.status === "confirmed").length;

  const submit = () => {
    const teacherId = classTeacherFor(form.studentId);
    if (!teacherId || !form.proposedDate) return;
    requestPTM({
      teacherId,
      parentId: user.id,
      studentId: form.studentId,
      requestedBy: "parent",
      proposedDate: form.proposedDate,
      proposedTime: form.proposedTime,
      reason: form.reason.trim() || undefined,
    });
    setOpen(false);
    setForm({ studentId: children[0]?.id ?? "", proposedDate: "", proposedTime: "10:00", reason: "" });
  };

  return (
    <>
      <PageHeader
        title="Parent-Teacher Meetings"
        breadcrumbs={[{ label: "Dashboard", to: "/parent" }, { label: "Meetings" }]}
        action={<Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setOpen(true)} disabled={children.length === 0}>Request Meeting</Button>}
      />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 6, sm: 4 }}>
          <StatCard title="Total Requests" value={rows.length} numericValue={rows.length} icon={<EventIcon />} color={getIconAccent(mode, "ptm-total")} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4 }}>
          <StatCard title="Pending" value={pending} numericValue={pending} icon={<HourglassEmptyIcon />} color={getIconAccent(mode, "ptm-pending")} delay={0.05} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4 }}>
          <StatCard title="Confirmed" value={confirmed} numericValue={confirmed} icon={<CheckCircleIcon />} color={getIconAccent(mode, "ptm-confirmed")} delay={0.1} />
        </Grid>
      </Grid>

      <DataTable
        pagination
        pageSize={25}
        rows={rows}
        columns={[
          { key: "studentName", label: "Child" },
          { key: "className", label: "Class" },
          { key: "teacherName", label: "Teacher" },
          { key: "proposed_date", label: "Date" },
          { key: "proposed_time", label: "Time" },
          { key: "reason", label: "Reason", render: (r) => r.reason ?? "-" },
          { key: "status", label: "Status", render: (r) => <StatusChip status={r.status} /> },
        ]}
        emptyTitle="No meeting requests yet"
        emptyDescription="Request a meeting with your child's class teacher to discuss progress."
      />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request Parent-Teacher Meeting</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select fullWidth label="Child" value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
            >
              {children.map((c) => <MenuItem key={c.id} value={c.id}>{c.name} — {getClassName(c.class_id)}</MenuItem>)}
            </TextField>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth type="date" label="Preferred Date" InputLabelProps={{ shrink: true }}
                value={form.proposedDate} onChange={(e) => setForm({ ...form, proposedDate: e.target.value })}
              />
              <TextField
                select fullWidth label="Preferred Time" value={form.proposedTime}
                onChange={(e) => setForm({ ...form, proposedTime: e.target.value })}
              >
                {["10:00", "11:00", "14:00", "15:00", "16:00"].map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
            </Stack>
            <TextField
              fullWidth multiline rows={3} label="Reason (optional)"
              value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submit}>Send Request</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
