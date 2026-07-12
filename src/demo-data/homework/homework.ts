import type { Homework } from "@/types";
import { classes } from "@/demo-data/academics/classes";
import { subjects } from "@/demo-data/academics/subjects";
import { teachers } from "@/demo-data/people/teachers";
import { randomInt } from "@/demo-data/generators/random";

const homeworkTitles: Record<string, string> = {
  sub1: "Practice Problem Set", sub2: "Lab Worksheet", sub3: "Balancing Equations",
  sub4: "Diagram Labeling", sub5: "Essay Writing", sub6: "Vyakaran Abhyas",
  sub7: "Timeline Chart", sub8: "Map Work", sub9: "Coding Exercise", sub10: "Fitness Log",
};

export const homework: Homework[] = classes.slice(0, 8).flatMap((cls, ci) =>
  cls.sections.map((sec, si) => {
    const subject = subjects[(ci + si) % (subjects.length - 1)]; // skip PE (last)
    const teacher = teachers[(ci * 3 + si) % teachers.length];
    const assignedDaysAgo = randomInt(1, 10);
    const dueInDays = randomInt(1, 7);
    const assigned = new Date();
    assigned.setDate(assigned.getDate() - assignedDaysAgo);
    const due = new Date();
    due.setDate(due.getDate() + dueInDays);
    return {
      id: `hw-${cls.id}-${sec.id}`,
      class_id: cls.id,
      section_id: sec.id,
      subject_id: subject.id,
      teacher_id: teacher.id,
      title: homeworkTitles[subject.id] ?? "Assignment",
      description: `Complete the ${(homeworkTitles[subject.id] ?? "assignment").toLowerCase()} for ${subject.name}.`,
      due_date: due.toISOString().split("T")[0],
      assigned_date: assigned.toISOString().split("T")[0],
    };
  })
);

export function getClassHomework(classId: string) {
  return homework.filter((h) => h.class_id === classId);
}
