import { useMemo } from "react";
import { Button, Stack } from "@mui/material";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { getFeeReceipts } from "@/demo-data/fees/feeTransactionStore";
import { students } from "@/demo-data";

export default function FeeReceipts() {
  const rows = useMemo(() => {
    return getFeeReceipts().map((r) => {
      const student = students.find((s) => s.id === r.student_id);
      return {
        ...r,
        studentName: student?.name ?? "-",
      };
    });
  }, []);

  return (
    <>
      <PageHeader
        title="Receipts"
        breadcrumbs={[{ label: "Dashboard", to: "/staff" }, { label: "Fees", to: "/staff/fees/collection" }, { label: "Receipts" }]}
      />
      <DataTable
        rows={rows}
        columns={[
          { key: "receipt_no", label: "Receipt No" },
          { key: "issued_on", label: "Issued On" },
          { key: "studentName", label: "Student" },
          { key: "amount", label: "Amount", render: (r) => `INR ${r.amount.toLocaleString()}` },
          {
            key: "actions",
            label: "Actions",
            render: () => (
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="outlined">View</Button>
                <Button size="small" variant="outlined">Print</Button>
              </Stack>
            ),
          },
        ]}
      />
    </>
  );
}
