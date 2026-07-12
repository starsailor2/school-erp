import type { Subject } from "@/types";

export const subjects: Subject[] = [
  { id: "sub1", name: "Mathematics", department: "Science" },
  { id: "sub2", name: "Physics", department: "Science" },
  { id: "sub3", name: "Chemistry", department: "Science" },
  { id: "sub4", name: "Biology", department: "Science" },
  { id: "sub5", name: "English", department: "Language" },
  { id: "sub6", name: "Hindi", department: "Language" },
  { id: "sub7", name: "History", department: "Social Science" },
  { id: "sub8", name: "Geography", department: "Social Science" },
  { id: "sub9", name: "Computer Science", department: "Science" },
  { id: "sub10", name: "Physical Education", department: "Sports" },
];

export function getSubjectName(subjectId: string) {
  return subjects.find((s) => s.id === subjectId)?.name ?? subjectId;
}
