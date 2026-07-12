import type { LeaveRequest, LeaveType, LeaveStatus } from "@/types";
import { teachers } from "@/demo-data/people/teachers";
import { staffMembers } from "@/demo-data/people/staff";
import { pick, randomInt } from "@/demo-data/generators/random";

const LEAVE_TYPES: LeaveType[] = ["sick", "casual", "earned", "unpaid"];
const REASONS = [
  "Family function", "Medical appointment", "Personal work", "Out of town travel",
  "Not feeling well", "Festival celebration", "Child's school event", "Home repair",
];

function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

function isoDaysFrom(base: string, n: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

// Sample every 3rd teacher and every 2nd staff member — this always includes
// index 0 (t1 / sf1, the fixed demo logins) so their portals show real data.
const sampledTeachers = teachers.filter((_, i) => i % 3 === 0).map((t) => ({ id: t.id, role: "teacher" as const }));
const sampledStaff = staffMembers.filter((_, i) => i % 2 === 0).map((s) => ({ id: s.id, role: "staff" as const }));
const applicants = [...sampledTeachers, ...sampledStaff];

export const defaultLeaveRequests: LeaveRequest[] = applicants.flatMap((applicant, i) => {
  const requestCount = 1 + (i % 2); // 1 or 2 requests per sampled applicant
  return Array.from({ length: requestCount }, (_, j) => {
    const seed = i * 7 + j * 13;
    const appliedDaysAgo = randomInt(3, 45);
    const durationDays = randomInt(1, 4);
    const startDate = isoDaysAgo(appliedDaysAgo - randomInt(0, 3));
    const status: LeaveStatus = seed % 5 === 0 ? "pending" : seed % 5 === 1 ? "rejected" : "approved";
    return {
      id: `lv-${applicant.role}-${applicant.id}-${j}`,
      applicant_id: applicant.id,
      applicant_role: applicant.role,
      leave_type: pick(LEAVE_TYPES),
      start_date: startDate,
      end_date: isoDaysFrom(startDate, durationDays - 1),
      reason: pick(REASONS),
      status,
      applied_date: isoDaysAgo(appliedDaysAgo),
      reviewed_by: status !== "pending" ? "admin" : undefined,
      review_note: status === "rejected" ? "Insufficient leave balance for this period." : undefined,
    };
  });
});
