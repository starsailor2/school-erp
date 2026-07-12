import type { Teacher, TeacherType } from "@/types";
import { subjects } from "@/demo-data/academics/subjects";
import { firstNames, familySurnames } from "@/demo-data/generators/namePools";

const TOTAL_TEACHERS = 35;

export const teachers: Teacher[] = Array.from({ length: TOTAL_TEACHERS }, (_, i) => {
  const first = firstNames[i % firstNames.length];
  const last = familySurnames[i % familySurnames.length];
  const name = i % 2 === 0 ? `Mrs ${last}` : i % 3 === 0 ? `Mr ${last}` : `Ms ${last}`;
  const teacherType: TeacherType = i < 3 ? "hod" : i < 13 ? "class_teacher" : "subject_teacher";
  const subject = subjects[i % subjects.length];

  return {
    id: `t${i + 1}`,
    name,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@school.edu`,
    phone: `98765${String(50000 + i).padStart(5, "0")}`,
    department: subject.department,
    designation: i === 0 ? "Principal" : teacherType === "hod" ? "HOD" : i < 13 ? "Senior Teacher" : "Teacher",
    teacher_type: teacherType,
    subjects: [subject.id],
    assigned_classes: [`c${(i % 12) + 1}`, `c${((i + 4) % 12) + 1}`],
  };
});

export function getTeacherName(teacherId: string) {
  return teachers.find((t) => t.id === teacherId)?.name ?? teacherId;
}
