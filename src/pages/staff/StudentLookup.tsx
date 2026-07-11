import { useState } from "react";
import { TextField, InputAdornment, Grid, Avatar, Box, Paper, Typography, Stack, Chip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { students, parents, getClassName, getStudentAttendance } from "@/demo-data";

export default function StudentLookup() {
  const [search, setSearch] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.admission_number.toLowerCase().includes(search.toLowerCase())
  );

  const selected = students.find((s) => s.id === selectedStudentId) ?? filtered[0] ?? null;
  const parent = selected ? parents.find((p) => p.id === selected.parent_id) : undefined;
  const attendanceSummary = selected
    ? getStudentAttendance(selected.id).reduce(
        (acc, row) => {
          acc.total += 1;
          if (row.status === "present") acc.present += 1;
          return acc;
        },
        { present: 0, total: 0 },
      )
    : { present: 0, total: 0 };
  const attendancePct = attendanceSummary.total
    ? Math.round((attendanceSummary.present / attendanceSummary.total) * 100)
    : 0;

  return (
    <>
      <PageHeader
        title="Student Lookup"
        breadcrumbs={[{ label: "Dashboard", to: "/staff" }, { label: "Students" }]}
      />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth size="small" placeholder="Search by name or admission no."
            value={search} onChange={(e) => setSearch(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
          />
        </Grid>
      </Grid>
      <DataTable
        pagination
        pageSize={25}
        columns={[
          {
            key: "name", label: "Student",
            render: (s) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>{s.name.charAt(0)}</Avatar>
                {s.name}
              </Box>
            ),
          },
          { key: "admission_number", label: "Adm. No." },
          { key: "class_id", label: "Class", render: (s) => getClassName(s.class_id) },
          { key: "roll_number", label: "Roll No." },
          {
            key: "fee_status",
            label: "Fee",
            render: (s) => (
              <Chip
                size="small"
                label={s.fee_status}
                color={s.fee_status === "paid" ? "success" : s.fee_status === "pending" ? "warning" : "error"}
              />
            ),
          },
        ]}
        rows={filtered}
        onRowClick={(row) => setSelectedStudentId((row as { id: string }).id)}
      />

      {selected && (
        <Paper sx={{ mt: 2, p: 2 }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Student Profile Snapshot
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">Student</Typography>
                <Typography variant="body2" fontWeight={600}>{selected.name}</Typography>
                <Typography variant="body2">Admission: {selected.admission_number}</Typography>
                <Typography variant="body2">Class: {getClassName(selected.class_id)} {selected.section_id.split("-").pop()}</Typography>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">Parent Details</Typography>
                <Typography variant="body2" fontWeight={600}>{parent?.name ?? "-"}</Typography>
                <Typography variant="body2">Phone: {parent?.phone ?? "-"}</Typography>
                <Typography variant="body2">Email: {parent?.email ?? "-"}</Typography>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">Status</Typography>
                <Typography variant="body2">Attendance: {attendancePct}% ({attendanceSummary.present}/{attendanceSummary.total})</Typography>
                <Typography variant="body2">Fee Status: {selected.fee_status}</Typography>
                <Typography variant="body2">Blood Group: {selected.blood_group}</Typography>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      )}
    </>
  );
}
