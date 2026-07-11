# Demo Data Restructuring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move all demo data out of `src/data/mock.ts` and the `src/data/*Store.ts` files into a new `src/demo-data/` folder split by domain, scale it up to a realistic mid-size school (~450 students), and add brand-new Hostel and Mess data models — without breaking any of the 107+ files that currently import from `src/data/`.

**Architecture:** Each domain gets its own folder under `src/demo-data/` with one file per entity. A seeded PRNG (`generators/random.ts`) makes the generated data deterministic across reloads instead of reshuffling on every hot-reload. `src/demo-data/index.ts` re-exports every symbol with the **exact same names** `src/data/mock.ts` exported, so downstream consumers only need their import path updated, not their code. The eight `*Store.ts` localStorage wrappers move into their matching domain folder with a one-line import update each. `src/data/staffPermissions.ts` (permission logic, not sample data) stays where it is. A one-time Node migration script rewrites all 107+ import statements app-wide, then is deleted.

**Tech Stack:** TypeScript, Node.js (for the one-time migration script — no new runtime dependency).

## Global Constraints

- Depends on the "Design System Foundation" plan being complete (specifically Task 10, which added `hostel_warden`/`mess_manager` to `StaffRole` and `hostel`/`mess` to `StaffFeature` in `src/types/index.ts`).
- Target scale (from spec §4): ~450 students, ~35 teachers, ~15 support staff, ~250 parent accounts, a full rolling year of attendance (~200 school days), 12 months of fee history, multi-exam mark history (3 exams × student × subject).
- Every new/moved file must compile under `strict`, `noUnusedLocals`, `noUnusedParameters` TypeScript.
- `@/*` resolves to `src/*`.
- No test framework exists. Verification per task is `npm run build` + `npm run lint`, plus a final full manual walkthrough.
- Every generated ID must remain **stable and unique** within its domain (existing code across the app keys off IDs like `stu1`, `t1`, `par1`, `c1-s0` — the new generators must produce IDs in the same `<prefix><n>` shape so any hardcoded ID references, e.g. `AuthContext.tsx`'s `roleUserMap` pointing at `stu1`/`t1`/`par1`/`sf1`, keep resolving to a real record).

---

## Task 1: Seeded random generator and name pools

**Files:**
- Create: `src/demo-data/generators/random.ts`
- Create: `src/demo-data/generators/namePools.ts`

**Interfaces:**
- Produces: `rng(): number` (0-1, deterministic), `pick<T>(arr: T[]): T`, `randomInt(min: number, max: number): number`, `shuffle<T>(arr: T[]): T[]`, `weightedPick<T>(entries: [T, number][]): T` from `random.ts`; `firstNames: string[]`, `familySurnames: string[]`, `teacherTitles: string[]`, `occupations: string[]`, `bloodGroups: string[]` from `namePools.ts`. Consumed by every domain file in this plan.

- [ ] **Step 1: Create the seeded RNG**

```ts
// src/demo-data/generators/random.ts

// Deterministic PRNG (mulberry32) so demo data stays stable across reloads
// instead of reshuffling every time a module re-evaluates.
function mulberry32(seed: number) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const seededRandom = mulberry32(20260711);

export function rng(): number {
  return seededRandom();
}

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function randomInt(min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function weightedPick<T>(entries: readonly [T, number][]): T {
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let r = rng() * total;
  for (const [value, weight] of entries) {
    r -= weight;
    if (r <= 0) return value;
  }
  return entries[entries.length - 1][0];
}
```

- [ ] **Step 2: Create the name pools**

```ts
// src/demo-data/generators/namePools.ts

export const firstNames = [
  "Amit", "Riya", "Rahul", "Priya", "Arjun", "Sneha", "Vikram", "Ananya", "Siddharth", "Kavya",
  "Rohan", "Ishita", "Aditya", "Meera", "Karthik", "Pooja", "Nikhil", "Divya", "Manish", "Neha",
  "Saurabh", "Ritika", "Abhishek", "Shreya", "Gaurav", "Tanvi", "Harsh", "Simran", "Varun", "Anjali",
  "Devansh", "Kriti", "Sachin", "Nisha", "Akhil", "Pallavi", "Rajat", "Swati", "Vivek", "Lakshmi",
  "Deepak", "Megha", "Pranav", "Roshni", "Kunal", "Ankita", "Mohit", "Sonal", "Tushar", "Payal",
  "Yash", "Aisha", "Krish", "Diya", "Reyansh", "Anika", "Vihaan", "Myra", "Aryan", "Zara",
  "Ayaan", "Naina", "Kabir", "Aadhya", "Dhruv", "Sara", "Ishaan", "Anvi", "Vivaan", "Riddhi",
  "Om", "Trisha", "Advait", "Navya", "Reyaan", "Amara", "Shaurya", "Kiara", "Atharv", "Prisha",
];

export const familySurnames = [
  "Kumar", "Sharma", "Das", "Singh", "Mehta", "Roy", "Patel", "Gupta", "Nair", "Reddy",
  "Verma", "Jain", "Rao", "Pillai", "Iyer", "Mishra", "Kapoor", "Tiwari", "Agarwal", "Pandey",
  "Saxena", "Bose", "Joshi", "Desai", "Kaur", "Chatterjee", "Menon", "Bhatt", "Malhotra", "Chauhan",
  "Sinha", "Ghosh", "Rana", "Thakur", "Bansal", "Kulkarni", "Shetty", "Trivedi", "Chowdhury", "Yadav",
];

export const teacherTitlePrefixes = ["Mrs", "Mr", "Ms", "Dr"];

export const occupations = ["Engineer", "Doctor", "Teacher", "Business Owner", "Lawyer", "Accountant", "Architect", "Government Officer", "Bank Manager", "Consultant"];

export const bloodGroups = ["A+", "B+", "O+", "AB+", "A-", "B-", "O-"];
```

- [ ] **Step 3: Verify the build**

Run: `npm run build`
Expected: succeeds (no consumers yet, standalone type-check).

- [ ] **Step 4: Commit**

```bash
git add src/demo-data/generators/random.ts src/demo-data/generators/namePools.ts
git commit -m "feat: add seeded RNG and expanded name pools for demo data generation"
```

---

## Task 2: Academics domain (classes, subjects, subject allocations)

**Files:**
- Create: `src/demo-data/academics/subjects.ts`
- Create: `src/demo-data/academics/classes.ts`

**Interfaces:**
- Consumes: `randomInt` from `generators/random.ts` (Task 1).
- Produces: `subjects: Subject[]` (10 entries, ids `sub1`..`sub10`, identical to today's), `classes: SchoolClass[]` (12 classes, ids `c1`..`c12`, each with 2-3 sections ids `c{n}-sA`/`sB`/`sC`, `student_count` populated after Task 3 runs — see Step 3 below for the two-pass wiring).

- [ ] **Step 1: Create subjects**

```ts
// src/demo-data/academics/subjects.ts
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
```

- [ ] **Step 2: Create classes (student_count set to 0 for now, patched in Task 3)**

```ts
// src/demo-data/academics/classes.ts
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
```

- [ ] **Step 3: Verify the build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/demo-data/academics/subjects.ts src/demo-data/academics/classes.ts
git commit -m "feat: add academics domain demo data (subjects, classes)"
```

---

## Task 3: People domain (parents, students, teachers, staff)

**Files:**
- Create: `src/demo-data/people/parents.ts`
- Create: `src/demo-data/people/students.ts`
- Create: `src/demo-data/people/teachers.ts`
- Create: `src/demo-data/people/staff.ts`

**Interfaces:**
- Consumes: `classes` from `academics/classes.ts` (Task 2, mutated in place to patch `student_count`/`class_teacher_id`), `subjects` from `academics/subjects.ts` (Task 2), `firstNames`/`familySurnames`/`teacherTitlePrefixes`/`occupations`/`bloodGroups` from `generators/namePools.ts` (Task 1), `randomInt`/`pick`/`weightedPick` from `generators/random.ts` (Task 1).
- Produces: `parents: Parent[]` (~245 entries, ids `par1..N`), `students: Student[]` (exactly 450 entries, ids `stu1..stu450`), `teachers: Teacher[]` (35 entries, ids `t1..t35`), `staffMembers: Staff[]` (15 entries, ids `sf1..sf15`, including 2 `hostel_warden` and 2 `mess_manager`). Consumed by every other domain in this plan and by `src/context/AuthContext.tsx`'s `roleUserMap` (which references `stu1`, `t1`, `par1`, `sf1` — all still valid ids after this change).

- [ ] **Step 1: Create teachers (created first — student generation needs `assigned_classes` for the class_teacher wiring)**

```ts
// src/demo-data/people/teachers.ts
import type { Teacher, TeacherType } from "@/types";
import { subjects } from "@/demo-data/academics/subjects";
import { firstNames, familySurnames } from "@/demo-data/generators/namePools";
import { randomInt } from "@/demo-data/generators/random";

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
```

- [ ] **Step 2: Wire class-teacher assignments onto `classes` sections**

Append to `src/demo-data/academics/classes.ts` (after the `classes` export from Task 2), importing teachers:

```ts
// (append to src/demo-data/academics/classes.ts)
import { teachers } from "@/demo-data/people/teachers";

const classTeacherPool = teachers.filter((t) => t.teacher_type === "class_teacher" || t.teacher_type === "hod");
let ctIdx = 0;
for (const cls of classes) {
  for (const sec of cls.sections) {
    sec.class_teacher_id = classTeacherPool[ctIdx % classTeacherPool.length].id;
    ctIdx++;
  }
}
```

- [ ] **Step 3: Create parents and students together (student count drives section `student_count`)**

```ts
// src/demo-data/people/students.ts
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
```

- [ ] **Step 4: Create staff (15 members, including the two new roles)**

```ts
// src/demo-data/people/staff.ts
import type { Staff } from "@/types";

export const staffMembers: Staff[] = [
  { id: "sf1", name: "Rajesh Kumar", email: "rajesh@school.edu", department: "Accounts", role_type: "accountant" },
  { id: "sf2", name: "Sunita Rao", email: "sunita.rao@school.edu", department: "Accounts", role_type: "accountant" },
  { id: "sf3", name: "Prakash Nair", email: "prakash.nair@school.edu", department: "Accounts", role_type: "accountant" },
  { id: "sf4", name: "Mohan Singh", email: "mohan@school.edu", department: "Transport", role_type: "transport_manager" },
  { id: "sf5", name: "Geeta Bansal", email: "geeta.bansal@school.edu", department: "Transport", role_type: "transport_manager" },
  { id: "sf6", name: "Priya Das", email: "priya.das@school.edu", department: "Library", role_type: "library_staff" },
  { id: "sf7", name: "Ramesh Iyer", email: "ramesh.iyer@school.edu", department: "Library", role_type: "library_staff" },
  { id: "sf8", name: "Seema Verma", email: "seema@school.edu", department: "Office", role_type: "office_staff" },
  { id: "sf9", name: "Anil Joshi", email: "anil@school.edu", department: "Office", role_type: "office_staff" },
  { id: "sf10", name: "Kavita Malhotra", email: "kavita.malhotra@school.edu", department: "Office", role_type: "office_staff" },
  { id: "sf11", name: "Suresh Chauhan", email: "suresh.chauhan@school.edu", department: "Office", role_type: "office_staff" },
  { id: "sf12", name: "Lakshmi Menon", email: "lakshmi.menon@school.edu", department: "Hostel", role_type: "hostel_warden" },
  { id: "sf13", name: "Ravi Thakur", email: "ravi.thakur@school.edu", department: "Hostel", role_type: "hostel_warden" },
  { id: "sf14", name: "Anita Ghosh", email: "anita.ghosh@school.edu", department: "Mess", role_type: "mess_manager" },
  { id: "sf15", name: "Vikram Trivedi", email: "vikram.trivedi@school.edu", department: "Mess", role_type: "mess_manager" },
];
```

- [ ] **Step 5: Verify the build**

Run: `npm run build`
Expected: succeeds. `classes` (Task 2) now has a circular-looking but valid dependency chain: `academics/classes.ts` imports `people/teachers.ts` for class-teacher wiring, and `people/students.ts` imports `academics/classes.ts` for section ids — this is a one-directional chain (`teachers` → `classes` → `students`), not a cycle, so it compiles cleanly.

- [ ] **Step 6: Commit**

```bash
git add src/demo-data/people/
git commit -m "feat: add people domain demo data (450 students, 35 teachers, 15 staff)"
```

---

## Task 4: Subject allocations (belongs to academics, depends on people)

**Files:**
- Create: `src/demo-data/academics/subjectAllocations.ts`

**Interfaces:**
- Consumes: `teachers` from `people/teachers.ts` (Task 3).
- Produces: `subjectAllocations: SubjectAllocation[]`.

- [ ] **Step 1: Create the file**

```ts
// src/demo-data/academics/subjectAllocations.ts
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
```

- [ ] **Step 2: Verify and commit**

Run: `npm run build` — expected to succeed.

```bash
git add src/demo-data/academics/subjectAllocations.ts
git commit -m "feat: add subject allocation demo data"
```

---

## Task 5: Attendance domain (student + teacher, full rolling year)

**Files:**
- Create: `src/demo-data/attendance/studentAttendance.ts`
- Create: `src/demo-data/attendance/teacherAttendance.ts`

**Interfaces:**
- Consumes: `students` from `people/students.ts` (Task 3), `teachers` from `people/teachers.ts` (Task 3), `weightedPick` from `generators/random.ts` (Task 1).
- Produces: `attendanceRecords: AttendanceRecord[]` (~200 school days × 450 students), `getStudentAttendance(studentId): AttendanceRecord[]`; `teacherAttendanceRecords: TeacherAttendanceRecord[]` (new type, ~200 school days × 35 teachers), `getTeacherAttendance(teacherId): TeacherAttendanceRecord[]`.

- [ ] **Step 1: Add a `TeacherAttendanceRecord` type**

In `src/types/index.ts`, after the existing `AttendanceRecord` interface (around line 161), add:

```ts
export interface TeacherAttendanceRecord {
  id: string;
  teacher_id: string;
  date: string;
  status: AttendanceStatus;
}
```

- [ ] **Step 2: Generate student attendance for the last ~200 school days**

```ts
// src/demo-data/attendance/studentAttendance.ts
import type { AttendanceRecord } from "@/types";
import { students } from "@/demo-data/people/students";
import { weightedPick } from "@/demo-data/generators/random";

// Walk backward from today, collecting weekdays only, until we have 200.
function schoolDays(count: number): string[] {
  const days: string[] = [];
  const d = new Date();
  while (days.length < count) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) days.push(d.toISOString().split("T")[0]);
    d.setDate(d.getDate() - 1);
  }
  return days.reverse();
}

const SCHOOL_DAYS = schoolDays(200);

export const attendanceRecords: AttendanceRecord[] = students.flatMap((s) =>
  SCHOOL_DAYS.map((date, di) => ({
    id: `att-${s.id}-${di}`,
    student_id: s.id,
    date,
    status: weightedPick([
      ["present", 88],
      ["absent", 8],
      ["late", 4],
    ] as const),
    marked_by: `t${(parseInt(s.class_id.replace("c", ""), 10) % 35) + 1}`,
  }))
);

export function getStudentAttendance(studentId: string) {
  return attendanceRecords.filter((a) => a.student_id === studentId);
}
```

- [ ] **Step 3: Generate teacher attendance for the same window**

```ts
// src/demo-data/attendance/teacherAttendance.ts
import type { TeacherAttendanceRecord } from "@/types";
import { teachers } from "@/demo-data/people/teachers";
import { weightedPick } from "@/demo-data/generators/random";

function schoolDays(count: number): string[] {
  const days: string[] = [];
  const d = new Date();
  while (days.length < count) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) days.push(d.toISOString().split("T")[0]);
    d.setDate(d.getDate() - 1);
  }
  return days.reverse();
}

const SCHOOL_DAYS = schoolDays(200);

export const teacherAttendanceRecords: TeacherAttendanceRecord[] = teachers.flatMap((t) =>
  SCHOOL_DAYS.map((date, di) => ({
    id: `tatt-${t.id}-${di}`,
    teacher_id: t.id,
    date,
    status: weightedPick([
      ["present", 94],
      ["absent", 3],
      ["late", 3],
    ] as const),
  }))
);

export function getTeacherAttendance(teacherId: string) {
  return teacherAttendanceRecords.filter((a) => a.teacher_id === teacherId);
}
```

- [ ] **Step 4: Verify and commit**

Run: `npm run build` — expected to succeed.

```bash
git add src/types/index.ts src/demo-data/attendance/
git commit -m "feat: add rolling-year student and teacher attendance demo data"
```

---

## Task 6: Homework, exams, and marks domains

**Files:**
- Create: `src/demo-data/homework/homework.ts`
- Create: `src/demo-data/exams/exams.ts`
- Create: `src/demo-data/exams/marks.ts`

**Interfaces:**
- Consumes: `classes` (Task 2), `subjects` (Task 2), `teachers` (Task 3), `students` (Task 3), `randomInt`/`pick` (Task 1).
- Produces: `homework: Homework[]`, `getClassHomework(classId): Homework[]`; `exams: Exam[]` (3 entries, same ids as today: `ex1`/`ex2`/`ex3`); `marks: Mark[]` (every student × every non-PE subject × all 3 exams), `getStudentMarks(studentId): Mark[]`.

- [ ] **Step 1: Create homework (one entry per class/section/subject combination for variety)**

```ts
// src/demo-data/homework/homework.ts
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
```

- [ ] **Step 2: Create exams**

```ts
// src/demo-data/exams/exams.ts
import type { Exam } from "@/types";

const now = new Date();
const y = now.getFullYear();

export const exams: Exam[] = [
  { id: "ex1", name: "Unit Test 1", exam_type: "unit_test", start_date: `${y}-02-20`, end_date: `${y}-02-22` },
  { id: "ex2", name: "Mid Term", exam_type: "mid_term", start_date: `${y}-05-15`, end_date: `${y}-05-25` },
  { id: "ex3", name: "Final Exam", exam_type: "final_exam", start_date: `${y}-11-01`, end_date: `${y}-11-15` },
];
```

- [ ] **Step 3: Create marks — every student, every core subject, every exam**

```ts
// src/demo-data/exams/marks.ts
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
```

- [ ] **Step 4: Verify and commit**

Run: `npm run build` — expected to succeed. Note: this generates 450 × 3 × 9 = 12,150 mark records — confirm the build doesn't time out or warn about chunk size beyond Vite's default (it won't; this is plain data, well under typical bundle-size warnings).

```bash
git add src/demo-data/homework/ src/demo-data/exams/
git commit -m "feat: add homework and multi-exam marks demo data"
```

---

## Task 7: Fees domain

**Files:**
- Create: `src/demo-data/fees/feeStructure.ts`
- Create: `src/demo-data/fees/fees.ts`

**Interfaces:**
- Consumes: `students` (Task 3), `classes` (Task 2), `pick`/`randomInt` (Task 1).
- Produces: `feeStructureItems: FeeStructureItem[]` (new type: per-class fee-type amounts, for the Fee Structure admin page), `fees: Fee[]` (tuition for every student across the last 12 months + transport for route-riders), `getStudentFees(studentId): Fee[]`.

- [ ] **Step 1: Add a `FeeStructureItem` type**

In `src/types/index.ts`, after the `Fee` interface (around line 201), add:

```ts
export interface FeeStructureItem {
  id: string;
  class_id: string;
  fee_type: FeeType;
  amount: number;
  frequency: "monthly" | "quarterly" | "annual";
}
```

- [ ] **Step 2: Create the fee structure (per-class tuition + flat transport/library/activity)**

```ts
// src/demo-data/fees/feeStructure.ts
import type { FeeStructureItem } from "@/types";
import { classes } from "@/demo-data/academics/classes";

export const feeStructureItems: FeeStructureItem[] = classes.flatMap((c, i) => [
  { id: `fs-${c.id}-tuition`, class_id: c.id, fee_type: "tuition", amount: 4500 + i * 150, frequency: "monthly" },
  { id: `fs-${c.id}-transport`, class_id: c.id, fee_type: "transport", amount: 2000, frequency: "monthly" },
  { id: `fs-${c.id}-library`, class_id: c.id, fee_type: "library", amount: 500, frequency: "annual" },
  { id: `fs-${c.id}-activity`, class_id: c.id, fee_type: "activity", amount: 1200, frequency: "quarterly" },
]);
```

- [ ] **Step 3: Create 12 months of tuition fee history plus transport fees**

```ts
// src/demo-data/fees/fees.ts
import type { Fee, FeeStatus } from "@/types";
import { students } from "@/demo-data/people/students";
import { feeStructureItems } from "@/demo-data/fees/feeStructure";
import { pick } from "@/demo-data/generators/random";

function lastNMonths(n: number): { year: number; month: number }[] {
  const out: { year: number; month: number }[] = [];
  const d = new Date();
  d.setDate(1);
  for (let i = 0; i < n; i++) {
    out.push({ year: d.getFullYear(), month: d.getMonth() });
    d.setMonth(d.getMonth() - 1);
  }
  return out.reverse();
}

const MONTHS = lastNMonths(12);

function dueDateFor(year: number, month: number): string {
  const d = new Date(year, month + 1, 5); // 5th of the following month
  return d.toISOString().split("T")[0];
}

export const fees: Fee[] = students.flatMap((s, si) => {
  const tuitionAmount = feeStructureItems.find((f) => f.class_id === s.class_id && f.fee_type === "tuition")?.amount ?? 5000;

  const tuitionFees: Fee[] = MONTHS.map(({ year, month }, mi) => {
    const isPastDue = mi < MONTHS.length - 1; // every month except the current one has resolved
    let status: FeeStatus;
    if (!isPastDue) {
      status = s.fee_status; // current month mirrors the student's live status
    } else {
      status = si % 11 === 0 ? "overdue" : "paid"; // small persistent-defaulter tail
    }
    return {
      id: `fee-${s.id}-${year}-${month}`,
      student_id: s.id,
      fee_type: "tuition",
      amount: tuitionAmount,
      due_date: dueDateFor(year, month),
      status,
      paid_date: status === "paid" ? dueDateFor(year, month) : undefined,
    };
  });

  const transportFee: Fee[] = s.transport_route_id
    ? [{
        id: `fee-tr-${s.id}`,
        student_id: s.id,
        fee_type: "transport" as const,
        amount: 2000,
        due_date: dueDateFor(MONTHS[MONTHS.length - 1].year, MONTHS[MONTHS.length - 1].month),
        status: pick(["paid", "paid", "pending"] as const),
        paid_date: undefined,
      }]
    : [];

  return [...tuitionFees, ...transportFee];
});

export function getStudentFees(studentId: string) {
  return fees.filter((f) => f.student_id === studentId);
}
```

- [ ] **Step 4: Verify and commit**

Run: `npm run build` — expected to succeed.

```bash
git add src/types/index.ts src/demo-data/fees/
git commit -m "feat: add fee structure and 12-month fee history demo data"
```

---

## Task 8: Transport domain

**Files:**
- Create: `src/demo-data/transport/routes.ts`
- Create: `src/demo-data/transport/vehicles.ts`
- Create: `src/demo-data/transport/drivers.ts`
- Create: `src/demo-data/transport/allocations.ts`

**Interfaces:**
- Consumes: `students` (Task 3).
- Produces: `routes: Route[]` (6 entries, ids `r1..r6`), `vehicles: Vehicle[]` (new type — one per route), `transportDrivers: TransportDriver[]`, `studentTransport: StudentTransport[]`, `getRouteName(routeId): string`.

- [ ] **Step 1: Create routes (6, matching the `r1..r6` ids already referenced by `students.ts`)**

```ts
// src/demo-data/transport/routes.ts
import type { Route } from "@/types";

export const routes: Route[] = [
  { id: "r1", name: "North Zone", vehicle_number: "KA01AB1234", driver_name: "Rajesh", driver_phone: "9876500001", capacity: 45, stops: ["MG Road", "Brigade Road", "Koramangala", "HSR Layout"] },
  { id: "r2", name: "City Center", vehicle_number: "KA01AB2345", driver_name: "Mohan", driver_phone: "9876500002", capacity: 40, stops: ["Majestic", "Vidhana Soudha", "Cubbon Park", "MG Road"] },
  { id: "r3", name: "East Area", vehicle_number: "KA01AB3456", driver_name: "Suresh", driver_phone: "9876500003", capacity: 45, stops: ["Whitefield", "Marathahalli", "Indiranagar", "Old Airport Road"] },
  { id: "r4", name: "South Zone", vehicle_number: "KA01AB4567", driver_name: "Ganesh", driver_phone: "9876500004", capacity: 42, stops: ["JP Nagar", "Jayanagar", "BTM Layout", "Bannerghatta Road"] },
  { id: "r5", name: "West Zone", vehicle_number: "KA01AB5678", driver_name: "Dinesh", driver_phone: "9876500005", capacity: 40, stops: ["Rajajinagar", "Malleshwaram", "Yeshwanthpur", "Vijaynagar"] },
  { id: "r6", name: "Outer Ring Road", vehicle_number: "KA01AB6789", driver_name: "Naresh", driver_phone: "9876500006", capacity: 45, stops: ["Sarjapur", "Electronic City", "Bommanahalli", "Silk Board"] },
];

export function getRouteName(routeId: string) {
  return routes.find((r) => r.id === routeId)?.name ?? routeId;
}
```

- [ ] **Step 2: Add a `Vehicle` type and create vehicle records**

In `src/types/index.ts`, after the `Route` interface (around line 231), add:

```ts
export interface Vehicle {
  id: string;
  vehicle_number: string;
  route_id: string;
  type: "bus" | "van" | "minibus";
  capacity: number;
  make_model: string;
  year: number;
  last_service_date: string;
  insurance_expiry: string;
  status: "active" | "maintenance" | "retired";
}
```

```ts
// src/demo-data/transport/vehicles.ts
import type { Vehicle } from "@/types";
import { routes } from "@/demo-data/transport/routes";

export const vehicles: Vehicle[] = routes.map((r, i) => ({
  id: `veh${i + 1}`,
  vehicle_number: r.vehicle_number,
  route_id: r.id,
  type: r.capacity > 42 ? "bus" : "minibus",
  capacity: r.capacity,
  make_model: ["Tata Starbus", "Ashok Leyland Falcon", "Force Traveller", "Eicher Skyline"][i % 4],
  year: 2020 + (i % 5),
  last_service_date: `2026-0${(i % 6) + 1}-15`,
  insurance_expiry: `2027-0${(i % 9) + 1}-01`,
  status: "active",
}));
```

- [ ] **Step 3: Create drivers**

```ts
// src/demo-data/transport/drivers.ts
import type { TransportDriver } from "@/types";
import { routes } from "@/demo-data/transport/routes";

export const transportDrivers: TransportDriver[] = routes.map((r, i) => ({
  id: `drv-${i + 1}`,
  name: r.driver_name,
  phone: r.driver_phone,
  route_id: r.id,
  vehicle_number: r.vehicle_number,
  license_no: `DL-${String(i + 1).padStart(3, "0")}-2024`,
}));
```

- [ ] **Step 4: Create student transport allocations**

```ts
// src/demo-data/transport/allocations.ts
import type { StudentTransport } from "@/types";
import { students } from "@/demo-data/people/students";
import { routes } from "@/demo-data/transport/routes";

export const studentTransport: StudentTransport[] = students
  .filter((s) => s.transport_route_id)
  .map((s, i) => {
    const route = routes.find((r) => r.id === s.transport_route_id)!;
    return {
      id: `st-${i}`,
      student_id: s.id,
      route_id: s.transport_route_id!,
      stop_name: route.stops[i % route.stops.length],
      pickup_time: `07:${String(15 + ((i * 5) % 40)).padStart(2, "0")} AM`,
    };
  });
```

- [ ] **Step 5: Verify and commit**

Run: `npm run build` — expected to succeed.

```bash
git add src/types/index.ts src/demo-data/transport/
git commit -m "feat: add transport domain demo data (6 routes, vehicles, drivers, allocations)"
```

---

## Task 9: Hostel domain (new)

**Files:**
- Create: `src/demo-data/hostel/blocks.ts`
- Create: `src/demo-data/hostel/rooms.ts`
- Create: `src/demo-data/hostel/allocations.ts`
- Create: `src/demo-data/hostel/fees.ts`

**Interfaces:**
- Consumes: `students` (Task 3), `staffMembers` (Task 3), `randomInt`/`shuffle` (Task 1).
- Produces new types `HostelBlock`, `HostelRoom`, `HostelAllocation`, `HostelFee` (added to `src/types/index.ts`) plus `hostelBlocks: HostelBlock[]`, `hostelRooms: HostelRoom[]`, `hostelAllocations: HostelAllocation[]`, `hostelFees: HostelFee[]`, `getHostelAllocationForStudent(studentId): HostelAllocation | undefined`, `getRoommates(studentId): Student[]`. Consumed by the "Dashboards & New Modules" plan.

- [ ] **Step 1: Add hostel types**

In `src/types/index.ts`, after the `LibraryRecord` interface (around line 301), add:

```ts
export type HostelRoomType = "single" | "double" | "dorm";
export type HostelGender = "boys" | "girls";

export interface HostelBlock {
  id: string;
  name: string;
  gender: HostelGender;
  warden_staff_id: string;
}

export interface HostelRoom {
  id: string;
  block_id: string;
  room_number: string;
  type: HostelRoomType;
  capacity: number;
}

export interface HostelAllocation {
  id: string;
  student_id: string;
  room_id: string;
  check_in_date: string;
  status: "active" | "vacated";
}

export interface HostelFee {
  id: string;
  student_id: string;
  amount: number;
  due_date: string;
  status: FeeStatus;
  paid_date?: string;
}
```

- [ ] **Step 2: Create blocks (2 boys + 2 girls, each assigned one of the 2 hostel wardens)**

```ts
// src/demo-data/hostel/blocks.ts
import type { HostelBlock } from "@/types";

export const hostelBlocks: HostelBlock[] = [
  { id: "hb1", name: "Aravali Block", gender: "boys", warden_staff_id: "sf12" },
  { id: "hb2", name: "Nilgiri Block", gender: "boys", warden_staff_id: "sf13" },
  { id: "hb3", name: "Vindhya Block", gender: "girls", warden_staff_id: "sf12" },
  { id: "hb4", name: "Satpura Block", gender: "girls", warden_staff_id: "sf13" },
];
```

- [ ] **Step 3: Create rooms (30 rooms per block, mixed single/double/dorm)**

```ts
// src/demo-data/hostel/rooms.ts
import type { HostelRoom, HostelRoomType } from "@/types";
import { hostelBlocks } from "@/demo-data/hostel/blocks";

const ROOM_TYPE_CYCLE: HostelRoomType[] = ["double", "double", "single", "dorm", "double", "double", "single"];
const CAPACITY_BY_TYPE: Record<HostelRoomType, number> = { single: 1, double: 2, dorm: 6 };
const ROOMS_PER_BLOCK = 25;

export const hostelRooms: HostelRoom[] = hostelBlocks.flatMap((block) =>
  Array.from({ length: ROOMS_PER_BLOCK }, (_, i) => {
    const type = ROOM_TYPE_CYCLE[i % ROOM_TYPE_CYCLE.length];
    return {
      id: `${block.id}-rm${i + 1}`,
      block_id: block.id,
      room_number: `${Math.floor(i / 10) + 1}${String((i % 10) + 1).padStart(2, "0")}`,
      type,
      capacity: CAPACITY_BY_TYPE[type],
    };
  })
);
```

- [ ] **Step 4: Allocate ~120 students to rooms (gender-matched blocks, respecting capacity)**

```ts
// src/demo-data/hostel/allocations.ts
import type { HostelAllocation } from "@/types";
import { students } from "@/demo-data/people/students";
import { hostelBlocks } from "@/demo-data/hostel/blocks";
import { hostelRooms } from "@/demo-data/hostel/rooms";
import { shuffle } from "@/demo-data/generators/random";

const TARGET_RESIDENTS = 120;

const boysBlockIds = new Set(hostelBlocks.filter((b) => b.gender === "boys").map((b) => b.id));
const girlsBlockIds = new Set(hostelBlocks.filter((b) => b.gender === "girls").map((b) => b.id));

const eligible = shuffle(students).filter((s) => s.gender !== "other").slice(0, TARGET_RESIDENTS);

const roomOccupancy = new Map<string, number>();

export const hostelAllocations: HostelAllocation[] = eligible.map((s, i) => {
  const candidateRooms = hostelRooms.filter((r) =>
    s.gender === "male" ? boysBlockIds.has(r.block_id) : girlsBlockIds.has(r.block_id)
  );
  // Find the first candidate room with free capacity.
  const room = candidateRooms.find((r) => (roomOccupancy.get(r.id) ?? 0) < r.capacity) ?? candidateRooms[0];
  roomOccupancy.set(room.id, (roomOccupancy.get(room.id) ?? 0) + 1);

  const checkIn = new Date();
  checkIn.setMonth(checkIn.getMonth() - ((i % 10) + 1));

  return {
    id: `ha-${i + 1}`,
    student_id: s.id,
    room_id: room.id,
    check_in_date: checkIn.toISOString().split("T")[0],
    status: "active",
  };
});

export function getHostelAllocationForStudent(studentId: string) {
  return hostelAllocations.find((a) => a.student_id === studentId && a.status === "active");
}

export function getRoommates(studentId: string) {
  const allocation = getHostelAllocationForStudent(studentId);
  if (!allocation) return [];
  const roommateIds = hostelAllocations
    .filter((a) => a.room_id === allocation.room_id && a.student_id !== studentId && a.status === "active")
    .map((a) => a.student_id);
  return students.filter((s) => roommateIds.includes(s.id));
}
```

- [ ] **Step 5: Create hostel fee history (last 12 months, for resident students only)**

```ts
// src/demo-data/hostel/fees.ts
import type { HostelFee, FeeStatus } from "@/types";
import { hostelAllocations } from "@/demo-data/hostel/allocations";

const MONTHLY_HOSTEL_FEE = 8000;

function lastNMonths(n: number): { year: number; month: number }[] {
  const out: { year: number; month: number }[] = [];
  const d = new Date();
  d.setDate(1);
  for (let i = 0; i < n; i++) {
    out.push({ year: d.getFullYear(), month: d.getMonth() });
    d.setMonth(d.getMonth() - 1);
  }
  return out.reverse();
}

const MONTHS = lastNMonths(12);

export const hostelFees: HostelFee[] = hostelAllocations.flatMap((alloc, ai) =>
  MONTHS.map(({ year, month }, mi) => {
    const dueDate = new Date(year, month + 1, 5).toISOString().split("T")[0];
    const isPastMonth = mi < MONTHS.length - 1;
    const status: FeeStatus = !isPastMonth ? (ai % 9 === 0 ? "pending" : "paid") : ai % 15 === 0 ? "overdue" : "paid";
    return {
      id: `hf-${alloc.student_id}-${year}-${month}`,
      student_id: alloc.student_id,
      amount: MONTHLY_HOSTEL_FEE,
      due_date: dueDate,
      status,
      paid_date: status === "paid" ? dueDate : undefined,
    };
  })
);
```

- [ ] **Step 6: Verify and commit**

Run: `npm run build` — expected to succeed.

```bash
git add src/types/index.ts src/demo-data/hostel/
git commit -m "feat: add hostel domain demo data (blocks, rooms, allocations, fees)"
```

---

## Task 10: Mess domain (new)

**Files:**
- Create: `src/demo-data/mess/menu.ts`
- Create: `src/demo-data/mess/plans.ts`
- Create: `src/demo-data/mess/attendance.ts`
- Create: `src/demo-data/mess/billing.ts`

**Interfaces:**
- Consumes: `hostelAllocations` from `hostel/allocations.ts` (Task 9), `randomInt`/`weightedPick` (Task 1).
- Produces new types `MessMeal`, `MessMenuEntry`, `MessPlan`, `MessAttendanceRecord`, `MessBilling` (added to `src/types/index.ts`) plus `messMenu: MessMenuEntry[]`, `messPlans: MessPlan[]`, `getMessPlanForStudent(studentId): MessPlan | undefined`, `messAttendance: MessAttendanceRecord[]`, `messBilling: MessBilling[]`.

- [ ] **Step 1: Add mess types**

In `src/types/index.ts`, after the hostel types added in Task 9, add:

```ts
export type MessMeal = "breakfast" | "lunch" | "snacks" | "dinner";
export type MessPlanType = "veg" | "non_veg";

export interface MessMenuEntry {
  id: string;
  day_of_week: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  meal: MessMeal;
  items: string[];
}

export interface MessPlan {
  id: string;
  student_id: string;
  plan_type: MessPlanType;
  subscribed_since: string;
}

export interface MessAttendanceRecord {
  id: string;
  student_id: string;
  date: string;
  meal: MessMeal;
  consumed: boolean;
}

export interface MessBilling {
  id: string;
  student_id: string;
  month_label: string; // e.g. "2026-06"
  amount: number;
  status: FeeStatus;
}
```

- [ ] **Step 2: Create the weekly rotating menu**

```ts
// src/demo-data/mess/menu.ts
import type { MessMenuEntry } from "@/types";

const days: MessMenuEntry["day_of_week"][] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const breakfastCycle = [["Idli", "Sambar", "Chutney"], ["Poha", "Tea"], ["Aloo Paratha", "Curd"], ["Upma", "Coconut Chutney"], ["Bread Omelette / Bread Jam", "Milk"], ["Dosa", "Sambar"], ["Puri", "Bhaji"]];
const lunchCycle = [["Rice", "Dal", "Mixed Veg", "Roti"], ["Rajma", "Rice", "Salad"], ["Chole", "Bhature", "Salad"], ["Sambar Rice", "Papad"], ["Paneer Curry", "Roti", "Rice"], ["Curd Rice", "Pickle"], ["Veg Biryani", "Raita"]];
const snacksCycle = [["Samosa", "Tea"], ["Fruit Bowl"], ["Sandwich", "Juice"], ["Bhel Puri"], ["Biscuits", "Milk"], ["Pakora", "Tea"], ["Cutlet", "Ketchup"]];
const dinnerCycle = [["Roti", "Dal Fry", "Sabzi"], ["Khichdi", "Papad"], ["Pulao", "Raita"], ["Roti", "Paneer", "Salad"], ["Fried Rice", "Manchurian"], ["Roti", "Egg Curry / Soya Curry"], ["Rice", "Sambar", "Poriyal"]];

export const messMenu: MessMenuEntry[] = days.flatMap((day, i) => [
  { id: `mm-${day}-breakfast`, day_of_week: day, meal: "breakfast" as const, items: breakfastCycle[i] },
  { id: `mm-${day}-lunch`, day_of_week: day, meal: "lunch" as const, items: lunchCycle[i] },
  { id: `mm-${day}-snacks`, day_of_week: day, meal: "snacks" as const, items: snacksCycle[i] },
  { id: `mm-${day}-dinner`, day_of_week: day, meal: "dinner" as const, items: dinnerCycle[i] },
]);
```

- [ ] **Step 3: Create mess plans (one per hostel resident)**

```ts
// src/demo-data/mess/plans.ts
import type { MessPlan } from "@/types";
import { hostelAllocations } from "@/demo-data/hostel/allocations";

export const messPlans: MessPlan[] = hostelAllocations.map((alloc, i) => ({
  id: `mp-${alloc.student_id}`,
  student_id: alloc.student_id,
  plan_type: i % 3 === 0 ? "non_veg" : "veg",
  subscribed_since: alloc.check_in_date,
}));

export function getMessPlanForStudent(studentId: string) {
  return messPlans.find((p) => p.student_id === studentId);
}
```

- [ ] **Step 4: Create 30 days of meal attendance for consumption analytics**

```ts
// src/demo-data/mess/attendance.ts
import type { MessAttendanceRecord, MessMeal } from "@/types";
import { messPlans } from "@/demo-data/mess/plans";
import { weightedPick } from "@/demo-data/generators/random";

const MEALS: MessMeal[] = ["breakfast", "lunch", "snacks", "dinner"];

function lastNDays(n: number): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = 0; i < n; i++) {
    out.push(d.toISOString().split("T")[0]);
    d.setDate(d.getDate() - 1);
  }
  return out.reverse();
}

const DAYS = lastNDays(30);

export const messAttendance: MessAttendanceRecord[] = messPlans.flatMap((plan) =>
  DAYS.flatMap((date) =>
    MEALS.map((meal) => ({
      id: `mat-${plan.student_id}-${date}-${meal}`,
      student_id: plan.student_id,
      date,
      meal,
      consumed: weightedPick([
        [true, meal === "snacks" ? 65 : 90],
        [false, meal === "snacks" ? 35 : 10],
      ] as const),
    }))
  )
);
```

- [ ] **Step 5: Create monthly mess billing**

```ts
// src/demo-data/mess/billing.ts
import type { MessBilling, FeeStatus } from "@/types";
import { messPlans } from "@/demo-data/mess/plans";

const MONTHLY_RATE: Record<"veg" | "non_veg", number> = { veg: 3500, non_veg: 4200 };

function lastNMonthLabels(n: number): string[] {
  const out: string[] = [];
  const d = new Date();
  d.setDate(1);
  for (let i = 0; i < n; i++) {
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    d.setMonth(d.getMonth() - 1);
  }
  return out.reverse();
}

const MONTH_LABELS = lastNMonthLabels(6);

export const messBilling: MessBilling[] = messPlans.flatMap((plan, pi) =>
  MONTH_LABELS.map((monthLabel, mi) => {
    const isCurrent = mi === MONTH_LABELS.length - 1;
    const status: FeeStatus = isCurrent ? (pi % 8 === 0 ? "pending" : "paid") : pi % 14 === 0 ? "overdue" : "paid";
    return {
      id: `mb-${plan.student_id}-${monthLabel}`,
      student_id: plan.student_id,
      month_label: monthLabel,
      amount: MONTHLY_RATE[plan.plan_type],
      status,
    };
  })
);
```

- [ ] **Step 6: Verify and commit**

Run: `npm run build` — expected to succeed.

```bash
git add src/types/index.ts src/demo-data/mess/
git commit -m "feat: add mess domain demo data (menu, plans, attendance, billing)"
```

---

## Task 11: Library domain

**Files:**
- Create: `src/demo-data/library/books.ts`

**Interfaces:**
- Produces: `libraryBooks: LibraryBook[]` (same 10 books as today).

- [ ] **Step 1: Create the file (content identical to the current `mock.ts` library section)**

```ts
// src/demo-data/library/books.ts
import type { LibraryBook } from "@/types";

export const libraryBooks: LibraryBook[] = [
  { id: "b1", title: "Science Basics", author: "R.K. Sharma", isbn: "978-0-1234-0001", category: "Science", total_copies: 5, available_copies: 3 },
  { id: "b2", title: "Mathematics Guide", author: "S. Gupta", isbn: "978-0-1234-0002", category: "Mathematics", total_copies: 4, available_copies: 0, issued_to: "stu1", issue_date: "2026-03-05", return_date: "2026-03-20" },
  { id: "b3", title: "English Grammar", author: "Wren & Martin", isbn: "978-0-1234-0003", category: "Language", total_copies: 6, available_copies: 4 },
  { id: "b4", title: "Indian History", author: "Bipin Chandra", isbn: "978-0-1234-0004", category: "History", total_copies: 3, available_copies: 0, issued_to: "stu5", issue_date: "2026-03-01", return_date: "2026-03-15" },
  { id: "b5", title: "Physics Fundamentals", author: "H.C. Verma", isbn: "978-0-1234-0005", category: "Science", total_copies: 5, available_copies: 5 },
  { id: "b6", title: "Chemistry Concepts", author: "O.P. Tandon", isbn: "978-0-1234-0006", category: "Science", total_copies: 4, available_copies: 2 },
  { id: "b7", title: "Biology Today", author: "Pradeep", isbn: "978-0-1234-0007", category: "Science", total_copies: 3, available_copies: 0, issued_to: "stu8", issue_date: "2026-03-07", return_date: "2026-03-21" },
  { id: "b8", title: "Computer Programming", author: "Sumita Arora", isbn: "978-0-1234-0008", category: "Computer Science", total_copies: 5, available_copies: 3 },
  { id: "b9", title: "Hindi Sahitya", author: "Premchand", isbn: "978-0-1234-0009", category: "Language", total_copies: 4, available_copies: 4 },
  { id: "b10", title: "Geography World", author: "D.R. Khullar", isbn: "978-0-1234-0010", category: "Geography", total_copies: 3, available_copies: 2 },
];
```

- [ ] **Step 2: Verify and commit**

Run: `npm run build` — expected to succeed.

```bash
git add src/demo-data/library/books.ts
git commit -m "feat: add library domain demo data"
```

---

## Task 12: Communication and staff-ops domains, and timetable

**Files:**
- Create: `src/demo-data/communication/announcements.ts`
- Create: `src/demo-data/communication/messages.ts`
- Create: `src/demo-data/communication/notifications.ts`
- Create: `src/demo-data/staffOps/tasks.ts`
- Create: `src/demo-data/staffOps/studentRequests.ts`
- Create: `src/demo-data/academics/timetable.ts`

**Interfaces:**
- Consumes: `students` (Task 3), `teachers` (Task 3), `staffMembers` (Task 3), `classes` (Task 2), `subjects` (Task 2).
- Produces: `announcements: Announcement[]`, `messages: Message[]`, `mockNotifications: Notification[]`, `defaultStaffTasks: StaffTask[]`, `defaultStudentRequests: StudentRequest[]`, `timetable: Record<string, TimetableEntry[]>`. Content is carried over unchanged from `src/data/mock.ts` (these lists don't need scaling per the spec — only people/attendance/fees/exams needed volume).

- [ ] **Step 1: Copy announcements verbatim**

```ts
// src/demo-data/communication/announcements.ts
import type { Announcement } from "@/types";

export const announcements: Announcement[] = [
  { id: "an1", title: "Parent Teacher Meeting", content: "PTM scheduled for 20th March. All parents are requested to attend.", created_by: "admin", date: "2026-03-08", target: "all", priority: "high" },
  { id: "an2", title: "Annual Day Celebration", content: "Annual Day on 30th March. Students to prepare cultural programs.", created_by: "admin", date: "2026-03-07", target: "all", priority: "medium" },
  { id: "an3", title: "Science Fair", content: "Science fair next week. Project submissions by 15th March.", created_by: "admin", date: "2026-03-06", target: "student", priority: "medium" },
  { id: "an4", title: "Holiday Notice", content: "School closed on Friday for Holi festival.", created_by: "admin", date: "2026-03-05", target: "all", priority: "low" },
  { id: "an5", title: "Sports Day", content: "Sports Day on 5th April. Practice sessions start next week.", created_by: "admin", date: "2026-03-04", target: "all", priority: "medium" },
  { id: "an6", title: "Fee Reminder", content: "Last date for fee payment is 31st March. Please clear dues.", created_by: "admin", date: "2026-03-03", target: "parent", priority: "high" },
  { id: "an7", title: "Staff Meeting", content: "All teaching staff to attend meeting on 12th March at 4 PM.", created_by: "admin", date: "2026-03-02", target: "teacher", priority: "medium" },
];
```

- [ ] **Step 2: Copy messages verbatim (ids reference `stu1`, `t1`, `par1`, `t4`, `par3`, `par5` — all still valid after Task 3)**

```ts
// src/demo-data/communication/messages.ts
import type { Message } from "@/types";

export const messages: Message[] = [
  { id: "m1", sender_id: "admin", receiver_id: "par1", content: "Please attend PTM on 20th March without fail.", timestamp: "2026-03-10T09:00:00", sender_name: "Principal", receiver_name: "Mr/Mrs Kumar" },
  { id: "m2", sender_id: "par1", receiver_id: "admin", content: "Sure, we will be there. Thank you.", timestamp: "2026-03-10T10:30:00", sender_name: "Mr/Mrs Kumar", receiver_name: "Principal" },
  { id: "m3", sender_id: "admin", receiver_id: "t1", content: "Please submit the mid-term question papers by Friday.", timestamp: "2026-03-09T11:00:00", sender_name: "Principal", receiver_name: "Mrs Sharma" },
  { id: "m4", sender_id: "t1", receiver_id: "admin", content: "Will submit by Thursday evening.", timestamp: "2026-03-09T11:30:00", sender_name: "Mrs Sharma", receiver_name: "Principal" },
  { id: "m5", sender_id: "admin", receiver_id: "par3", content: "Rahul's attendance is below 80%. Please ensure regular attendance.", timestamp: "2026-03-08T08:00:00", sender_name: "Principal", receiver_name: "Mr/Mrs Das" },
  { id: "m6", sender_id: "admin", receiver_id: "t4", content: "Please share the lab schedule for next week.", timestamp: "2026-03-07T14:00:00", sender_name: "Principal", receiver_name: "Mr Singh" },
  { id: "m7", sender_id: "t4", receiver_id: "admin", content: "Lab schedule has been shared on the notice board.", timestamp: "2026-03-07T15:00:00", sender_name: "Mr Singh", receiver_name: "Principal" },
  { id: "m8", sender_id: "admin", receiver_id: "par5", content: "Arjun has shown great improvement in Science. Keep it up!", timestamp: "2026-03-06T10:00:00", sender_name: "Principal", receiver_name: "Mr/Mrs Mehta" },
  { id: "m9", sender_id: "t1", receiver_id: "stu1", content: "Please submit your math assignment by tomorrow.", timestamp: "2026-03-11T09:00:00", sender_name: "Mrs Sharma", receiver_name: "Student" },
  { id: "m10", sender_id: "stu1", receiver_id: "t1", content: "Yes ma'am, I will submit it today.", timestamp: "2026-03-11T09:30:00", sender_name: "Student", receiver_name: "Mrs Sharma" },
  { id: "m11", sender_id: "t4", receiver_id: "stu1", content: "Great work on the science project! Keep it up.", timestamp: "2026-03-10T14:00:00", sender_name: "Mr Singh", receiver_name: "Student" },
  { id: "m12", sender_id: "stu1", receiver_id: "t4", content: "Thank you sir! I enjoyed working on it.", timestamp: "2026-03-10T14:30:00", sender_name: "Student", receiver_name: "Mr Singh" },
  { id: "m13", sender_id: "admin", receiver_id: "stu1", content: "You have been selected for the science quiz competition.", timestamp: "2026-03-09T11:00:00", sender_name: "School Office", receiver_name: "Student" },
  { id: "m14", sender_id: "stu1", receiver_id: "admin", content: "Thank you! I will prepare well for it.", timestamp: "2026-03-09T11:30:00", sender_name: "Student", receiver_name: "School Office" },
];
```

- [ ] **Step 3: Copy notifications verbatim**

```ts
// src/demo-data/communication/notifications.ts
import type { Notification } from "@/types";

export const mockNotifications: Notification[] = [
  { id: "n1", title: "New Homework", message: "New homework assigned for your class", type: "homework", read: false, timestamp: "2026-03-10T09:00:00" },
  { id: "n2", title: "Fee Reminder", message: "Term fees due by 31st March", type: "fee", read: false, timestamp: "2026-03-09T10:00:00" },
  { id: "n3", title: "PTM Scheduled", message: "Parent Teacher Meeting on 20th March", type: "announcement", read: true, timestamp: "2026-03-08T08:00:00" },
  { id: "n4", title: "Exam Schedule", message: "Unit Test 1 starts on 20th March", type: "exam", read: false, timestamp: "2026-03-07T12:00:00" },
  { id: "n5", title: "Attendance Alert", message: "Your attendance is below 80%", type: "attendance", read: true, timestamp: "2026-03-06T14:00:00" },
];
```

- [ ] **Step 4: Create staff tasks (ids reference `sf1`..`sf4`, still valid) and student requests**

```ts
// src/demo-data/staffOps/tasks.ts
import type { StaffTask } from "@/types";

export const defaultStaffTasks: StaffTask[] = [
  { id: "task-1", title: "Collect fees from 12 students", description: "Prioritize overdue accounts first.", category: "finance", location: "Accounts Office", created_date: "2026-03-16", assigned_to: "sf1", assigned_by: "admin", due_date: "2026-03-19", status: "pending", priority: "high" },
  { id: "task-2", title: "Issue library books", description: "Process class 7A request queue.", category: "library", location: "School Library", created_date: "2026-03-16", assigned_to: "sf6", assigned_by: "admin", due_date: "2026-03-19", status: "in_progress", priority: "medium" },
  { id: "task-3", title: "Update transport allocation", description: "Add newly admitted students to routes.", category: "transport", location: "Transport Desk", created_date: "2026-03-16", assigned_to: "sf4", assigned_by: "admin", due_date: "2026-03-20", status: "pending", priority: "high" },
  { id: "task-4", title: "Print ID cards", description: "Generate cards for office pickup.", category: "office", location: "Admin Office", created_date: "2026-03-16", assigned_to: "sf8", assigned_by: "admin", due_date: "2026-03-21", status: "pending", priority: "medium" },
  { id: "task-5", title: "Repair broken pipe near science block", description: "Maintenance team inspected but leak persists. Immediate support required to prevent class disruption.", category: "maintenance", location: "Science Block - Ground Floor", created_date: "2026-03-17", assigned_to: "sf8", assigned_by: "admin", due_date: "2026-03-19", status: "in_progress", priority: "high" },
  { id: "task-6", title: "Inspect hostel room fittings", description: "Quarterly maintenance check across Aravali Block.", category: "maintenance", location: "Aravali Block", created_date: "2026-03-17", assigned_to: "sf12", assigned_by: "admin", due_date: "2026-03-22", status: "pending", priority: "medium" },
  { id: "task-7", title: "Finalize next week's mess menu", description: "Confirm vendor availability for the non-veg rotation.", category: "general", location: "Mess Hall", created_date: "2026-03-17", assigned_to: "sf14", assigned_by: "admin", due_date: "2026-03-20", status: "pending", priority: "low" },
];
```

```ts
// src/demo-data/staffOps/studentRequests.ts
import type { StudentRequest } from "@/types";

export const defaultStudentRequests: StudentRequest[] = [
  { id: "sr-1", student_id: "stu3", request_type: "transfer_certificate", status: "pending", requested_date: "2026-03-16", assigned_to: "sf8", note: "Family relocation to Pune." },
  { id: "sr-2", student_id: "stu8", request_type: "duplicate_id_card", status: "in_progress", requested_date: "2026-03-15", assigned_to: "sf9" },
  { id: "sr-3", student_id: "stu2", request_type: "fee_receipt", status: "completed", requested_date: "2026-03-14", assigned_to: "sf1" },
  { id: "sr-4", student_id: "stu11", request_type: "bonafide_certificate", status: "pending", requested_date: "2026-03-17", assigned_to: "sf8" },
];
```

- [ ] **Step 5: Create the timetable generator (same algorithm as today, driven by the scaled classes/teachers/subjects)**

```ts
// src/demo-data/academics/timetable.ts
import type { TimetableEntry } from "@/types";
import { classes } from "@/demo-data/academics/classes";
import { teachers } from "@/demo-data/people/teachers";
import { subjects } from "@/demo-data/academics/subjects";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const LUNCH_PERIOD = 5;

function buildTimetable(): Record<string, TimetableEntry[]> {
  const entries: Record<string, TimetableEntry[]> = {};
  for (const d of daysOfWeek) entries[d] = [];

  const teacherSubjectPairs = teachers.map((t) => ({
    teacher: t.name,
    subject: subjects.find((s) => s.id === t.subjects[0])?.name ?? "General",
  }));

  const totalPeriods = (di: number) => (di < 5 ? 9 : 5);
  const sportsTeacher = teachers.find((t) => t.subjects.includes("sub10"))?.name ?? "Sports Coach";

  const periodTime = (p: number) => {
    if (p <= 4) return `${7 + p}:00 - ${7 + p}:45`;
    if (p === LUNCH_PERIOD) return "12:00 - 12:30";
    return `${7 + p - 1}:00 - ${7 + p - 1}:45`;
  };

  for (const cls of classes) {
    for (const sec of cls.sections) {
      const clsNum = parseInt(cls.id.replace("c", ""), 10);
      daysOfWeek.forEach((dayName, di) => {
        const numPeriods = totalPeriods(di);
        const offset = di + clsNum + sec.name.charCodeAt(0);
        const ptSlots = [{ day: 1, period: 3 }, { day: 4, period: 7 }];
        const isPT = (day: number, period: number) => ptSlots.some((s) => s.day === day && s.period === period && period <= numPeriods);

        for (let p = 1; p <= numPeriods; p++) {
          if (p === LUNCH_PERIOD) {
            entries[dayName].push({ period: p, subject: "Lunch Break", teacher: "", class_name: cls.name.replace("Class ", ""), section: sec.name, time: periodTime(p) });
            continue;
          }
          if (isPT(di, p)) {
            entries[dayName].push({ period: p, subject: "Physical Training", teacher: sportsTeacher, class_name: cls.name.replace("Class ", ""), section: sec.name, time: periodTime(p) });
            continue;
          }
          const actualP = p > LUNCH_PERIOD ? p - 1 : p;
          const pairIdx = (offset + actualP) % teacherSubjectPairs.length;
          const pair = teacherSubjectPairs[pairIdx];
          entries[dayName].push({ period: p, subject: pair.subject, teacher: pair.teacher, class_name: cls.name.replace("Class ", ""), section: sec.name, time: periodTime(p) });
        }
      });
    }
  }
  return entries;
}

export const timetable: Record<string, TimetableEntry[]> = buildTimetable();
```

- [ ] **Step 6: Verify and commit**

Run: `npm run build` — expected to succeed.

```bash
git add src/demo-data/communication/ src/demo-data/staffOps/ src/demo-data/academics/timetable.ts
git commit -m "feat: add communication, staff-ops, and timetable demo data"
```

---

## Task 13: Central `index.ts` re-export surface

**Files:**
- Create: `src/demo-data/index.ts`

**Interfaces:**
- Consumes: every export from every domain file created in Tasks 1-12.
- Produces: a single module `@/demo-data` that re-exports every symbol `src/data/mock.ts` used to export, under the **same names**, so Task 14's import-path migration is a pure path swap.

- [ ] **Step 1: Create the barrel file**

```ts
// src/demo-data/index.ts
export * from "./academics/subjects";
export * from "./academics/classes";
export * from "./academics/subjectAllocations";
export * from "./academics/timetable";
export * from "./people/teachers";
export * from "./people/students";
export * from "./people/staff";
export * from "./attendance/studentAttendance";
export * from "./attendance/teacherAttendance";
export * from "./homework/homework";
export * from "./exams/exams";
export * from "./exams/marks";
export * from "./fees/feeStructure";
export * from "./fees/fees";
export * from "./transport/routes";
export * from "./transport/vehicles";
export * from "./transport/drivers";
export * from "./transport/allocations";
export * from "./hostel/blocks";
export * from "./hostel/rooms";
export * from "./hostel/allocations";
export * from "./hostel/fees";
export * from "./mess/menu";
export * from "./mess/plans";
export * from "./mess/attendance";
export * from "./mess/billing";
export * from "./library/books";
export * from "./communication/announcements";
export * from "./communication/messages";
export * from "./communication/notifications";
export * from "./staffOps/tasks";
export * from "./staffOps/studentRequests";
```

- [ ] **Step 2: Verify no export-name collisions**

Run: `npm run build`
Expected: succeeds. If it fails with a "Module has already exported a member named X" error, two domain files exported the same symbol name — resolve by renaming the colliding symbol in its source file (this should not happen given the domain split above, since each entity name is unique, but is called out here as the one realistic failure mode for a wildcard-export barrel).

- [ ] **Step 3: Commit**

```bash
git add src/demo-data/index.ts
git commit -m "feat: add demo-data barrel export matching the legacy mock.ts surface"
```

---

## Task 14: Migrate the eight `*Store.ts` files

**Files:**
- Create: `src/demo-data/communication/announcementStore.ts` (moved from `src/data/announcementStore.ts`)
- Create: `src/demo-data/communication/messageStore.ts` (moved from `src/data/messageStore.ts`)
- Create: `src/demo-data/communication/notificationStore.ts` (moved from `src/data/notificationStore.ts`)
- Create: `src/demo-data/fees/feeTransactionStore.ts` (moved from `src/data/feeTransactionStore.ts`)
- Create: `src/demo-data/library/libraryCirculationStore.ts` (moved from `src/data/libraryCirculationStore.ts`)
- Create: `src/demo-data/transport/transportRouteStore.ts` (moved from `src/data/transportRouteStore.ts`)
- Create: `src/demo-data/staffOps/staffTaskStore.ts` (moved from `src/data/staffTaskStore.ts`)
- Create: `src/demo-data/staffOps/studentRequestStore.ts` (moved from `src/data/studentRequestStore.ts`)
- Delete: all eight original files under `src/data/`

**Interfaces:**
- Each store's public function signatures (e.g. `getStaffFees()`, `recordFeePayment(input)`, `getAnnouncements()`, `addAnnouncement(row)`, etc.) are **unchanged** — only the single `from "@/data/mock"` import line in each file changes to point at its new sibling domain file.

- [ ] **Step 1: Move each file, changing only its first import line**

For each of the 8 files, copy its exact current content (read in this session; unchanged except the noted import line) to its new path:

- `src/demo-data/communication/announcementStore.ts` — change line 1 to `import { announcements as defaultAnnouncements } from "@/demo-data/communication/announcements";`
- `src/demo-data/communication/messageStore.ts` — change line 1 to `import { messages as defaultMessages } from "@/demo-data/communication/messages";`
- `src/demo-data/communication/notificationStore.ts` — change line 2 to `import { mockNotifications } from "@/demo-data/communication/notifications";`
- `src/demo-data/fees/feeTransactionStore.ts` — change line 1 to `import { fees } from "@/demo-data/fees/fees";`
- `src/demo-data/library/libraryCirculationStore.ts` — change line 1 to `import { libraryBooks } from "@/demo-data/library/books";`
- `src/demo-data/transport/transportRouteStore.ts` — change line 1 to `import { routes } from "@/demo-data/transport/routes";`
- `src/demo-data/staffOps/staffTaskStore.ts` — change line 1 to `import { defaultStaffTasks } from "@/demo-data/staffOps/tasks";`
- `src/demo-data/staffOps/studentRequestStore.ts` — change line 1 to `import { defaultStudentRequests } from "@/demo-data/staffOps/studentRequests";`

Every other line in each file is copied verbatim from the version already read earlier in this plan's research (Task descriptions above show the full original content of each).

- [ ] **Step 2: Delete the originals**

```bash
git rm src/data/announcementStore.ts src/data/messageStore.ts src/data/notificationStore.ts src/data/feeTransactionStore.ts src/data/libraryCirculationStore.ts src/data/transportRouteStore.ts src/data/staffTaskStore.ts src/data/studentRequestStore.ts
```

- [ ] **Step 3: Verify the build fails with the expected error**

Run: `npm run build`
Expected: **FAILS** — every file elsewhere in the app that imports e.g. `@/data/announcementStore` now has a broken module resolution. This confirms the deletion is real; Task 15 fixes all call sites.

- [ ] **Step 4: Commit this intermediate (broken) state is NOT allowed — hold the commit**

Do not commit yet. Proceed directly to Task 15, then commit both together (Task 15's Step 3 covers the commit for this move).

---

## Task 15: Migrate all remaining `@/data/*` imports app-wide

**Files:**
- Modify: every `.ts`/`.tsx` file under `src` that imports from `@/data/mock` or one of the eight moved store paths (107+ files — enumerated by the script below, not by hand).
- Create (temporary): `migrate-imports.mjs` at the repo root.
- Delete: `migrate-imports.mjs` (after running it).

**Interfaces:**
- No code-level interface changes — this is a pure import-specifier rewrite. Every renamed symbol keeps its exact name (guaranteed by Task 13's barrel re-exporting under identical names).

- [ ] **Step 1: Write the one-time migration script**

```js
// migrate-imports.mjs (repo root, temporary)
import { readdirSync, statSync, readFileSync, writeFileSync } from "node:fs";
import { join, extname } from "node:path";

const REPLACEMENTS = [
  [/from "@\/data\/mock"/g, 'from "@/demo-data"'],
  [/from "@\/data\/announcementStore"/g, 'from "@/demo-data/communication/announcementStore"'],
  [/from "@\/data\/messageStore"/g, 'from "@/demo-data/communication/messageStore"'],
  [/from "@\/data\/notificationStore"/g, 'from "@/demo-data/communication/notificationStore"'],
  [/from "@\/data\/feeTransactionStore"/g, 'from "@/demo-data/fees/feeTransactionStore"'],
  [/from "@\/data\/libraryCirculationStore"/g, 'from "@/demo-data/library/libraryCirculationStore"'],
  [/from "@\/data\/transportRouteStore"/g, 'from "@/demo-data/transport/transportRouteStore"'],
  [/from "@\/data\/staffTaskStore"/g, 'from "@/demo-data/staffOps/staffTaskStore"'],
  [/from "@\/data\/studentRequestStore"/g, 'from "@/demo-data/staffOps/studentRequestStore"'],
];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === "node_modules" || entry === "demo-data") continue; // never rewrite the new domain files themselves
      walk(full, out);
    } else if ([".ts", ".tsx"].includes(extname(full))) {
      out.push(full);
    }
  }
  return out;
}

let changedCount = 0;
for (const file of walk("src")) {
  const original = readFileSync(file, "utf8");
  let updated = original;
  for (const [pattern, replacement] of REPLACEMENTS) {
    updated = updated.replace(pattern, replacement);
  }
  if (updated !== original) {
    writeFileSync(file, updated, "utf8");
    changedCount++;
    console.log(`updated: ${file}`);
  }
}
console.log(`\nTotal files updated: ${changedCount}`);
```

- [ ] **Step 2: Run it**

Run: `node migrate-imports.mjs`
Expected: prints one `updated: <path>` line per changed file, then a total count of roughly 107-115 (matching the file counts found during research: 107 files imported `@/data/mock`, plus a handful more that only imported one of the 8 store modules without also importing `mock` directly).

- [ ] **Step 3: Verify, delete the script, and commit everything from Task 14 and 15 together**

Run: `npm run build`
Expected: succeeds with zero errors — every import now resolves into `src/demo-data/`.

```bash
rm migrate-imports.mjs
git add -A
git commit -m "feat: migrate all data imports from src/data/mock to src/demo-data"
```

- [ ] **Step 4: Confirm `src/data/` now contains only `staffPermissions.ts`**

Run: `ls src/data/` (or `Get-ChildItem src/data` in PowerShell)
Expected: exactly one file, `staffPermissions.ts` (kept in place — it's permission logic, not sample data, per this plan's Global Constraints).

- [ ] **Step 5: Delete the now-empty legacy data file**

```bash
git rm src/data/mock.ts
git commit -m "chore: remove legacy mock.ts now that all data lives in src/demo-data"
```

---

## Task 16: Full-app verification pass

**Files:** none (verification only)

- [ ] **Step 1: Full build**

Run: `npm run build`
Expected: `tsc -b` and `vite build` both succeed with zero errors.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: zero errors.

- [ ] **Step 3: Manual walkthrough — data integrity spot checks**

Run: `npm run dev`. Check:
- `/admin` dashboard: student/teacher/staff counts show 450/35/15 (not the old 50/12/5).
- `/admin/students`: the list loads all 450 students without error; opening a student profile resolves its class, section, parent, and fees correctly.
- `/login` as student (`stu1`) and parent (`par1`) still work — `AuthContext`'s hardcoded `roleUserMap` ids resolve to real records.
- `/admin/fees/collection`: 12 months of fee history are visible for a sampled student.
- `/admin/exams/marks`: marks exist for all 3 exams, not just `ex1`.
- No console errors on any of the 5 dashboards.

- [ ] **Step 4: Commit (if any fixes were needed)**

If Steps 1-3 required fixes, stage and commit them. If no fixes were needed, this task requires no commit.
