import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import StatusChip from "@/components/StatusChip";
import { messBilling, students } from "@/demo-data";

export default function MessBilling() {
  const currentMonth = messBilling.length > 0 ? messBilling[messBilling.length - 1].month_label : "";
  const rows = messBilling
    .filter((b) => b.month_label === currentMonth)
    .map((b) => ({ ...b, studentName: students.find((s) => s.id === b.student_id)?.name ?? b.student_id }));

  return (
    <>
      <PageHeader title="Mess Billing" eyebrow="Mess" breadcrumbs={[{ label: "Operations" }, { label: "Mess", to: "/admin/mess" }, { label: "Billing" }]} />
      <DataTable
        pagination
        pageSize={25}
        columns={[
          { key: "studentName", label: "Student" },
          { key: "month_label", label: "Month" },
          { key: "amount", label: "Amount", render: (r) => `₹${r.amount.toLocaleString("en-IN")}` },
          { key: "status", label: "Status", render: (r) => <StatusChip status={r.status} /> },
        ]}
        rows={rows}
        emptyTitle="No billing records for this month"
      />
    </>
  );
}
