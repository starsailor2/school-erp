import type { Homework } from "@/types";
import { subjectAllocations } from "@/demo-data/academics/subjectAllocations";
import { getSubjectName } from "@/demo-data/academics/subjects";
import { randomInt } from "@/demo-data/generators/random";

const homeworkTitles: Record<string, string> = {
  sub1: "Practice Problem Set", sub2: "Lab Worksheet", sub3: "Balancing Equations",
  sub4: "Diagram Labeling", sub5: "Essay Writing", sub6: "Vyakaran Abhyas",
  sub7: "Timeline Chart", sub8: "Map Work", sub9: "Coding Exercise", sub10: "Fitness Log",
};

// Each teacher-class-subject allocation gets several homework entries spread
// over the term (not just one), so a teacher's homework history reflects
// actual assigned classes/subjects rather than an arbitrary class-section rotation.
export const homework: Homework[] = subjectAllocations.flatMap((alloc) => {
  const subjectName = getSubjectName(alloc.subject_id);
  const title = homeworkTitles[alloc.subject_id] ?? "Assignment";
  const count = randomInt(2, 5);
  return Array.from({ length: count }, (_, i) => {
    const assignedDaysAgo = randomInt(3, 50);
    const dueAfterDays = randomInt(3, 10);
    const assigned = new Date();
    assigned.setDate(assigned.getDate() - assignedDaysAgo);
    const due = new Date(assigned);
    due.setDate(due.getDate() + dueAfterDays);
    return {
      id: `hw-${alloc.id}-${i}`,
      class_id: alloc.class_id,
      section_id: alloc.section_id,
      subject_id: alloc.subject_id,
      teacher_id: alloc.teacher_id,
      title,
      description: `Complete the ${title.toLowerCase()} for ${subjectName}.`,
      due_date: due.toISOString().split("T")[0],
      assigned_date: assigned.toISOString().split("T")[0],
    };
  });
});

export function getClassHomework(classId: string) {
  return homework.filter((h) => h.class_id === classId);
}
