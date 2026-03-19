import { useMemo } from "react";
import {
  Chip, Grid, Paper, Typography, Box, Stack, MenuItem, TextField, LinearProgress,
} from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { useAuth } from "@/context/AuthContext";
import { parents, getChildrenOfParent, getStudentAttendance, getClassName } from "@/data/mock";

export default function ParentAttendance() {
  const { user, selectedChildId, setSelectedChildId } = useAuth();
  const parent = parents.find((p) => p.id === user?.id);
  const children = parent ? getChildrenOfParent(parent.id) : [];
  const child = children.find((c) => c.id === selectedChildId) ?? children[0];
  const attendance = child ? getStudentAttendance(child.id) : [];

  const sorted = [...attendance].sort((a, b) => b.date.localeCompare(a.date));
  const present = attendance.filter((a) => a.status === "present").length;
  const absent = attendance.filter((a) => a.status === "absent").length;
  const late = attendance.filter((a) => a.status === "late").length;
  const pct = attendance.length > 0 ? Math.round((present / attendance.length) * 100) : 0;

  // Monthly breakdown
  const monthly = useMemo(() => {
    const map = new Map<string, { present: number; absent: number; late: number; total: number }>();
    attendance.forEach((a) => {
      const month = a.date.slice(0, 7); // YYYY-MM
      if (!map.has(month)) map.set(month, { present: 0, absent: 0, late: 0, total: 0 });
      const m = map.get(month)!;
      m.total++;
      if (a.status === "present") m.present++;
      else if (a.status === "absent") m.absent++;
      else m.late++;
    });
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [attendance]);

  return (
    <>
      <PageHeader
        title={`Attendance — ${child?.name ?? ""}`}
        breadcrumbs={[{ label: "Dashboard", to: "/parent" }, { label: "Attendance" }]}
      />

      {children.length > 1 && (
        <TextField
          select size="small" label="Select Child" value={selectedChildId ?? children[0]?.id ?? ""}
          onChange={(e) => setSelectedChildId(e.target.value)}
          sx={{ mb: 2, minWidth: 280 }}
        >
          {children.map((c) => (
            <MenuItem key={c.id} value={c.id}>{c.name} — {getClassName(c.class_id)}</MenuItem>
          ))}
        </TextField>
      )}

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">Attendance %</Typography>
            <Typography variant="h5" fontWeight={700} color={pct >= 85 ? "success.main" : "warning.main"}>{pct}%</Typography>
            <LinearProgress variant="determinate" value={pct} sx={{ mt: 1, height: 6, borderRadius: 3 }} color={pct >= 85 ? "success" : "warning"} />
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">Present</Typography>
            <Typography variant="h5" fontWeight={700} color="success.main">{present}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">Absent</Typography>
            <Typography variant="h5" fontWeight={700} color="error.main">{absent}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">Late</Typography>
            <Typography variant="h5" fontWeight={700} color="warning.main">{late}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Monthly Chart */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>Monthly Breakdown</Typography>
        <Stack spacing={1.5}>
          {monthly.map(([month, stats]) => {
            const monthPct = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
            return (
              <Box key={month}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="body2" fontWeight={500}>{month}</Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip label={`P: ${stats.present}`} size="small" color="success" variant="outlined" />
                    <Chip label={`A: ${stats.absent}`} size="small" color="error" variant="outlined" />
                    {stats.late > 0 && <Chip label={`L: ${stats.late}`} size="small" color="warning" variant="outlined" />}
                    <Typography variant="body2" fontWeight={600}>{monthPct}%</Typography>
                  </Stack>
                </Box>
                <LinearProgress variant="determinate" value={monthPct} sx={{ height: 6, borderRadius: 3 }} color={monthPct >= 85 ? "success" : "warning"} />
              </Box>
            );
          })}
        </Stack>
      </Paper>

      {/* Attendance Records */}
      <DataTable
        columns={[
          { key: "date", label: "Date" },
          {
            key: "status", label: "Status",
            render: (a) => <Chip label={a.status} size="small" color={a.status === "present" ? "success" : a.status === "absent" ? "error" : "warning"} />,
          },
        ]}
        rows={sorted}
      />
    </>
  );
}
