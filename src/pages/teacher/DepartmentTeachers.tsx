import { useState } from "react";
import {
  Paper, Typography, Box, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Avatar, Chip, Stack, TextField, Grid,
} from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { useAuth } from "@/context/AuthContext";
import { teachers, getSubjectName, getTeacherClasses, getClassName } from "@/demo-data";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import type { Teacher } from "@/types";

export default function DepartmentTeachers() {
  const { user } = useAuth();
  const teacher = teachers.find((t) => t.id === user?.id);
  const department = teacher?.department ?? "";

  const deptTeachers = teachers.filter((t) => t.department === department);

  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState<Teacher | null>(null);
  const [search, setSearch] = useState("");

  const filtered = search
    ? deptTeachers.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
    : deptTeachers;

  const columns = [
    {
      key: "name", label: "Teacher",
      render: (row: Teacher) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32 }}>{row.name[0]}</Avatar>
          {row.name}
        </Box>
      ),
    },
    {
      key: "subjects", label: "Subjects",
      render: (row: Teacher) => (
        <Stack direction="row" spacing={0.5} flexWrap="wrap">
          {row.subjects.map((sid) => (
            <Chip key={sid} label={getSubjectName(sid)} size="small" />
          ))}
        </Stack>
      ),
    },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    {
      key: "designation", label: "Role",
      render: (row: Teacher) => (
        <Chip
          label={row.designation}
          size="small"
          color={row.designation === "HOD" ? "primary" : row.designation === "Senior Teacher" ? "info" : "default"}
        />
      ),
    },
    {
      key: "actions", label: "Actions",
      render: (row: Teacher) => (
        <Button
          size="small"
          onClick={(e) => { e.stopPropagation(); setSelected(row); setViewOpen(true); }}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Department Teachers"
        breadcrumbs={[
          { label: "Dashboard", to: "/teacher" },
          { label: "Department", to: "/teacher/department" },
          { label: "Department Teachers" },
        ]}
      />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth size="small" label="Search teacher..." value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 8 }}>
          <Paper sx={{ p: 1.5, display: "flex", gap: 3 }}>
            <Typography variant="body2"><strong>{department}</strong> Department</Typography>
            <Typography variant="body2">{deptTeachers.length} Teachers</Typography>
          </Paper>
        </Grid>
      </Grid>

      <DataTable
        rows={filtered}
        columns={columns}
      />

      {/* View Teacher Detail */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Teacher Details</DialogTitle>
        <DialogContent dividers>
          {selected && (
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Avatar sx={{ width: 64, height: 64, bgcolor: "primary.main" }}>
                  <PersonIcon sx={{ fontSize: 36 }} />
                </Avatar>
                <Box>
                  <Typography variant="h6">{selected.name}</Typography>
                  <Chip label={selected.designation} size="small" color="primary" />
                </Box>
              </Box>

              <Stack spacing={1.5}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <EmailIcon fontSize="small" color="action" />
                  <Typography variant="body2">{selected.email}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PhoneIcon fontSize="small" color="action" />
                  <Typography variant="body2">{selected.phone}</Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" gutterBottom>Subjects</Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap">
                    {selected.subjects.map((sid) => (
                      <Chip key={sid} label={getSubjectName(sid)} size="small" />
                    ))}
                  </Stack>
                </Box>

                <Box>
                  <Typography variant="subtitle2" gutterBottom>Assigned Classes</Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap">
                    {getTeacherClasses(selected.id).map((alloc) => (
                      <Chip
                        key={alloc.id}
                        label={`${getClassName(alloc.class_id)} — ${getSubjectName(alloc.subject_id)}`}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </Box>

                <Box>
                  <Typography variant="subtitle2">Department</Typography>
                  <Typography variant="body2" color="text.secondary">{selected.department}</Typography>
                </Box>
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
