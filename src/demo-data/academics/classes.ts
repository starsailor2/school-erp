import type { SchoolClass } from "@/types";

// 12 classes; classes 1-5 have 2 sections (A, B), classes 6-12 have 3 (A, B, C).
// Section class_teacher_id and student_count are patched in people/students.ts
// (Task 3) and people/teachers.ts (Task 3) once those rosters exist, avoiding
// a circular import between academics <-> people.
export const classes: SchoolClass[] = Array.from({ length: 12 }, (_, i) => ({
  id: `c${i + 1}`,
  name: `Class ${i + 1}`,
  academic_year: "2025-26",
  sections: ["A", "B", "C"].slice(0, i < 5 ? 2 : 3).map((s, si) => ({
    id: `c${i + 1}-s${si}`,
    class_id: `c${i + 1}`,
    name: s,
    class_teacher_id: undefined,
    student_count: 0,
  })),
}));

export function getClassName(classId: string) {
  return classes.find((c) => c.id === classId)?.name ?? classId;
}
