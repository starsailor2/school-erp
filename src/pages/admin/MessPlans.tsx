import { Chip } from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { messPlans, students } from "@/demo-data";

export default function MessPlans() {
  const rows = messPlans.map((p) => ({
    ...p,
    studentName: students.find((s) => s.id === p.student_id)?.name ?? p.student_id,
  }));

  return (
    <>
      <PageHeader title="Mess Plans" eyebrow="Mess" breadcrumbs={[{ label: "Operations" }, { label: "Mess", to: "/admin/mess" }, { label: "Mess Plans" }]} />
      <DataTable
        pagination
        pageSize={25}
        columns={[
          { key: "studentName", label: "Student" },
          { key: "plan_type", label: "Plan", render: (r) => <Chip size="small" label={r.plan_type === "veg" ? "Vegetarian" : "Non-Vegetarian"} variant="outlined" /> },
          { key: "subscribed_since", label: "Subscribed Since" },
        ]}
        rows={rows}
        emptyTitle="No mess plans found"
      />
    </>
  );
}
