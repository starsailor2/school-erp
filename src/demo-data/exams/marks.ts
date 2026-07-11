import type { Mark } from "@/types";
import { students } from "@/demo-data/people/students";
import { subjects } from "@/demo-data/academics/subjects";
import { exams } from "@/demo-data/exams/exams";
import { randomInt } from "@/demo-data/generators/random";

const coreSubjects = subjects.filter((s) => s.id !== "sub10"); // exclude Physical Education

function gradeFor(pct: number): string {
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B+";
  if (pct >= 60) return "B";
  if (pct >= 50) return "C";
  return "D";
}

export const marks: Mark[] = students.flatMap((s) =>
  exams.flatMap((exam) =>
    coreSubjects.map((sub) => {
      // Give each student a stable per-student aptitude baseline so their
      // marks trend consistently across exams rather than pure noise.
      const baseline = 45 + (parseInt(s.id.replace("stu", ""), 10) % 40);
      const variance = randomInt(-8, 12);
      const obtained = Math.max(20, Math.min(100, baseline + variance));
      return {
        id: `mk-${s.id}-${exam.id}-${sub.id}`,
        student_id: s.id,
        exam_id: exam.id,
        subject_id: sub.id,
        marks_obtained: obtained,
        max_marks: 100,
        grade: gradeFor(obtained),
      };
    })
  )
);

export function getStudentMarks(studentId: string) {
  return marks.filter((m) => m.student_id === studentId);
}
