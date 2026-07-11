import type { MessPlan } from "@/types";
import { hostelAllocations } from "@/demo-data/hostel/allocations";

export const messPlans: MessPlan[] = hostelAllocations.map((alloc, i) => ({
  id: `mp-${alloc.student_id}`,
  student_id: alloc.student_id,
  plan_type: i % 3 === 0 ? "non_veg" : "veg",
  subscribed_since: alloc.check_in_date,
}));

export function getMessPlanForStudent(studentId: string) {
  return messPlans.find((p) => p.student_id === studentId);
}
