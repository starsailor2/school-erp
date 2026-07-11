import { useState } from "react";
import { ToggleButtonGroup, ToggleButton } from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import StatusChip from "@/components/StatusChip";
import { messPlans, messAttendance, students } from "@/demo-data";
import type { MessMeal } from "@/types";

const MEALS: MessMeal[] = ["breakfast", "lunch", "snacks", "dinner"];
const TODAY = new Date().toISOString().split("T")[0];

export default function MessAttendance() {
  const [meal, setMeal] = useState<MessMeal>("lunch");

  const rows = messPlans.map((plan) => {
    const record = messAttendance.find((a) => a.student_id === plan.student_id && a.date === TODAY && a.meal === meal);
    return {
      studentName: students.find((s) => s.id === plan.student_id)?.name ?? plan.student_id,
      planType: plan.plan_type,
      consumed: record?.consumed ?? false,
    };
  });

  return (
    <>
      <PageHeader
        title="Daily Meal Attendance"
        eyebrow="Mess"
        action={
          <ToggleButtonGroup size="small" value={meal} exclusive onChange={(_, v) => v && setMeal(v)}>
            {MEALS.map((m) => (
              <ToggleButton key={m} value={m} sx={{ textTransform: "capitalize" }}>{m}</ToggleButton>
            ))}
          </ToggleButtonGroup>
        }
      />
      <DataTable
        pagination
        pageSize={25}
        columns={[
          { key: "studentName", label: "Student" },
          { key: "planType", label: "Plan" },
          { key: "consumed", label: "Status", render: (r) => <StatusChip status={r.consumed ? "completed" : "pending"} /> },
        ]}
        rows={rows}
        emptyTitle="No mess plans found"
      />
    </>
  );
}
