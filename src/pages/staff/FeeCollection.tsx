import { useState } from "react";
import { MenuItem, TextField, Grid, Chip, Button, Box, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { students, getClassName } from "@/demo-data";
import { getStaffFees, recordFeePayment } from "@/demo-data/fees/feeTransactionStore";
import { useAuth } from "@/context/AuthContext";

export default function StaffFeeCollection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [, setRefresh] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [method, setMethod] = useState<"cash" | "card" | "online" | "bank_transfer">("cash");

  const rows = getStaffFees()
    .map((f) => {
      const student = students.find((s) => s.id === f.student_id);
      return {
        ...f,
        studentName: student?.name ?? "-",
        className: student ? getClassName(student.class_id) : "-",
      };
    })
    .filter((r) => statusFilter === "all" || r.status === statusFilter);

  const handleRecordPayment = (row: (typeof rows)[number]) => {
    if (row.status === "paid") return;
    recordFeePayment({
      feeId: row.id,
      studentId: row.student_id,
      amount: row.amount,
      method,
      recordedBy: user.id,
    });
    setRefresh((v) => v + 1);
  };

  return (
    <>
      <PageHeader
        title="Fee Collection"
        breadcrumbs={[{ label: "Dashboard", to: "/staff" }, { label: "Fees" }, { label: "Fee Collection" }]}
        action={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" size="small" onClick={() => navigate("/staff/fees/records")}>Payment Records</Button>
            <Button variant="contained" size="small" onClick={() => navigate("/staff/fees/receipts")}>Receipts</Button>
          </Stack>
        }
      />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select size="small" label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="paid">Paid</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="overdue">Overdue</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select size="small" label="Payment Method" value={method} onChange={(e) => setMethod(e.target.value as typeof method)}>
            <MenuItem value="cash">Cash</MenuItem>
            <MenuItem value="card">Card</MenuItem>
            <MenuItem value="online">Online</MenuItem>
            <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
          </TextField>
        </Grid>
      </Grid>
      <DataTable
        columns={[
          { key: "studentName", label: "Student" },
          { key: "className", label: "Class" },
          { key: "fee_type", label: "Type" },
          { key: "amount", label: "Amount", render: (f) => `INR ${f.amount.toLocaleString()}` },
          { key: "due_date", label: "Due Date" },
          { key: "status", label: "Status", render: (f) => <Chip label={f.status} size="small" color={f.status === "paid" ? "success" : f.status === "pending" ? "warning" : "error"} /> },
          {
            key: "actions",
            label: "Actions",
            render: (f) => (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button size="small" variant="outlined" disabled={f.status === "paid"} onClick={() => handleRecordPayment(f)}>
                  Record Payment
                </Button>
                <Button size="small" variant="outlined" onClick={() => navigate("/staff/fees/receipts")}>Generate Receipt</Button>
                <Button size="small" variant="outlined" onClick={() => navigate(`/staff/students/fee-history`)}>View History</Button>
              </Box>
            ),
          },
        ]}
        rows={rows}
      />
    </>
  );
}
