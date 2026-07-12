import type { HostelFee, FeeStatus } from "@/types";
import { hostelAllocations } from "@/demo-data/hostel/allocations";

const MONTHLY_HOSTEL_FEE = 8000;

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

export const hostelFees: HostelFee[] = hostelAllocations.flatMap((alloc, ai) =>
  MONTHS.map(({ year, month }, mi) => {
    const dueDate = new Date(year, month + 1, 5).toISOString().split("T")[0];
    const isPastMonth = mi < MONTHS.length - 1;
    const status: FeeStatus = !isPastMonth ? (ai % 9 === 0 ? "pending" : "paid") : ai % 15 === 0 ? "overdue" : "paid";
    return {
      id: `hf-${alloc.student_id}-${year}-${month}`,
      student_id: alloc.student_id,
      amount: MONTHLY_HOSTEL_FEE,
      due_date: dueDate,
      status,
      paid_date: status === "paid" ? dueDate : undefined,
    };
  })
);
