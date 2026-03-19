import { useState } from "react";
import { MenuItem, TextField, Grid, Chip, Button, Box, Paper } from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { fees, students, getClassName } from "@/data/mock";
import type { Fee } from "@/types";

export default function FeeCollection() {
  const [rows, setRows] = useState<Fee[]>(fees);
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");

  const data = rows.map((f) => {
    const student = students.find((s) => s.id === f.student_id);
    return {
      ...f,
      studentName: student?.name ?? "—",
      className: student ? getClassName(student.class_id) : "—",
    };
  }).filter((r) => (statusFilter === "all" || r.status === statusFilter) && (`${r.studentName} ${r.className}`.toLowerCase().includes(query.toLowerCase())));

  const collected = data.filter((row) => row.status === "paid").reduce((sum, row) => sum + row.amount, 0);
  const pending = data.filter((row) => row.status !== "paid").reduce((sum, row) => sum + row.amount, 0);

  const markAsPaid = (id: string) => {
    const paidDate = new Date().toISOString().split("T")[0];
    setRows((prev) => prev.map((fee) => (
      fee.id === id ? { ...fee, status: "paid", paid_date: paidDate } : fee
    )));
  };

  return (
    <>
      <PageHeader
        title="Fee Collection"
        breadcrumbs={[
          { label: "Dashboard", to: "/admin" },
          { label: "Fees", to: "/admin/fees" },
          { label: "Collection" },
        ]}
      />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField fullWidth size="small" label="Search student" value={query} onChange={(e) => setQuery(e.target.value)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField fullWidth select size="small" label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="paid">Paid</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="overdue">Overdue</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Paper sx={{ p: 1.2, display: "flex", gap: 1, alignItems: "center", height: "100%" }}>
            <Chip label={`Collected INR ${collected.toLocaleString()}`} size="small" color="success" />
            <Chip label={`Pending INR ${pending.toLocaleString()}`} size="small" color="warning" />
          </Paper>
        </Grid>
      </Grid>
      <DataTable
        columns={[
          { key: "studentName", label: "Student" },
          { key: "className", label: "Class" },
          { key: "fee_type", label: "Type", render: (f) => f.fee_type.charAt(0).toUpperCase() + f.fee_type.slice(1) },
          { key: "amount", label: "Amount", render: (f) => `₹${f.amount.toLocaleString()}` },
          { key: "due_date", label: "Due Date" },
          {
            key: "status", label: "Status",
            render: (f) => <Chip label={f.status} size="small" color={f.status === "paid" ? "success" : f.status === "pending" ? "warning" : "error"} />,
          },
          { key: "paid_date", label: "Paid Date", render: (f) => f.paid_date ?? "—" },
          {
            key: "actions",
            label: "Actions",
            render: (f) => (
              <Box>
                <Button size="small" variant="outlined" disabled={f.status === "paid"} onClick={() => markAsPaid(f.id)}>
                  Mark Paid
                </Button>
              </Box>
            ),
          },
        ]}
        rows={data}
      />
    </>
  );
}
