import { useMemo, useState } from "react";
import { Grid, MenuItem, TextField, Drawer, Box, Typography, Divider, Stack, Chip } from "@mui/material";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { getFeePayments, getFeeReceipts, getStaffFees } from "@/data/feeTransactionStore";
import { students, getClassName } from "@/data/mock";

export default function StudentFeeHistory() {
  const [studentId, setStudentId] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  const rows = useMemo(() => {
    return getStaffFees()
      .filter((f) => studentId === "all" || f.student_id === studentId)
      .map((f) => {
        const student = students.find((s) => s.id === f.student_id);
        return {
          ...f,
          studentName: student?.name ?? "-",
          className: student ? getClassName(student.class_id) : "-",
        };
      });
  }, [studentId]);

  const student = selectedStudent ? students.find((s) => s.id === selectedStudent) : null;
  const studentFees = selectedStudent ? getStaffFees().filter((f) => f.student_id === selectedStudent) : [];
  const studentPayments = selectedStudent ? getFeePayments().filter((p) => p.student_id === selectedStudent) : [];
  const studentReceipts = selectedStudent ? getFeeReceipts().filter((r) => r.student_id === selectedStudent) : [];

  return (
    <>
      <PageHeader
        title="Student Fee History"
        breadcrumbs={[{ label: "Dashboard", to: "/staff" }, { label: "Students", to: "/staff/students" }, { label: "Fee History" }]}
      />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 5 }}>
          <TextField
            fullWidth
            size="small"
            select
            label="Student"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          >
            <MenuItem value="all">All Students</MenuItem>
            {students.map((s) => (
              <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
      <DataTable
        rows={rows}
        columns={[
          { key: "studentName", label: "Student" },
          { key: "className", label: "Class" },
          { key: "fee_type", label: "Type" },
          { key: "amount", label: "Amount", render: (r) => `INR ${r.amount.toLocaleString()}` },
          { key: "status", label: "Status" },
          { key: "paid_date", label: "Paid Date", render: (r) => r.paid_date ?? "-" },
        ]}
        onRowClick={(row) => setSelectedStudent((row as { student_id: string }).student_id)}
      />

      <Drawer anchor="right" open={!!selectedStudent} onClose={() => setSelectedStudent(null)}>
        <Box sx={{ width: { xs: 320, sm: 420 }, p: 2 }}>
          <Typography variant="h6" fontWeight={700}>Fee Detail</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {student?.name ?? "Student"} {student ? `| ${getClassName(student.class_id)}` : ""}
          </Typography>
          <Divider sx={{ mb: 1 }} />

          <Typography variant="subtitle2" sx={{ mb: 1 }}>Fee Items</Typography>
          <Stack spacing={1} sx={{ mb: 2 }}>
            {studentFees.map((f) => (
              <Box key={f.id} sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2">{f.fee_type}</Typography>
                <Chip size="small" label={`${f.status} | INR ${f.amount.toLocaleString()}`} />
              </Box>
            ))}
          </Stack>

          <Typography variant="subtitle2" sx={{ mb: 1 }}>Payments</Typography>
          <Stack spacing={1} sx={{ mb: 2 }}>
            {studentPayments.length === 0 && <Typography variant="caption" color="text.secondary">No payment records yet.</Typography>}
            {studentPayments.map((p) => (
              <Typography key={p.id} variant="body2">
                {p.payment_date} | {p.method.replace("_", " ")} | INR {p.amount.toLocaleString()}
              </Typography>
            ))}
          </Stack>

          <Typography variant="subtitle2" sx={{ mb: 1 }}>Receipts</Typography>
          <Stack spacing={1}>
            {studentReceipts.length === 0 && <Typography variant="caption" color="text.secondary">No receipts issued yet.</Typography>}
            {studentReceipts.map((r) => (
              <Typography key={r.id} variant="body2">
                {r.receipt_no} | {r.issued_on} | INR {r.amount.toLocaleString()}
              </Typography>
            ))}
          </Stack>
        </Box>
      </Drawer>
    </>
  );
}
