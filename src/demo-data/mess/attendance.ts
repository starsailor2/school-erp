import type { MessAttendanceRecord, MessMeal } from "@/types";
import { messPlans } from "@/demo-data/mess/plans";
import { weightedPick } from "@/demo-data/generators/random";

const MEALS: MessMeal[] = ["breakfast", "lunch", "snacks", "dinner"];

function lastNDays(n: number): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = 0; i < n; i++) {
    out.push(d.toISOString().split("T")[0]);
    d.setDate(d.getDate() - 1);
  }
  return out.reverse();
}

const DAYS = lastNDays(30);

export const messAttendance: MessAttendanceRecord[] = messPlans.flatMap((plan) =>
  DAYS.flatMap((date) =>
    MEALS.map((meal) => ({
      id: `mat-${plan.student_id}-${date}-${meal}`,
      student_id: plan.student_id,
      date,
      meal,
      consumed: weightedPick([
        [true, meal === "snacks" ? 65 : 90],
        [false, meal === "snacks" ? 35 : 10],
      ] as const),
    }))
  )
);
