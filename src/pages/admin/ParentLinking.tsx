import { useMemo, useState } from "react";
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem,
  Paper, Stack, TextField, Typography,
} from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { students, parents, getClassName } from "@/demo-data";
import type { Parent } from "@/types";

export default function ParentLinking() {
  const [rows, setRows] = useState<Parent[]>(parents);
  const [query, setQuery] = useState("");
  const [childCountFilter, setChildCountFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editingParentId, setEditingParentId] = useState("");
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);

  const parentRows = useMemo(
    () => rows
      .map((p) => {
        const children = students.filter((s) => p.children.includes(s.id));
        return {
          ...p,
          childCount: children.length,
          childrenNames: children.map((c) => c.name).join(", "),
          childrenClasses: children.map((c) => getClassName(c.class_id)).join(", "),
        };
      })
      .filter((p) => `${p.name} ${p.phone} ${p.occupation}`.toLowerCase().includes(query.toLowerCase()))
      .filter((p) => {
        if (childCountFilter === "all") return true;
        if (childCountFilter === "single") return p.childCount === 1;
        return p.childCount > 1;
      }),
    [rows, query, childCountFilter]
  );

  const openRelink = (parent: Parent) => {
    setEditingParentId(parent.id);
    setSelectedChildren(parent.children);
    setOpen(true);
  };

  const handleSave = () => {
    setRows((prev) => prev.map((p) => (
      p.id === editingParentId ? { ...p, children: selectedChildren } : p
    )));
    setOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Parent-Student Linking"
        breadcrumbs={[
          { label: "Dashboard", to: "/admin" },
          { label: "Students", to: "/admin/students" },
          { label: "Parent Linking" },
        ]}
      />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            size="small"
            label="Search parent"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, phone, occupation"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            select
            label="Children"
            value={childCountFilter}
            onChange={(e) => setChildCountFilter(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="single">Single Child</MenuItem>
            <MenuItem value="multiple">Multiple Children</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper sx={{ p: 1.5, height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">Visible Parents</Typography>
            <Typography variant="subtitle2">{parentRows.length}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <DataTable
        columns={[
          { key: "name", label: "Parent Name" },
          { key: "phone", label: "Phone" },
          { key: "occupation", label: "Occupation" },
          { key: "childrenNames", label: "Children" },
          { key: "childrenClasses", label: "Classes" },
          {
            key: "actions",
            label: "Actions",
            render: (row) => (
              <Button size="small" variant="outlined" onClick={() => openRelink(row)}>Relink</Button>
            ),
          },
        ]}
        rows={parentRows}
      />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Relink Children</DialogTitle>
        <DialogContent>
          <Stack spacing={1.2} sx={{ mt: 0.5 }}>
            {students.map((student) => {
              const selected = selectedChildren.includes(student.id);
              return (
                <Paper
                  key={student.id}
                  sx={{
                    px: 1.5,
                    py: 1,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: 1,
                    borderColor: selected ? "primary.main" : "divider",
                  }}
                >
                  <Typography variant="body2">{student.name} • {getClassName(student.class_id)}</Typography>
                  <Button
                    size="small"
                    variant={selected ? "contained" : "outlined"}
                    onClick={() => {
                      setSelectedChildren((prev) => (
                        prev.includes(student.id)
                          ? prev.filter((id) => id !== student.id)
                          : [...prev, student.id]
                      ));
                    }}
                  >
                    {selected ? "Linked" : "Link"}
                  </Button>
                </Paper>
              );
            })}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
