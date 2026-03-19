import { useMemo, useState } from "react";
import { Grid, MenuItem, TextField } from "@mui/material";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { getFeePayments } from "@/data/feeTransactionStore";
import { students, getClassName } from "@/data/mock";

export default function PaymentRecords() {
  const [methodFilter, setMethodFilter] = useState("all");

  const rows = useMemo(() => {
    return getFeePayments()
      .map((p) => {
        const student = students.find((s) => s.id === p.student_id);
        return {
          ...p,
          studentName: student?.name ?? "-",
          className: student ? getClassName(student.class_id) : "-",
        };
      })
      .filter((r) => methodFilter === "all" || r.method === methodFilter);
  }, [methodFilter]);

  return (
    <>
      <PageHeader
        title="Payment Records"
        breadcrumbs={[{ label: "Dashboard", to: "/staff" }, { label: "Fees", to: "/staff/fees/collection" }, { label: "Payment Records" }]}
      />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth
            select
            size="small"
            label="Method"
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="cash">Cash</MenuItem>
            <MenuItem value="card">Card</MenuItem>
            <MenuItem value="online">Online</MenuItem>
            <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
          </TextField>
        </Grid>
      </Grid>
      <DataTable
        rows={rows}
        columns={[
          { key: "payment_date", label: "Date" },
          { key: "studentName", label: "Student" },
          { key: "className", label: "Class" },
          { key: "amount", label: "Amount", render: (r) => `INR ${r.amount.toLocaleString()}` },
          { key: "method", label: "Method", render: (r) => r.method.replace("_", " ") },
          { key: "reference", label: "Reference", render: (r) => r.reference ?? "-" },
        ]}
      />
    </>
  );
}
