import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField, InputAdornment, MenuItem, Grid, Chip, Avatar, Box,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import StatusChip from "@/components/StatusChip";
import { CategoryTag } from "@/components/CategoryTag";
import { students, classes, getClassName } from "@/demo-data";
import type { Student } from "@/types";

export default function StudentDirectory() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");

  const filtered = students.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.admission_number.toLowerCase().includes(search.toLowerCase());
    const matchClass = classFilter === "all" || s.class_id === classFilter;
    return matchSearch && matchClass;
  });

  return (
    <>
      <PageHeader
        title="Student Directory"
        breadcrumbs={[
          { label: "Dashboard", to: "/admin" },
          { label: "Students" },
        ]}
      />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth size="small"
            placeholder="Search by name or admission no."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField
            fullWidth select size="small"
            label="Class"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
          >
            <MenuItem value="all">All Classes</MenuItem>
            {classes.map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      <DataTable<Student>
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
          {
            key: "class_id", label: "Class",
            render: (s) => <CategoryTag label={getClassName(s.class_id).replace("Class ", "C")} fullName={getClassName(s.class_id)} />,
          },
          { key: "roll_number", label: "Roll No." },
          { key: "gender", label: "Gender", render: (s) => s.gender.charAt(0).toUpperCase() + s.gender.slice(1) },
          {
            key: "attendance_pct", label: "Attendance",
            render: (s) => <Chip label={`${s.attendance_pct}%`} size="small" color={s.attendance_pct >= 85 ? "success" : s.attendance_pct >= 75 ? "warning" : "error"} />,
          },
          {
            key: "fee_status", label: "Fees",
            render: (s) => <StatusChip status={s.fee_status} />,
          },
        ]}
        rows={filtered}
        onRowClick={(s) => navigate(`/admin/students/${s.id}`)}
      />
    </>
  );
}
