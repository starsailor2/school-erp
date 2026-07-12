import { useState } from "react";
import { Chip, Button, Grid, MenuItem, TextField } from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { fees, students, getClassName } from "@/demo-data";

export default function FeeDefaulters() {
  const [classFilter, setClassFilter] = useState("all");

  const rows = fees
    .filter((f) => f.status === "overdue")
    .map((f) => {
      const student = students.find((s) => s.id === f.student_id);
      const today = new Date();
      const dueDate = new Date(f.due_date);
      const overdueDays = Math.max(0, Math.ceil((+today - +dueDate) / (1000 * 60 * 60 * 24)));
      return {
        ...f,
        studentName: student?.name ?? "—",
        className: student ? getClassName(student.class_id) : "—",
        phone: student?.phone ?? "—",
        overdueDays,
      };
    })
    .filter((row) => classFilter === "all" || row.className === classFilter);

  const classNames = Array.from(new Set(students.map((s) => getClassName(s.class_id))));

  return (
    <>
      <PageHeader
        title="Fee Defaulters"
        breadcrumbs={[
          { label: "Dashboard", to: "/admin" },
          { label: "Fees", to: "/admin/fees" },
          { label: "Defaulters" },
        ]}
      />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select size="small" label="Class" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
            <MenuItem value="all">All Classes</MenuItem>
            {classNames.map((name) => <MenuItem key={name} value={name}>{name}</MenuItem>)}
          </TextField>
        </Grid>
      </Grid>
      <DataTable
        pagination
        pageSize={25}
        columns={[
          { key: "studentName", label: "Student" },
          { key: "className", label: "Class" },
          { key: "phone", label: "Phone" },
          { key: "fee_type", label: "Type" },
          { key: "amount", label: "Amount", render: (f) => `₹${f.amount.toLocaleString()}` },
          { key: "due_date", label: "Due Date" },
          { key: "overdueDays", label: "Overdue Days" },
          { key: "status", label: "Status", render: () => <Chip label="Overdue" size="small" color="error" /> },
          { key: "actions", label: "Actions", render: () => <Button size="small" variant="outlined">Send Reminder</Button> },
        ]}
        rows={rows}
      />
    </>
  );
}
