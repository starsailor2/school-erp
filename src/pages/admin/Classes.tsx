import { useMemo, useState } from "react";
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem,
  Paper, TextField, Typography, Chip,
} from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { classes } from "@/demo-data";
import type { SchoolClass } from "@/types";

export default function Classes() {
  const [rows, setRows] = useState<SchoolClass[]>(classes);
  const [query, setQuery] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    academic_year: "2025-26",
    sections: "A,B",
  });

  const years = Array.from(new Set(rows.map((c) => c.academic_year)));

  const displayRows = useMemo(
    () => rows
      .filter((c) => yearFilter === "all" || c.academic_year === yearFilter)
      .filter((c) => `${c.name} ${c.academic_year}`.toLowerCase().includes(query.toLowerCase()))
      .map((c) => ({
        ...c,
        sectionCount: c.sections.length,
        totalStudents: c.sections.reduce((s, sec) => s + sec.student_count, 0),
        sectionNames: c.sections.map((s) => s.name).join(", "),
      })),
    [rows, query, yearFilter]
  );

  const totalSections = displayRows.reduce((sum, c) => sum + c.sectionCount, 0);
  const totalStudents = displayRows.reduce((sum, c) => sum + c.totalStudents, 0);

  const handleAddClass = () => {
    if (!form.name.trim()) return;
    const id = `c${rows.length + 1}`;
    const sectionTokens = form.sections
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    const newClass: SchoolClass = {
      id,
      name: form.name.trim(),
      academic_year: form.academic_year,
      sections: sectionTokens.map((sectionName, index) => ({
        id: `${id}-s${index}`,
        class_id: id,
        name: sectionName,
        class_teacher_id: undefined,
        student_count: 0,
      })),
    };

    setRows((prev) => [...prev, newClass]);
    setOpen(false);
    setForm({ name: "", academic_year: "2025-26", sections: "A,B" });
  };

  return (
    <>
      <PageHeader
        title="Classes"
        breadcrumbs={[
          { label: "Dashboard", to: "/admin" },
          { label: "Academics" },
          { label: "Classes" },
        ]}
        action={<Button variant="contained" size="small" onClick={() => setOpen(true)}>Add Class</Button>}
      />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <TextField
            fullWidth
            size="small"
            label="Search class"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            select
            size="small"
            label="Academic Year"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
          >
            <MenuItem value="all">All Years</MenuItem>
            {years.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 1.5, display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center", height: "100%" }}>
            <Typography variant="body2" color="text.secondary">Summary</Typography>
            <Chip label={`${displayRows.length} classes`} size="small" color="primary" />
            <Chip label={`${totalSections} sections`} size="small" />
            <Chip label={`${totalStudents} students`} size="small" color="success" />
          </Paper>
        </Grid>
      </Grid>

      <DataTable
        columns={[
          { key: "name", label: "Class" },
          { key: "academic_year", label: "Academic Year" },
          { key: "sectionCount", label: "Sections" },
          { key: "sectionNames", label: "Section Names" },
          { key: "totalStudents", label: "Total Students" },
        ]}
        rows={displayRows}
      />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Class</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Class Name"
                placeholder="Class 13"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Academic Year"
                value={form.academic_year}
                onChange={(e) => setForm((prev) => ({ ...prev, academic_year: e.target.value }))}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Sections"
                helperText="Comma separated, example: A,B,C"
                value={form.sections}
                onChange={(e) => setForm((prev) => ({ ...prev, sections: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddClass}>Add</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
