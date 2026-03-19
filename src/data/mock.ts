import type {
  Student, Parent, Teacher, Staff, SchoolClass, Subject,
  SubjectAllocation, AttendanceRecord, Homework, Exam, Mark,
  Fee, Route, StudentTransport, Announcement, Message, TimetableEntry,
  LibraryBook, Notification, TransportDriver, StaffTask, StudentRequest,
} from "@/types";

// ─── Classes & Sections ────────────────────────────────────────────
export const classes: SchoolClass[] = Array.from({ length: 12 }, (_, i) => ({
  id: `c${i + 1}`,
  name: `Class ${i + 1}`,
  academic_year: "2025-26",
  sections: ["A", "B", "C"].slice(0, i < 5 ? 2 : 3).map((s, si) => ({
    id: `c${i + 1}-s${si}`,
    class_id: `c${i + 1}`,
    name: s,
    class_teacher_id: `t${(i * 3 + si) % 12 + 1}`,
    student_count: 30 + Math.floor(Math.random() * 15),
  })),
}));

// ─── Subjects ────────────────────────────────────────────────────
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

// ─── Parents (defined first so students can reference surnames) ──
const familySurnames = [
  "Kumar", "Sharma", "Das", "Singh", "Mehta",
  "Roy", "Patel", "Gupta", "Nair", "Reddy",
  "Verma", "Jain", "Rao", "Pillai", "Iyer",
  "Mishra", "Kapoor", "Tiwari", "Agarwal", "Pandey",
  "Saxena", "Bose", "Joshi", "Desai", "Kaur",
];

// Varying child counts: 1, 2, or 3 children per parent
const childrenPerParent = [2, 1, 3, 2, 1, 2, 3, 1, 2, 2, 1, 3, 2, 1, 2, 1, 2, 3, 1, 2, 2, 1, 3, 1, 2];

// Build parent→student mapping
const parentChildIndices: number[][] = [];
let studentIdx = 0;
for (let i = 0; i < 25; i++) {
  const count = childrenPerParent[i] ?? 1;
  const indices: number[] = [];
  for (let j = 0; j < count && studentIdx < 50; j++) {
    indices.push(studentIdx);
    studentIdx++;
  }
  parentChildIndices.push(indices);
}

// ─── Students ────────────────────────────────────────────────────
const firstNames = [
  "Amit", "Riya", "Rahul", "Priya", "Arjun",
  "Sneha", "Vikram", "Ananya", "Siddharth", "Kavya",
  "Rohan", "Ishita", "Aditya", "Meera", "Karthik",
  "Pooja", "Nikhil", "Divya", "Manish", "Neha",
  "Saurabh", "Ritika", "Abhishek", "Shreya", "Gaurav",
  "Tanvi", "Harsh", "Simran", "Varun", "Anjali",
  "Devansh", "Kriti", "Sachin", "Nisha", "Akhil",
  "Pallavi", "Rajat", "Swati", "Vivek", "Lakshmi",
  "Deepak", "Megha", "Pranav", "Roshni", "Kunal",
  "Ankita", "Mohit", "Sonal", "Tushar", "Payal",
];

// Build a flat list of studentName entries with parent references
const studentEntries: { name: string; parentIdx: number }[] = [];
for (let pi = 0; pi < parentChildIndices.length; pi++) {
  const surname = familySurnames[pi];
  for (const si of parentChildIndices[pi]) {
    studentEntries.push({ name: `${firstNames[si % firstNames.length]} ${surname}`, parentIdx: pi });
  }
}

export const students: Student[] = (() => {
  // First pass: build students
  const raw = studentEntries.map((entry, i) => {
    const classIdx = Math.floor(i / 4) % 12;
    const secIdx = i % 2;
    return {
      id: `stu${i + 1}`,
      admission_number: `ADM${2025}${String(i + 1).padStart(4, "0")}`,
      class_id: `c${classIdx + 1}`,
      section_id: `c${classIdx + 1}-s${secIdx}`,
      roll_number: (i % 10) + 1,
      date_of_birth: `200${8 + (i % 5)}-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
      gender: (i % 3 === 0 ? "female" : "male") as "male" | "female" | "other",
      parent_id: `par${entry.parentIdx + 1}`,
      transport_route_id: i % 3 === 0 ? `r${(i % 4) + 1}` : undefined,
      name: entry.name,
      email: `${entry.name.toLowerCase().replace(/\s+/g, ".")}@school.edu`,
      phone: `98765${String(10000 + i).padStart(5, "0")}`,
      address: `${100 + i}, School Colony, Bangalore`,
      blood_group: ["A+", "B+", "O+", "AB+", "A-"][i % 5],
      attendance_pct: 75 + Math.floor(Math.random() * 25),
      fee_status: (i % 5 === 0 ? "overdue" : i % 3 === 0 ? "pending" : "paid") as "paid" | "pending" | "overdue",
    };
  });
  // Second pass: if any sibling has transport, share route with all siblings
  const parentRouteMap = new Map<string, string>();
  raw.forEach((s) => { if (s.transport_route_id) parentRouteMap.set(s.parent_id, s.transport_route_id); });
  raw.forEach((s) => { if (!s.transport_route_id && parentRouteMap.has(s.parent_id)) s.transport_route_id = parentRouteMap.get(s.parent_id); });
  return raw;
})();

// ─── Parents ────────────────────────────────────────────────────
export const parents: Parent[] = parentChildIndices.map((childIndices, i) => ({
  id: `par${i + 1}`,
  name: `Mr/Mrs ${familySurnames[i]}`,
  email: `parent${i + 1}@school.edu`,
  phone: `98765${String(43210 + i).padStart(5, "0")}`,
  occupation: ["Engineer", "Doctor", "Teacher", "Business", "Lawyer"][i % 5],
  address: `${100 + i}, MG Road, Bangalore`,
  children: childIndices.map((si) => `stu${si + 1}`),
}));

// ─── Teachers ────────────────────────────────────────────────────
const teacherNames = [
  "Mrs Mehta", "Mr Sharma", "Ms Kapoor", "Mr Iyer", "Mrs Deshmukh",
  "Mr Patel", "Ms Gupta", "Mr Nair", "Mrs Reddy", "Mr Banerjee",
  "Ms Sinha", "Mr Kulkarni",
];
export const teachers: Teacher[] = teacherNames.map((name, i) => ({
  id: `t${i + 1}`,
  name,
  email: `${name.toLowerCase().replace(/\s+/g, ".").replace("mrs", "").replace("mr", "").replace("ms", "").replace(/^\./, "")}@school.edu`,
  phone: `98765${String(50000 + i).padStart(5, "0")}`,
  department: subjects[i % subjects.length].department,
  designation: i === 0 ? "Senior Teacher" : "Teacher",
  teacher_type: i < 2 ? "hod" : i < 6 ? "class_teacher" : "subject_teacher",
  subjects: [subjects[i % subjects.length].id],
  assigned_classes: [`c${(i % 12) + 1}`, `c${((i + 3) % 12) + 1}`],
}));

// ─── Staff ────────────────────────────────────────────────────
export const staffMembers: Staff[] = [
  { id: "sf1", name: "Rajesh Kumar", email: "rajesh@school.edu", department: "Accounts", role_type: "accountant" },
  { id: "sf2", name: "Mohan Singh", email: "mohan@school.edu", department: "Transport", role_type: "transport_manager" },
  { id: "sf3", name: "Priya Das", email: "priya.das@school.edu", department: "Library", role_type: "library_staff" },
  { id: "sf4", name: "Seema Verma", email: "seema@school.edu", department: "Office", role_type: "office_staff" },
  { id: "sf5", name: "Anil Joshi", email: "anil@school.edu", department: "Office", role_type: "office_staff" },
];

export const defaultStaffTasks: StaffTask[] = [
  {
    id: "task-1",
    title: "Collect fees from 12 students",
    description: "Prioritize overdue accounts first.",
    category: "finance",
    location: "Accounts Office",
    created_date: "2026-03-16",
    assigned_to: "sf1",
    assigned_by: "admin",
    due_date: "2026-03-19",
    status: "pending",
    priority: "high",
  },
  {
    id: "task-2",
    title: "Issue library books",
    description: "Process class 7A request queue.",
    category: "library",
    location: "School Library",
    created_date: "2026-03-16",
    assigned_to: "sf3",
    assigned_by: "admin",
    due_date: "2026-03-19",
    status: "in_progress",
    priority: "medium",
  },
  {
    id: "task-3",
    title: "Update transport allocation",
    description: "Add newly admitted students to routes.",
    category: "transport",
    location: "Transport Desk",
    created_date: "2026-03-16",
    assigned_to: "sf2",
    assigned_by: "admin",
    due_date: "2026-03-20",
    status: "pending",
    priority: "high",
  },
  {
    id: "task-4",
    title: "Print ID cards",
    description: "Generate cards for office pickup.",
    category: "office",
    location: "Admin Office",
    created_date: "2026-03-16",
    assigned_to: "sf4",
    assigned_by: "admin",
    due_date: "2026-03-21",
    status: "pending",
    priority: "medium",
  },
  {
    id: "task-5",
    title: "Repair broken pipe near science block",
    description: "Maintenance team inspected but leak persists. Immediate support required to prevent class disruption.",
    category: "maintenance",
    location: "Science Block - Ground Floor",
    created_date: "2026-03-17",
    assigned_to: "sf4",
    assigned_by: "admin",
    due_date: "2026-03-19",
    status: "in_progress",
    priority: "high",
  },
];

export const defaultStudentRequests: StudentRequest[] = [
  {
    id: "sr-1",
    student_id: "stu3",
    request_type: "transfer_certificate",
    status: "pending",
    requested_date: "2026-03-16",
    assigned_to: "sf4",
    note: "Family relocation to Pune.",
  },
  {
    id: "sr-2",
    student_id: "stu8",
    request_type: "duplicate_id_card",
    status: "in_progress",
    requested_date: "2026-03-15",
    assigned_to: "sf5",
  },
  {
    id: "sr-3",
    student_id: "stu2",
    request_type: "fee_receipt",
    status: "completed",
    requested_date: "2026-03-14",
    assigned_to: "sf1",
  },
  {
    id: "sr-4",
    student_id: "stu11",
    request_type: "bonafide_certificate",
    status: "pending",
    requested_date: "2026-03-17",
    assigned_to: "sf4",
  },
];

// ─── Subject Allocations ────────────────────────────────────────
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

// ─── Attendance ────────────────────────────────────────────────
const today = new Date();
export const attendanceRecords: AttendanceRecord[] = students.flatMap((s) =>
  Array.from({ length: 7 }, (_, d) => {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    const rand = Math.random();
    return {
      id: `att-${s.id}-${d}`,
      student_id: s.id,
      date: date.toISOString().split("T")[0],
      status: rand > 0.15 ? "present" : rand > 0.05 ? "absent" : "late",
      marked_by: `t${(parseInt(s.class_id.replace("c", "")) % 12) + 1}`,
    };
  })
);

// ─── Homework ────────────────────────────────────────────────────
export const homework: Homework[] = [
  { id: "hw1", class_id: "c1", section_id: "c1-s0", subject_id: "sub1", teacher_id: "t1", title: "Fractions Practice", description: "Complete exercises 5.1 to 5.4", due_date: "2026-03-12", assigned_date: "2026-03-09" },
  { id: "hw2", class_id: "c1", section_id: "c1-s0", subject_id: "sub4", teacher_id: "t4", title: "Plant Classification", description: "Write a report on plant types", due_date: "2026-03-14", assigned_date: "2026-03-09" },
  { id: "hw3", class_id: "c2", section_id: "c2-s0", subject_id: "sub1", teacher_id: "t1", title: "Algebra Equations", description: "Solve problems from chapter 3", due_date: "2026-03-13", assigned_date: "2026-03-10" },
  { id: "hw4", class_id: "c2", section_id: "c2-s1", subject_id: "sub5", teacher_id: "t5", title: "Essay Writing", description: "Write 500 words on My School", due_date: "2026-03-15", assigned_date: "2026-03-10" },
  { id: "hw5", class_id: "c3", section_id: "c3-s0", subject_id: "sub2", teacher_id: "t2", title: "Newton's Laws Problems", description: "Complete worksheet on forces", due_date: "2026-03-13", assigned_date: "2026-03-10" },
  { id: "hw6", class_id: "c3", section_id: "c3-s0", subject_id: "sub7", teacher_id: "t7", title: "Mughal Empire Essay", description: "Describe Mughal administration", due_date: "2026-03-14", assigned_date: "2026-03-09" },
  { id: "hw7", class_id: "c4", section_id: "c4-s0", subject_id: "sub3", teacher_id: "t3", title: "Chemical Reactions", description: "Balance 20 equations", due_date: "2026-03-12", assigned_date: "2026-03-08" },
  { id: "hw8", class_id: "c4", section_id: "c4-s1", subject_id: "sub9", teacher_id: "t9", title: "Python Basics", description: "Write 5 programs on loops", due_date: "2026-03-16", assigned_date: "2026-03-10" },
];

// ─── Exams ────────────────────────────────────────────────────
export const exams: Exam[] = [
  { id: "ex1", name: "Unit Test 1", exam_type: "unit_test", start_date: "2026-03-20", end_date: "2026-03-22" },
  { id: "ex2", name: "Mid Term", exam_type: "mid_term", start_date: "2026-04-15", end_date: "2026-04-25" },
  { id: "ex3", name: "Final Exam", exam_type: "final_exam", start_date: "2026-06-01", end_date: "2026-06-15" },
];

// ─── Marks ────────────────────────────────────────────────────
export const marks: Mark[] = students.slice(0, 20).flatMap((s) =>
  subjects.slice(0, 5).map((sub) => {
    const m = 45 + Math.floor(Math.random() * 55);
    return {
      id: `mk-${s.id}-${sub.id}`,
      student_id: s.id,
      exam_id: "ex1",
      subject_id: sub.id,
      marks_obtained: m,
      max_marks: 100,
      grade: m >= 90 ? "A+" : m >= 80 ? "A" : m >= 70 ? "B+" : m >= 60 ? "B" : m >= 50 ? "C" : "D",
    };
  })
);

// ─── Fees ────────────────────────────────────────────────────
export const fees: Fee[] = [
  ...students.map((s) => ({
    id: `fee-${s.id}`,
    student_id: s.id,
    fee_type: "tuition" as const,
    amount: 5000,
    due_date: "2026-03-31",
    status: s.fee_status,
    paid_date: s.fee_status === "paid" ? "2026-03-05" : undefined,
  })),
  ...students.filter((_, i) => i % 3 === 0).map((s) => ({
    id: `fee-tr-${s.id}`,
    student_id: s.id,
    fee_type: "transport" as const,
    amount: 2000,
    due_date: "2026-03-31",
    status: "paid" as const,
    paid_date: "2026-03-01",
  })),
];

// ─── Transport Routes ────────────────────────────────────────
export const routes: Route[] = [
  { id: "r1", name: "North Zone", vehicle_number: "KA01AB1234", driver_name: "Rajesh", driver_phone: "9876500001", capacity: 40, stops: ["MG Road", "Brigade Road", "Koramangala", "HSR Layout"] },
  { id: "r2", name: "City Center", vehicle_number: "KA01AB2345", driver_name: "Mohan", driver_phone: "9876500002", capacity: 35, stops: ["Majestic", "Vidhana Soudha", "Cubbon Park", "MG Road"] },
  { id: "r3", name: "East Area", vehicle_number: "KA01AB3456", driver_name: "Suresh", driver_phone: "9876500003", capacity: 40, stops: ["Whitefield", "Marathahalli", "Indiranagar", "Old Airport Road"] },
  { id: "r4", name: "South Zone", vehicle_number: "KA01AB4567", driver_name: "Ganesh", driver_phone: "9876500004", capacity: 38, stops: ["JP Nagar", "Jayanagar", "BTM Layout", "Bannerghatta Road"] },
];

export const transportDrivers: TransportDriver[] = [
  { id: "drv-1", name: "Rajesh", phone: "9876500001", route_id: "r1", vehicle_number: "KA01AB1234", license_no: "DL-001-2024" },
  { id: "drv-2", name: "Mohan", phone: "9876500002", route_id: "r2", vehicle_number: "KA01AB2345", license_no: "DL-002-2024" },
  { id: "drv-3", name: "Suresh", phone: "9876500003", route_id: "r3", vehicle_number: "KA01AB3456", license_no: "DL-003-2024" },
  { id: "drv-4", name: "Ganesh", phone: "9876500004", route_id: "r4", vehicle_number: "KA01AB4567", license_no: "DL-004-2024" },
];

// ─── Student Transport Allocations ────────────────────────────
export const studentTransport: StudentTransport[] = students
  .filter((s) => s.transport_route_id)
  .map((s, i) => {
    const route = routes.find((r) => r.id === s.transport_route_id)!;
    return {
      id: `st-${i}`,
      student_id: s.id,
      route_id: s.transport_route_id!,
      stop_name: route.stops[i % route.stops.length],
      pickup_time: `07:${String(30 + (i * 5) % 30).padStart(2, "0")} AM`,
    };
  });

// ─── Announcements ────────────────────────────────────────────
export const announcements: Announcement[] = [
  { id: "an1", title: "Parent Teacher Meeting", content: "PTM scheduled for 20th March. All parents are requested to attend.", created_by: "admin", date: "2026-03-08", target: "all", priority: "high" },
  { id: "an2", title: "Annual Day Celebration", content: "Annual Day on 30th March. Students to prepare cultural programs.", created_by: "admin", date: "2026-03-07", target: "all", priority: "medium" },
  { id: "an3", title: "Science Fair", content: "Science fair next week. Project submissions by 15th March.", created_by: "admin", date: "2026-03-06", target: "student", priority: "medium" },
  { id: "an4", title: "Holiday Notice", content: "School closed on Friday for Holi festival.", created_by: "admin", date: "2026-03-05", target: "all", priority: "low" },
  { id: "an5", title: "Sports Day", content: "Sports Day on 5th April. Practice sessions start next week.", created_by: "admin", date: "2026-03-04", target: "all", priority: "medium" },
  { id: "an6", title: "Fee Reminder", content: "Last date for fee payment is 31st March. Please clear dues.", created_by: "admin", date: "2026-03-03", target: "parent", priority: "high" },
  { id: "an7", title: "Staff Meeting", content: "All teaching staff to attend meeting on 12th March at 4 PM.", created_by: "admin", date: "2026-03-02", target: "teacher", priority: "medium" },
];

// ─── Messages ────────────────────────────────────────────────────
export const messages: Message[] = [
  { id: "m1", sender_id: "admin", receiver_id: "par1", content: "Please attend PTM on 20th March without fail.", timestamp: "2026-03-10T09:00:00", sender_name: "Principal", receiver_name: "Mr/Mrs Kumar" },
  { id: "m2", sender_id: "par1", receiver_id: "admin", content: "Sure, we will be there. Thank you.", timestamp: "2026-03-10T10:30:00", sender_name: "Mr/Mrs Kumar", receiver_name: "Principal" },
  { id: "m3", sender_id: "admin", receiver_id: "t1", content: "Please submit the mid-term question papers by Friday.", timestamp: "2026-03-09T11:00:00", sender_name: "Principal", receiver_name: "Mrs Mehta" },
  { id: "m4", sender_id: "t1", receiver_id: "admin", content: "Will submit by Thursday evening.", timestamp: "2026-03-09T11:30:00", sender_name: "Mrs Mehta", receiver_name: "Principal" },
  { id: "m5", sender_id: "admin", receiver_id: "par3", content: "Rahul's attendance is below 80%. Please ensure regular attendance.", timestamp: "2026-03-08T08:00:00", sender_name: "Principal", receiver_name: "Mr/Mrs Das" },
  { id: "m6", sender_id: "admin", receiver_id: "t4", content: "Please share the lab schedule for next week.", timestamp: "2026-03-07T14:00:00", sender_name: "Principal", receiver_name: "Mr Iyer" },
  { id: "m7", sender_id: "t4", receiver_id: "admin", content: "Lab schedule has been shared on the notice board.", timestamp: "2026-03-07T15:00:00", sender_name: "Mr Iyer", receiver_name: "Principal" },
  { id: "m8", sender_id: "admin", receiver_id: "par5", content: "Arjun has shown great improvement in Science. Keep it up!", timestamp: "2026-03-06T10:00:00", sender_name: "Principal", receiver_name: "Mr/Mrs Mehta" },
  // Student messages
  { id: "m9", sender_id: "t1", receiver_id: "stu1", content: "Amit, please submit your math assignment by tomorrow.", timestamp: "2026-03-11T09:00:00", sender_name: "Mrs Mehta", receiver_name: "Amit Kumar" },
  { id: "m10", sender_id: "stu1", receiver_id: "t1", content: "Yes ma'am, I will submit it today.", timestamp: "2026-03-11T09:30:00", sender_name: "Amit Kumar", receiver_name: "Mrs Mehta" },
  { id: "m11", sender_id: "t4", receiver_id: "stu1", content: "Great work on the science project! Keep it up.", timestamp: "2026-03-10T14:00:00", sender_name: "Mr Iyer", receiver_name: "Amit Kumar" },
  { id: "m12", sender_id: "stu1", receiver_id: "t4", content: "Thank you sir! I enjoyed working on it.", timestamp: "2026-03-10T14:30:00", sender_name: "Amit Kumar", receiver_name: "Mr Iyer" },
  { id: "m13", sender_id: "admin", receiver_id: "stu1", content: "You have been selected for the science quiz competition.", timestamp: "2026-03-09T11:00:00", sender_name: "School Office", receiver_name: "Amit Kumar" },
  { id: "m14", sender_id: "stu1", receiver_id: "admin", content: "Thank you! I will prepare well for it.", timestamp: "2026-03-09T11:30:00", sender_name: "Amit Kumar", receiver_name: "School Office" },
];

// ─── Timetable ────────────────────────────────────────────────────
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
// Mon–Fri: 4 morning + lunch + 4 afternoon = 9 slots; Saturday: 4 morning + lunch = 5 slots
const LUNCH_PERIOD = 5;

function buildTimetable(): Record<string, TimetableEntry[]> {
  const entries: Record<string, TimetableEntry[]> = {};
  for (const d of daysOfWeek) entries[d] = [];

  const teacherSubjectPairs = teachers.map((t) => ({
    teacher: t.name,
    subject: subjects.find((s) => s.id === t.subjects[0])?.name ?? "General",
  }));

  const totalPeriods = (di: number) => (di < 5 ? 9 : 5); // 9 for weekdays, 5 for Saturday

  const sportsTeacher = teachers.find((t) => t.subjects.includes("sub10"))?.name ?? "Sports Coach";

  const periodTime = (p: number) => {
    if (p <= 4) return `${7 + p}:00 - ${7 + p}:45`;         // P1=8:00, P2=9:00, P3=10:00, P4=11:00
    if (p === LUNCH_PERIOD) return "12:00 - 12:30";           // Lunch
    return `${7 + p - 1}:00 - ${7 + p - 1}:45`;             // P6=13:00, P7=14:00, P8=15:00, P9=16:00
  };

  for (const cls of classes) {
    for (const sec of cls.sections) {
      const clsNum = parseInt(cls.id.replace("c", ""));
      daysOfWeek.forEach((dayName, di) => {
        const numPeriods = totalPeriods(di);
        const offset = di + clsNum + sec.name.charCodeAt(0);
        const ptSlots = [
          { day: 1, period: 3 },
          { day: 4, period: 7 },
        ];
        const isPhysicalTrainingSlot = (day: number, period: number) =>
          ptSlots.some((slot) => slot.day === day && slot.period === period && period <= numPeriods);
        for (let p = 1; p <= numPeriods; p++) {
          // Lunch break
          if (p === LUNCH_PERIOD) {
            entries[dayName].push({
              period: p,
              subject: "Lunch Break",
              teacher: "",
              class_name: cls.name.replace("Class ", ""),
              section: sec.name,
              time: periodTime(p),
            });
            continue;
          }
          // Two PT periods every week for each class-section.
          if (isPhysicalTrainingSlot(di, p)) {
            entries[dayName].push({
              period: p,
              subject: "Physical Training",
              teacher: sportsTeacher,
              class_name: cls.name.replace("Class ", ""),
              section: sec.name,
              time: periodTime(p),
            });
            continue;
          }
          const actualP = p > LUNCH_PERIOD ? p - 1 : p; // adjust index for pairing
          const pairIdx = (offset + actualP) % teacherSubjectPairs.length;
          const pair = teacherSubjectPairs[pairIdx];
          entries[dayName].push({
            period: p,
            subject: pair.subject,
            teacher: pair.teacher,
            class_name: cls.name.replace("Class ", ""),
            section: sec.name,
            time: periodTime(p),
          });
        }
      });
    }
  }
  return entries;
}

export const timetable: Record<string, TimetableEntry[]> = buildTimetable();

// ─── Library Books ────────────────────────────────────────────────
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

// ─── Notifications ────────────────────────────────────────────────
export const mockNotifications: Notification[] = [
  { id: "n1", title: "New Homework", message: "Math homework assigned for Class 7A", type: "homework", read: false, timestamp: "2026-03-10T09:00:00" },
  { id: "n2", title: "Fee Reminder", message: "Term fees due by 31st March", type: "fee", read: false, timestamp: "2026-03-09T10:00:00" },
  { id: "n3", title: "PTM Scheduled", message: "Parent Teacher Meeting on 20th March", type: "announcement", read: true, timestamp: "2026-03-08T08:00:00" },
  { id: "n4", title: "Exam Schedule", message: "Unit Test 1 starts on 20th March", type: "exam", read: false, timestamp: "2026-03-07T12:00:00" },
  { id: "n5", title: "Attendance Alert", message: "Your attendance is below 80%", type: "attendance", read: true, timestamp: "2026-03-06T14:00:00" },
];

// ─── Helper functions ─────────────────────────────────────────────
export function getStudentsByClass(classId: string) {
  return students.filter((s) => s.class_id === classId);
}

export function getStudentsBySection(sectionId: string) {
  return students.filter((s) => s.section_id === sectionId);
}

export function getTeacherClasses(teacherId: string) {
  return subjectAllocations.filter((a) => a.teacher_id === teacherId);
}

export function getClassTeacherSections(teacherId: string) {
  return classes.flatMap((c) =>
    c.sections
      .filter((s) => s.class_teacher_id === teacherId)
      .map((s) => ({ ...s, className: c.name }))
  );
}

export function getStudentAttendance(studentId: string) {
  return attendanceRecords.filter((a) => a.student_id === studentId);
}

export function getClassHomework(classId: string) {
  return homework.filter((h) => h.class_id === classId);
}

export function getStudentMarks(studentId: string) {
  return marks.filter((m) => m.student_id === studentId);
}

export function getStudentFees(studentId: string) {
  return fees.filter((f) => f.student_id === studentId);
}

export function getChildrenOfParent(parentId: string) {
  const parent = parents.find((p) => p.id === parentId);
  if (!parent) return [];
  return students.filter((s) => parent.children.includes(s.id));
}

export function getSubjectName(subjectId: string) {
  return subjects.find((s) => s.id === subjectId)?.name ?? subjectId;
}

export function getClassName(classId: string) {
  return classes.find((c) => c.id === classId)?.name ?? classId;
}

export function getTeacherName(teacherId: string) {
  return teachers.find((t) => t.id === teacherId)?.name ?? teacherId;
}
