import { useState } from "react";
import {
  TextField, MenuItem, Button, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, Stack,
} from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { students, classes, getClassName } from "@/data/mock";
import { createStudentRequest } from "@/data/studentRequestStore";

interface TransferRequest {
  id: string;
  studentId: string;
  studentName: string;
  fromClass: string;
  toClass: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  date: string;
}

const mockTransfers: TransferRequest[] = [
  { id: "tr1", studentId: "s1", studentName: students[0]?.name ?? "Student", fromClass: "Class 7", toClass: "Class 8", reason: "Promotion", status: "approved", date: "2025-03-15" },
  { id: "tr2", studentId: "s5", studentName: students[4]?.name ?? "Student", fromClass: "Class 5", toClass: "Class 5", reason: "Section change", status: "pending", date: "2025-06-20" },
  { id: "tr3", studentId: "s10", studentName: students[9]?.name ?? "Student", fromClass: "Class 9", toClass: "Other School", reason: "Transfer Certificate", status: "pending", date: "2025-07-01" },
];

export default function StudentTransfer() {
  const [transfers, setTransfers] = useState(mockTransfers);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ studentId: "", toClass: "", reason: "" });

  const handleApprove = (id: string) => {
    setTransfers((prev) => prev.map((t) => t.id === id ? { ...t, status: "approved" as const } : t));
  };

  const handleSubmit = () => {
    const student = students.find((s) => s.id === form.studentId);
    if (!student) return;
    setTransfers((prev) => [
      ...prev,
      {
        id: `tr${prev.length + 1}`,
        studentId: student.id,
        studentName: student.name,
        fromClass: getClassName(student.class_id),
        toClass: form.toClass,
        reason: form.reason,
        status: "pending",
        date: new Date().toISOString().split("T")[0],
      },
    ]);
    createStudentRequest({
      student_id: student.id,
      request_type: "transfer_certificate",
      requested_by: "admin",
      assigned_to: "sf1",
      note: `Transfer requested by admin. From ${getClassName(student.class_id)} to ${form.toClass}. Reason: ${form.reason || "Not specified"}`,
    });
    setOpen(false);
    setForm({ studentId: "", toClass: "", reason: "" });
  };

  return (
    <>
      <PageHeader
        title="Student Transfer"
        breadcrumbs={[{ label: "Dashboard", to: "/admin" }, { label: "Students", to: "/admin/students" }, { label: "Transfer" }]}
        action={<Button variant="contained" size="small" onClick={() => setOpen(true)}>New Transfer</Button>}
      />

      <DataTable
        columns={[
          { key: "studentName", label: "Student" },
          { key: "fromClass", label: "From" },
          { key: "toClass", label: "To" },
          { key: "reason", label: "Reason" },
          { key: "date", label: "Date" },
          {
            key: "status", label: "Status",
            render: (t) => <Chip label={t.status} size="small" color={t.status === "approved" ? "success" : t.status === "rejected" ? "error" : "warning"} />,
          },
          {
            key: "id", label: "Action",
            render: (t) => t.status === "pending" ? (
              <Button size="small" onClick={() => handleApprove(t.id)}>Approve</Button>
            ) : "—",
          },
        ]}
        rows={transfers}
      />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Transfer Request</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField select label="Student" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} fullWidth size="small">
              {students.slice(0, 20).map((s) => <MenuItem key={s.id} value={s.id}>{s.name} — {getClassName(s.class_id)}</MenuItem>)}
            </TextField>
            <TextField select label="Transfer To" value={form.toClass} onChange={(e) => setForm({ ...form, toClass: e.target.value })} fullWidth size="small">
              {classes.map((c) => <MenuItem key={c.id} value={c.name}>{c.name}</MenuItem>)}
              <MenuItem value="Other School">Other School (TC)</MenuItem>
            </TextField>
            <TextField label="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} fullWidth size="small" multiline rows={2} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!form.studentId || !form.toClass}>Submit</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
