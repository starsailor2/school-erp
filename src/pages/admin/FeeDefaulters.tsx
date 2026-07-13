import { useMemo, useState } from "react";
import { Chip, Button, Grid, MenuItem, TextField, Paper, Typography, Stack, Box } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import GavelIcon from "@mui/icons-material/Gavel";
import PhoneIcon from "@mui/icons-material/Phone";
import EventIcon from "@mui/icons-material/Event";
import type { SvgIconComponent } from "@mui/icons-material";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { PipelineStepper, type PipelineStep } from "@/components/PipelineStepper";
import { SeverityAvatar, type Severity } from "@/components/SeverityAvatar";
import { MetaChip } from "@/components/MetaChip";
import { fees, students, getClassName } from "@/demo-data";

type Stage = "reminder" | "notice" | "penalty" | "escalate";
const STAGE_ORDER: Stage[] = ["reminder", "notice", "penalty", "escalate"];
const STAGE_META: Record<Stage, { label: string; icon: SvgIconComponent; severity: Severity }> = {
  reminder: { label: "Reminder", icon: NotificationsActiveIcon, severity: "warning" },
  notice: { label: "Notice", icon: WarningAmberIcon, severity: "warning" },
  penalty: { label: "Penalty", icon: ReportProblemIcon, severity: "serious" },
  escalate: { label: "Escalate", icon: GavelIcon, severity: "critical" },
};

function stageFor(overdueDays: number): Stage {
  if (overdueDays >= 31) return "escalate";
  if (overdueDays >= 16) return "penalty";
  if (overdueDays >= 8) return "notice";
  return "reminder";
}

export default function FeeDefaulters() {
  const [classFilter, setClassFilter] = useState("all");

  const rows = useMemo(
    () =>
      fees
        .filter((f) => f.status === "overdue")
        .map((f) => {
          const student = students.find((s) => s.id === f.student_id);
          const today = new Date();
          const dueDate = new Date(f.due_date);
          const overdueDays = Math.max(0, Math.ceil((+today - +dueDate) / (1000 * 60 * 60 * 24)));
          return {
            ...f,
            studentName: student?.name ?? "—",
            className: student ? getClassName(student.class_id) : "—",
            phone: student?.phone ?? "—",
            overdueDays,
            stage: stageFor(overdueDays),
          };
        })
        .filter((row) => classFilter === "all" || row.className === classFilter),
    [classFilter]
  );

  const classNames = Array.from(new Set(students.map((s) => getClassName(s.class_id))));
  const totalOutstanding = rows.reduce((s, r) => s + r.amount, 0);
  const maxStageIndex = rows.reduce((max, r) => Math.max(max, STAGE_ORDER.indexOf(r.stage)), -1);
  const escalationSteps: PipelineStep[] = STAGE_ORDER.map((stage, i) => ({
    label: STAGE_META[stage].label,
    status: i < maxStageIndex ? "done" : i === maxStageIndex ? "active" : "pending",
    detail: `${rows.filter((r) => r.stage === stage).length} students`,
  }));

  return (
    <>
      <PageHeader
        title="Fee Defaulters"
        breadcrumbs={[
          { label: "Dashboard", to: "/admin" },
          { label: "Fees", to: "/admin/fees" },
          { label: "Defaulters" },
        ]}
      />

      <Paper sx={{ p: 2.5, mb: 2 }}>
        <Typography variant="overline" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
          Defaulters · Grace period over
        </Typography>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          {rows.length} students · ₹{totalOutstanding.toLocaleString()} outstanding
        </Typography>
        {rows.length > 0 && <PipelineStepper steps={escalationSteps} />}
      </Paper>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select size="small" label="Class" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
            <MenuItem value="all">All Classes</MenuItem>
            {classNames.map((name) => <MenuItem key={name} value={name}>{name}</MenuItem>)}
          </TextField>
        </Grid>
      </Grid>

      <DataTable
        pagination
        pageSize={25}
        columns={[
          {
            key: "studentName", label: "Student",
            render: (f) => {
              const StageIcon = STAGE_META[f.stage].icon;
              return (
                <Stack direction="row" alignItems="center" spacing={1.25}>
                  <SeverityAvatar severity={STAGE_META[f.stage].severity} icon={<StageIcon fontSize="small" />} size={32} />
                  <Box>
                    <Typography variant="body2" fontWeight={500}>{f.studentName}</Typography>
                    <Typography variant="caption" color="text.secondary">{f.className}</Typography>
                  </Box>
                </Stack>
              );
            },
          },
          { key: "fee_type", label: "Type" },
          { key: "amount", label: "Amount", render: (f) => `₹${f.amount.toLocaleString()}` },
          {
            key: "details", label: "Details",
            render: (f) => (
              <Stack direction="row" flexWrap="wrap" useFlexGap spacing={0.5}>
                <MetaChip icon={<PhoneIcon />} label={f.phone} />
                <MetaChip icon={<EventIcon />} label={f.due_date} />
                <MetaChip icon={<WarningAmberIcon />} label={`${f.overdueDays}d overdue`} tone="muted" />
              </Stack>
            ),
          },
          { key: "stage", label: "Stage", render: (f) => <Chip label={STAGE_META[f.stage].label} size="small" /> },
          { key: "actions", label: "Actions", render: () => <Button size="small" variant="outlined">Send Reminder</Button> },
        ]}
        rows={rows}
      />
    </>
  );
}
