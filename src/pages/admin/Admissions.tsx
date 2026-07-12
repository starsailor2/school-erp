import { useState } from "react";
import {
  Paper, Typography, TextField, Grid, MenuItem, Button, Stack, Divider,
} from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { classes } from "@/demo-data";

export default function Admissions() {
  const [form, setForm] = useState({
    name: "", dob: "", gender: "male", classId: "c1", sectionId: "",
    parentName: "", parentPhone: "", parentOccupation: "", address: "",
  });

  const sections = classes.find((c) => c.id === form.classId)?.sections ?? [];

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <>
      <PageHeader
        title="New Admission"
        breadcrumbs={[
          { label: "Dashboard", to: "/admin" },
          { label: "Students", to: "/admin/students" },
          { label: "Admissions" },
        ]}
      />
      <Paper sx={{ p: 3, maxWidth: 800 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>Student Information</Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Full Name" value={form.name} onChange={handleChange("name")} />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField fullWidth type="date" label="Date of Birth" value={form.dob} onChange={handleChange("dob")} slotProps={{ inputLabel: { shrink: true } }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField fullWidth select label="Gender" value={form.gender} onChange={handleChange("gender")}>
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField fullWidth select label="Class" value={form.classId}
              onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value, sectionId: "" }))}>
              {classes.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField fullWidth select label="Section" value={form.sectionId} onChange={handleChange("sectionId")}>
              {sections.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
            </TextField>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>Parent/Guardian Information</Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Parent Name" value={form.parentName} onChange={handleChange("parentName")} />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField fullWidth label="Phone" value={form.parentPhone} onChange={handleChange("parentPhone")} />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField fullWidth label="Occupation" value={form.parentOccupation} onChange={handleChange("parentOccupation")} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth label="Address" value={form.address} onChange={handleChange("address")} multiline rows={2} />
          </Grid>
        </Grid>

        <Stack direction="row" spacing={2}>
          <Button variant="contained">Submit Admission</Button>
          <Button variant="outlined">Reset</Button>
        </Stack>
      </Paper>
    </>
  );
}
