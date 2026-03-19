import { useMemo, useState } from "react";
import {
  Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid,
  IconButton, MenuItem, Paper, Stack, TextField, Tooltip, Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";

interface FeeStructureItem {
  id: number;
  type: string;
  amount: number;
  frequency: "Monthly" | "Quarterly" | "Annual" | "Per Exam";
  classes: string;
}

export default function FeeStructure() {
  const [structure, setStructure] = useState<FeeStructureItem[]>([
    { id: 1, type: "Tuition Fee", amount: 5000, frequency: "Monthly", classes: "All" },
    { id: 2, type: "Transport Fee", amount: 2000, frequency: "Monthly", classes: "Route Users" },
    { id: 3, type: "Lab Fee", amount: 1500, frequency: "Quarterly", classes: "Class 6-12" },
    { id: 4, type: "Library Fee", amount: 500, frequency: "Annual", classes: "All" },
    { id: 5, type: "Sports Fee", amount: 1000, frequency: "Annual", classes: "All" },
    { id: 6, type: "Exam Fee", amount: 800, frequency: "Per Exam", classes: "All" },
  ]);
  const [query, setQuery] = useState("");
  const [frequencyFilter, setFrequencyFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<FeeStructureItem, "id">>({
    type: "",
    amount: 0,
    frequency: "Monthly",
    classes: "All",
  });

  const filtered = useMemo(
    () => structure
      .filter((row) => frequencyFilter === "all" || row.frequency === frequencyFilter)
      .filter((row) => `${row.type} ${row.classes}`.toLowerCase().includes(query.toLowerCase())),
    [structure, query, frequencyFilter]
  );

  const yearlyEquivalent = filtered.reduce((sum, row) => {
    if (row.frequency === "Monthly") return sum + row.amount * 12;
    if (row.frequency === "Quarterly") return sum + row.amount * 4;
    return sum + row.amount;
  }, 0);

  const openCreate = () => {
    setEditingId(null);
    setForm({ type: "", amount: 0, frequency: "Monthly", classes: "All" });
    setOpen(true);
  };

  const openEdit = (item: FeeStructureItem) => {
    setEditingId(item.id);
    setForm({
      type: item.type,
      amount: item.amount,
      frequency: item.frequency,
      classes: item.classes,
    });
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.type.trim() || form.amount <= 0) return;
    if (editingId) {
      setStructure((prev) => prev.map((row) => (row.id === editingId ? { ...row, ...form, type: form.type.trim() } : row)));
    } else {
      setStructure((prev) => [...prev, { ...form, type: form.type.trim(), id: prev.length + 1 }]);
    }
    setOpen(false);
  };

  const handleDelete = (id: number) => setStructure((prev) => prev.filter((row) => row.id !== id));

  return (
    <>
      <PageHeader
        title="Fee Structure"
        breadcrumbs={[
          { label: "Dashboard", to: "/admin" },
          { label: "Fees" },
        ]}
        action={<Button variant="contained" size="small" onClick={openCreate}>Add Fee Type</Button>}
      />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            label="Search fee type"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            select
            size="small"
            label="Frequency"
            value={frequencyFilter}
            onChange={(e) => setFrequencyFilter(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="Monthly">Monthly</MenuItem>
            <MenuItem value="Quarterly">Quarterly</MenuItem>
            <MenuItem value="Annual">Annual</MenuItem>
            <MenuItem value="Per Exam">Per Exam</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", height: "100%" }}>
            <Typography variant="body2" color="text.secondary">Yearly Equivalent Total</Typography>
            <Chip label={`INR ${yearlyEquivalent.toLocaleString()}`} color="primary" size="small" />
          </Paper>
        </Grid>
      </Grid>

      <DataTable
        columns={[
          { key: "type", label: "Fee Type" },
          { key: "amount", label: "Amount", render: (r) => `INR ${r.amount.toLocaleString()}` },
          { key: "frequency", label: "Frequency", render: (r) => <Chip label={r.frequency} size="small" variant="outlined" /> },
          { key: "classes", label: "Applicable To" },
          {
            key: "actions",
            label: "Actions",
            render: (r) => (
              <Stack direction="row" spacing={0.5}>
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => openEdit(r)}><EditIcon fontSize="small" /></IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton size="small" color="error" onClick={() => handleDelete(r.id)}><DeleteIcon fontSize="small" /></IconButton>
                </Tooltip>
              </Stack>
            ),
          },
        ]}
        rows={filtered}
      />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? "Edit Fee Type" : "Add Fee Type"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 7 }}>
              <TextField
                fullWidth
                label="Fee Type"
                value={form.type}
                onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 5 }}>
              <TextField
                fullWidth
                type="number"
                label="Amount"
                value={form.amount}
                onChange={(e) => setForm((prev) => ({ ...prev, amount: Number(e.target.value) }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                select
                label="Frequency"
                value={form.frequency}
                onChange={(e) => setForm((prev) => ({ ...prev, frequency: e.target.value as FeeStructureItem["frequency"] }))}
              >
                <MenuItem value="Monthly">Monthly</MenuItem>
                <MenuItem value="Quarterly">Quarterly</MenuItem>
                <MenuItem value="Annual">Annual</MenuItem>
                <MenuItem value="Per Exam">Per Exam</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Applicable Classes"
                value={form.classes}
                onChange={(e) => setForm((prev) => ({ ...prev, classes: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>{editingId ? "Update" : "Add"}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
