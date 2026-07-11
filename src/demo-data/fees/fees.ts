import type { Fee, FeeStatus } from "@/types";
import { students } from "@/demo-data/people/students";
import { feeStructureItems } from "@/demo-data/fees/feeStructure";
import { pick } from "@/demo-data/generators/random";

function lastNMonths(n: number): { year: number; month: number }[] {
  const out: { year: number; month: number }[] = [];
  const d = new Date();
  d.setDate(1);
  for (let i = 0; i < n; i++) {
    out.push({ year: d.getFullYear(), month: d.getMonth() });
    d.setMonth(d.getMonth() - 1);
  }
  return out.reverse();
}

const MONTHS = lastNMonths(12);

function dueDateFor(year: number, month: number): string {
  const d = new Date(year, month + 1, 5); // 5th of the following month
  return d.toISOString().split("T")[0];
}

export const fees: Fee[] = students.flatMap((s, si) => {
  const tuitionAmount = feeStructureItems.find((f) => f.class_id === s.class_id && f.fee_type === "tuition")?.amount ?? 5000;

  const tuitionFees: Fee[] = MONTHS.map(({ year, month }, mi) => {
    const isPastDue = mi < MONTHS.length - 1; // every month except the current one has resolved
    let status: FeeStatus;
    if (!isPastDue) {
      status = s.fee_status; // current month mirrors the student's live status
    } else {
      status = si % 11 === 0 ? "overdue" : "paid"; // small persistent-defaulter tail
    }
    return {
      id: `fee-${s.id}-${year}-${month}`,
      student_id: s.id,
      fee_type: "tuition",
      amount: tuitionAmount,
      due_date: dueDateFor(year, month),
      status,
      paid_date: status === "paid" ? dueDateFor(year, month) : undefined,
    };
  });

  const transportFee: Fee[] = s.transport_route_id
    ? [{
        id: `fee-tr-${s.id}`,
        student_id: s.id,
        fee_type: "transport" as const,
        amount: 2000,
        due_date: dueDateFor(MONTHS[MONTHS.length - 1].year, MONTHS[MONTHS.length - 1].month),
        status: pick(["paid", "paid", "pending"] as const),
        paid_date: undefined,
      }]
    : [];

  return [...tuitionFees, ...transportFee];
});

export function getStudentFees(studentId: string) {
  return fees.filter((f) => f.student_id === studentId);
}
