import type { TeacherAttendanceRecord } from "@/types";
import { teachers } from "@/demo-data/people/teachers";
import { weightedPick } from "@/demo-data/generators/random";

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

export const teacherAttendanceRecords: TeacherAttendanceRecord[] = teachers.flatMap((t) =>
  SCHOOL_DAYS.map((date, di) => ({
    id: `tatt-${t.id}-${di}`,
    teacher_id: t.id,
    date,
    status: weightedPick([
      ["present", 94],
      ["absent", 3],
      ["late", 3],
    ] as const),
  }))
);

export function getTeacherAttendance(teacherId: string) {
  return teacherAttendanceRecords.filter((a) => a.teacher_id === teacherId);
}
