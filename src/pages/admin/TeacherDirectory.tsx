import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField, InputAdornment, Grid, Chip, Avatar, Box, Button, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { teachers, subjects, getSubjectName } from "@/data/mock";
import type { Teacher } from "@/types";

export default function TeacherDirectory() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = teachers.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.department.toLowerCase().includes(search.toLowerCase())
  );

  const typeColor = (type: string) =>
    type === "hod" ? "error" : type === "class_teacher" ? "primary" : "default";

  return (
    <>
      <PageHeader
        title="Teacher Directory"
        breadcrumbs={[
          { label: "Dashboard", to: "/admin" },
          { label: "Teachers" },
        ]}
        action={<Button variant="contained" size="small" onClick={() => setOpen(true)}>Add Teacher</Button>}
      />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth size="small" placeholder="Search teachers..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
          />
        </Grid>
      </Grid>
      <DataTable<Teacher>
        columns={[
          {
            key: "name", label: "Teacher",
            render: (t) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: "primary.main" }}>{t.name.charAt(0)}</Avatar>
                {t.name}
              </Box>
            ),
          },
          { key: "department", label: "Department" },
          { key: "subjects", label: "Subjects", render: (t) => t.subjects.map(getSubjectName).join(", ") },
          {
            key: "teacher_type", label: "Type",
            render: (t) => <Chip label={t.teacher_type.replace("_", " ")} size="small" color={typeColor(t.teacher_type)} />,
          },
          { key: "assigned_classes", label: "Classes", render: (t) => t.assigned_classes.join(", ") },
        ]}
        rows={filtered}
        onRowClick={(t) => navigate(`/admin/teachers/${t.id}`)}
      />

      {/* Add Teacher Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Teacher</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Full Name" fullWidth size="small" />
            <TextField label="Email" fullWidth size="small" type="email" />
            <TextField label="Phone" fullWidth size="small" />
            <TextField select label="Department" fullWidth size="small" defaultValue="">
              {[...new Set(subjects.map((s) => s.department))].map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </TextField>
            <TextField select label="Teacher Type" fullWidth size="small" defaultValue="subject_teacher">
              <MenuItem value="subject_teacher">Subject Teacher</MenuItem>
              <MenuItem value="class_teacher">Class Teacher</MenuItem>
              <MenuItem value="hod">HOD</MenuItem>
            </TextField>
            <TextField select label="Subjects" fullWidth size="small" defaultValue="" SelectProps={{ multiple: true }}>
              {subjects.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpen(false)}>Add Teacher</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
