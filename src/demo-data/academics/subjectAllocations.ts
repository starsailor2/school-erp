import type { SubjectAllocation } from "@/types";
import { teachers } from "@/demo-data/people/teachers";

export const subjectAllocations: SubjectAllocation[] = teachers.flatMap((t, i) =>
  t.assigned_classes.map((cls, j) => ({
    id: `sa-${i}-${j}`,
    teacher_id: t.id,
    class_id: cls,
    section_id: `${cls}-s0`,
    subject_id: t.subjects[0],
    periods_per_week: 3 + ((i + j) % 4),
  }))
);

export function getTeacherClasses(teacherId: string) {
  return subjectAllocations.filter((a) => a.teacher_id === teacherId);
}
