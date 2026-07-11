import type { Exam } from "@/types";

const now = new Date();
const y = now.getFullYear();

export const exams: Exam[] = [
  { id: "ex1", name: "Unit Test 1", exam_type: "unit_test", start_date: `${y}-02-20`, end_date: `${y}-02-22` },
  { id: "ex2", name: "Mid Term", exam_type: "mid_term", start_date: `${y}-05-15`, end_date: `${y}-05-25` },
  { id: "ex3", name: "Final Exam", exam_type: "final_exam", start_date: `${y}-11-01`, end_date: `${y}-11-15` },
];
