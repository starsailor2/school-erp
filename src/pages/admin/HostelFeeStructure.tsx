import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import StatusChip from "@/components/StatusChip";
import { hostelFees, students } from "@/demo-data";

export default function HostelFeeStructure() {
  const currentMonthFees = hostelFees.filter((f) => {
    const d = new Date(f.due_date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const rows = currentMonthFees.map((f) => ({
    ...f,
    studentName: students.find((s) => s.id === f.student_id)?.name ?? f.student_id,
  }));

  return (
    <>
      <PageHeader title="Hostel Fee Structure" eyebrow="Hostel" breadcrumbs={[{ label: "Operations" }, { label: "Hostel", to: "/admin/hostel" }, { label: "Fee Structure" }]} />
      <DataTable
        pagination
        pageSize={25}
        columns={[
          { key: "studentName", label: "Student" },
          { key: "amount", label: "Amount", render: (r) => `₹${r.amount.toLocaleString("en-IN")}` },
          { key: "due_date", label: "Due Date" },
          { key: "status", label: "Status", render: (r) => <StatusChip status={r.status} /> },
        ]}
        rows={rows}
        emptyTitle="No hostel fees for this month"
      />
    </>
  );
}
