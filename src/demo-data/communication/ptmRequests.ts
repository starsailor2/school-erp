import type { ParentTeacherMeeting, PTMStatus } from "@/types";
import { students } from "@/demo-data/people/students";
import { classes } from "@/demo-data/academics/classes";
import { pick, randomInt } from "@/demo-data/generators/random";

const REASONS = [
  "Discuss academic progress", "Behavioural concern", "Attendance concern",
  "General progress check-in", "Discuss upcoming exam preparation", "Homework completion concern",
];
const TIME_SLOTS = ["10:00", "11:00", "14:00", "15:00", "16:00"];

function classTeacherFor(student: (typeof students)[number]): string | undefined {
  const cls = classes.find((c) => c.id === student.class_id);
  return cls?.sections.find((s) => s.id === student.section_id)?.class_teacher_id;
}

function isoDaysFromToday(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

// Sample every 15th student — always includes index 0 (stu1, the fixed demo
// student login), so both the parent and teacher portals show real data.
const sampledStudents = students.filter((_, i) => i % 15 === 0);

export const defaultPTMs: ParentTeacherMeeting[] = sampledStudents
  .map((student, i): ParentTeacherMeeting | null => {
    const teacherId = classTeacherFor(student);
    if (!teacherId) return null;
    const offset = randomInt(-12, 12);
    const isPast = offset < 0;
    const status: PTMStatus = isPast ? pick(["completed", "declined"] as const) : pick(["pending", "confirmed"] as const);
    return {
      id: `ptm-${i + 1}`,
      teacher_id: teacherId,
      parent_id: student.parent_id,
      student_id: student.id,
      requested_by: pick(["parent", "teacher"] as const),
      proposed_date: isoDaysFromToday(offset),
      proposed_time: pick(TIME_SLOTS),
      status,
      reason: pick(REASONS),
      notes: status === "completed" ? "Meeting held; parent updated on progress." : undefined,
      created_date: isoDaysFromToday(offset - randomInt(2, 6)),
    };
  })
  .filter((m): m is ParentTeacherMeeting => m !== null);
