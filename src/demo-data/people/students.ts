import type { Student, Parent } from "@/types";
import { classes } from "@/demo-data/academics/classes";
import { firstNames, familySurnames, occupations, bloodGroups } from "@/demo-data/generators/namePools";
import { pick, randomInt } from "@/demo-data/generators/random";

const TOTAL_STUDENTS = 450;
const childrenPattern = [2, 1, 3, 2, 1, 2, 3, 1, 2, 2, 1, 3, 2, 1, 2, 1, 2, 3, 1, 2, 2, 1, 3, 1, 2];

// Build parent -> child-count list until we reach exactly TOTAL_STUDENTS.
const parentChildCounts: number[] = [];
{
  let running = 0;
  let p = 0;
  while (running < TOTAL_STUDENTS) {
    const count = Math.min(childrenPattern[p % childrenPattern.length], TOTAL_STUDENTS - running);
    parentChildCounts.push(count);
    running += count;
    p++;
  }
}
const TOTAL_PARENTS = parentChildCounts.length;

// Flat list of sections in class order, repeated so every section gets a
// roughly even share of the 450 students.
const sectionCycle = classes.flatMap((c) => c.sections.map((s) => ({ classId: c.id, sectionId: s.id })));

interface StudentSeed { name: string; parentIdx: number }
const studentSeeds: StudentSeed[] = [];
{
  let studentIdx = 0;
  for (let pi = 0; pi < TOTAL_PARENTS; pi++) {
    const surname = familySurnames[pi % familySurnames.length];
    for (let c = 0; c < parentChildCounts[pi]; c++) {
      studentSeeds.push({ name: `${firstNames[studentIdx % firstNames.length]} ${surname}`, parentIdx: pi });
      studentIdx++;
    }
  }
}

export const students: Student[] = studentSeeds.map((seed, i) => {
  const section = sectionCycle[i % sectionCycle.length];
  const rand = pick(["paid", "paid", "paid", "pending", "overdue"] as const);
  return {
    id: `stu${i + 1}`,
    admission_number: `ADM2025${String(i + 1).padStart(4, "0")}`,
    class_id: section.classId,
    section_id: section.sectionId,
    roll_number: (i % 40) + 1,
    date_of_birth: `${2008 + (i % 6)}-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
    gender: (i % 3 === 0 ? "female" : i % 7 === 0 ? "other" : "male") as "male" | "female" | "other",
    parent_id: `par${seed.parentIdx + 1}`,
    transport_route_id: i % 3 === 0 ? `r${(i % 6) + 1}` : undefined,
    name: seed.name,
    email: `${seed.name.toLowerCase().replace(/\s+/g, ".")}@school.edu`,
    phone: `98765${String(10000 + i).padStart(5, "0")}`,
    address: `${100 + i}, School Colony, Bangalore`,
    blood_group: pick(bloodGroups),
    attendance_pct: 75 + randomInt(0, 25),
    fee_status: rand,
  };
});

// Siblings share a transport route if any one of them has one.
{
  const parentRouteMap = new Map<string, string>();
  students.forEach((s) => { if (s.transport_route_id) parentRouteMap.set(s.parent_id, s.transport_route_id); });
  students.forEach((s) => { if (!s.transport_route_id && parentRouteMap.has(s.parent_id)) s.transport_route_id = parentRouteMap.get(s.parent_id); });
}

// Patch section student_count now that the roster is final.
{
  const counts = new Map<string, number>();
  students.forEach((s) => counts.set(s.section_id, (counts.get(s.section_id) ?? 0) + 1));
  classes.forEach((c) => c.sections.forEach((sec) => { sec.student_count = counts.get(sec.id) ?? 0; }));
}

export const parents: Parent[] = Array.from({ length: TOTAL_PARENTS }, (_, i) => {
  const surname = familySurnames[i % familySurnames.length];
  const childIds = students.filter((s) => s.parent_id === `par${i + 1}`).map((s) => s.id);
  return {
    id: `par${i + 1}`,
    name: `Mr/Mrs ${surname}`,
    email: `parent${i + 1}@school.edu`,
    phone: `98765${String(43210 + i).padStart(5, "0")}`,
    occupation: pick(occupations),
    address: `${100 + i}, MG Road, Bangalore`,
    children: childIds,
  };
});

export function getStudentsByClass(classId: string) {
  return students.filter((s) => s.class_id === classId);
}

export function getStudentsBySection(sectionId: string) {
  return students.filter((s) => s.section_id === sectionId);
}

export function getChildrenOfParent(parentId: string) {
  const parent = parents.find((p) => p.id === parentId);
  if (!parent) return [];
  return students.filter((s) => parent.children.includes(s.id));
}
