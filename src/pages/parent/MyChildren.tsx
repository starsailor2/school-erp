import { useState } from "react";
import {
  Avatar, Paper, Typography, Grid, Chip, Stack, Box, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, LinearProgress,
} from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import {
  parents, getChildrenOfParent, getClassName, getStudentMarks,
  getStudentAttendance, getStudentFees, getSubjectName,
} from "@/demo-data";
import type { Student } from "@/types";

export default function MyChildren() {
  const { user, setSelectedChildId } = useAuth();
  const parent = parents.find((p) => p.id === user?.id);
  const children = parent ? getChildrenOfParent(parent.id) : [];
  const [viewChild, setViewChild] = useState<Student | null>(null);

  const childDetail = viewChild ? (() => {
    const marks = getStudentMarks(viewChild.id);
    const att = getStudentAttendance(viewChild.id);
    const present = att.filter((a) => a.status === "present").length;
    const attPct = att.length > 0 ? Math.round((present / att.length) * 100) : 0;
    const fees = getStudentFees(viewChild.id);
    const totalFee = fees.reduce((s, f) => s + f.amount, 0);
    const paidFee = fees.filter((f) => f.status === "paid").reduce((s, f) => s + f.amount, 0);
    return { marks, attPct, totalFee, paidFee, feesPending: totalFee - paidFee };
  })() : null;

  return (
    <>
      <PageHeader title="My Children" breadcrumbs={[{ label: "Dashboard", to: "/parent" }, { label: "My Children" }]} />
      <Grid container spacing={2}>
        {children.map((c) => (
          <Grid size={{ xs: 12, sm: 6 }} key={c.id}>
            <Paper
              sx={{ p: 3, cursor: "pointer", "&:hover": { boxShadow: 4 }, transition: "box-shadow 0.2s" }}
              onClick={() => setViewChild(c)}
            >
              <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
                <Avatar sx={{ width: 48, height: 48, bgcolor: "primary.main" }}>{c.name.charAt(0)}</Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>{c.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{c.admission_number}</Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 1.5 }} />
              <Stack spacing={1}>
                <Row label="Class" value={getClassName(c.class_id)} />
                <Row label="Roll No." value={c.roll_number} />
                <Row label="Attendance" value={<Chip label={`${c.attendance_pct}%`} size="small" color={c.attendance_pct >= 85 ? "success" : "warning"} />} />
                <Row label="Fees" value={<Chip label={c.fee_status} size="small" color={c.fee_status === "paid" ? "success" : "error"} />} />
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Student Profile Modal */}
      <Dialog open={!!viewChild} onClose={() => setViewChild(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Student Profile</DialogTitle>
        <DialogContent>
          {viewChild && childDetail && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: "primary.main", fontSize: 24 }}>{viewChild.name.charAt(0)}</Avatar>
                <Box>
                  <Typography variant="h6">{viewChild.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getClassName(viewChild.class_id)} · Roll #{viewChild.roll_number} · {viewChild.admission_number}
                  </Typography>
                </Box>
              </Box>
              <Divider />
              <Grid container spacing={2}>
                <Grid size={6}><Row label="Gender" value={viewChild.gender} /></Grid>
                <Grid size={6}><Row label="DOB" value={viewChild.date_of_birth} /></Grid>
                <Grid size={6}><Row label="Blood Group" value={viewChild.blood_group} /></Grid>
                <Grid size={6}><Row label="Phone" value={viewChild.phone} /></Grid>
              </Grid>
              <Divider />
              <Typography variant="subtitle2">Attendance</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <LinearProgress variant="determinate" value={childDetail.attPct} sx={{ flex: 1, height: 8, borderRadius: 4 }} color={childDetail.attPct >= 85 ? "success" : "warning"} />
                <Typography variant="body2" fontWeight={600}>{childDetail.attPct}%</Typography>
              </Box>
              <Typography variant="subtitle2">Recent Marks</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {childDetail.marks.slice(0, 6).map((m) => (
                  <Chip key={m.id} label={`${getSubjectName(m.subject_id)}: ${m.marks_obtained}/${m.max_marks}`} size="small" variant="outlined" />
                ))}
                {childDetail.marks.length === 0 && <Typography variant="body2" color="text.secondary">No marks yet</Typography>}
              </Stack>
              <Typography variant="subtitle2">Fee Summary</Typography>
              <Stack direction="row" spacing={2}>
                <Chip label={`Total: ₹${childDetail.totalFee.toLocaleString()}`} size="small" variant="outlined" />
                <Chip label={`Paid: ₹${childDetail.paidFee.toLocaleString()}`} size="small" color="success" />
                {childDetail.feesPending > 0 && <Chip label={`Pending: ₹${childDetail.feesPending.toLocaleString()}`} size="small" color="error" />}
              </Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewChild(null)}>Close</Button>
          <Button variant="contained" onClick={() => { if (viewChild) { setSelectedChildId(viewChild.id); setViewChild(null); } }}>
            Switch to this Child
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={500}>{value}</Typography>
    </Box>
  );
}
