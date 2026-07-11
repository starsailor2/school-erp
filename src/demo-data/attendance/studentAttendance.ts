import type { AttendanceRecord } from "@/types";
import { students } from "@/demo-data/people/students";
import { weightedPick } from "@/demo-data/generators/random";

// Walk backward from today, collecting weekdays only, until we have 200.
function schoolDays(count: number): string[] {
  const days: string[] = [];
  const d = new Date();
  while (days.length < count) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) days.push(d.toISOString().split("T")[0]);
    d.setDate(d.getDate() - 1);
  }
  return days.reverse();
}

const SCHOOL_DAYS = schoolDays(200);

export const attendanceRecords: AttendanceRecord[] = students.flatMap((s) =>
  SCHOOL_DAYS.map((date, di) => ({
    id: `att-${s.id}-${di}`,
    student_id: s.id,
    date,
    status: weightedPick([
      ["present", 88],
      ["absent", 8],
      ["late", 4],
    ] as const),
    marked_by: `t${(parseInt(s.class_id.replace("c", ""), 10) % 35) + 1}`,
  }))
);

export function getStudentAttendance(studentId: string) {
  return attendanceRecords.filter((a) => a.student_id === studentId);
}
