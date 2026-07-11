import type { MessBilling, FeeStatus } from "@/types";
import { messPlans } from "@/demo-data/mess/plans";

const MONTHLY_RATE: Record<"veg" | "non_veg", number> = { veg: 3500, non_veg: 4200 };

function lastNMonthLabels(n: number): string[] {
  const out: string[] = [];
  const d = new Date();
  d.setDate(1);
  for (let i = 0; i < n; i++) {
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    d.setMonth(d.getMonth() - 1);
  }
  return out.reverse();
}

const MONTH_LABELS = lastNMonthLabels(6);

export const messBilling: MessBilling[] = messPlans.flatMap((plan, pi) =>
  MONTH_LABELS.map((monthLabel, mi) => {
    const isCurrent = mi === MONTH_LABELS.length - 1;
    const status: FeeStatus = isCurrent ? (pi % 8 === 0 ? "pending" : "paid") : pi % 14 === 0 ? "overdue" : "paid";
    return {
      id: `mb-${plan.student_id}-${monthLabel}`,
      student_id: plan.student_id,
      month_label: monthLabel,
      amount: MONTHLY_RATE[plan.plan_type],
      status,
    };
  })
);
