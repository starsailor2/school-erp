// Types for the School ERP system

export type Role = "admin" | "teacher" | "parent" | "student" | "staff";
export type TeacherType = "subject_teacher" | "class_teacher" | "hod";
export type StaffRole = "accountant" | "transport_manager" | "library_staff" | "office_staff" | "hostel_warden" | "mess_manager";
export type AttendanceStatus = "present" | "absent" | "late";
export type FeeStatus = "paid" | "pending" | "overdue";
export type FeeType = "tuition" | "transport" | "library" | "activity";
export type ExamType = "unit_test" | "mid_term" | "final_exam";
export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "pending" | "in_progress" | "completed";
export type StudentRequestType = "admission" | "transfer_certificate" | "bonafide_certificate" | "character_certificate" | "duplicate_id_card" | "fee_receipt" | "office_support";
export type StudentRequestStatus = "pending" | "in_progress" | "completed" | "rejected";
export type PaymentMethod = "cash" | "card" | "online" | "bank_transfer";
export type LibraryRecordStatus = "issued" | "returned" | "overdue";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  avatar?: string;
}

export interface Student {
  id: string;
  admission_number: string;
  class_id: string;
  section_id: string;
  roll_number: number;
  date_of_birth: string;
  gender: "male" | "female" | "other";
  parent_id: string;
  transport_route_id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  blood_group: string;
  avatar?: string;
  attendance_pct: number;
  fee_status: FeeStatus;
}

export interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  occupation: string;
  address: string;
  children: string[]; // student ids
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  teacher_type: TeacherType;
  subjects: string[];
  assigned_classes: string[];
  avatar?: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  department: string;
  role_type: StaffRole;
  avatar?: string;
}

export interface StaffTask {
  id: string;
  title: string;
  description?: string;
  category?: "maintenance" | "finance" | "transport" | "library" | "office" | "general";
  location?: string;
  created_date?: string;
  updated_date?: string;
  assigned_to: string;
  assigned_by: string;
  due_date: string;
  status: TaskStatus;
  priority: TaskPriority;
  support_request?: TaskSupportRequest;
}

export interface TaskSupportRequest {
  requested: boolean;
  requested_on?: string;
  requested_by?: string;
  additional_personnel?: number;
  reason?: string;
  status?: "pending" | "approved" | "fulfilled";
}

export interface StudentRequest {
  id: string;
  student_id: string;
  request_type: StudentRequestType;
  status: StudentRequestStatus;
  requested_date: string;
  assigned_to: string;
  note?: string;
  updated_date?: string;
  closed_date?: string;
  history?: StudentRequestAuditEntry[];
}

export interface StudentRequestAuditEntry {
  date: string;
  by: string;
  action: string;
  from_status?: StudentRequestStatus;
  to_status?: StudentRequestStatus;
  note?: string;
}

export interface SchoolClass {
  id: string;
  name: string;
  academic_year: string;
  sections: Section[];
}

export interface Section {
  id: string;
  class_id: string;
  name: string;
  class_teacher_id?: string;
  student_count: number;
}

export interface Subject {
  id: string;
  name: string;
  department: string;
}

export interface SubjectAllocation {
  id: string;
  teacher_id: string;
  class_id: string;
  section_id: string;
  subject_id: string;
  periods_per_week: number;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  date: string;
  status: AttendanceStatus;
  marked_by: string;
}

export interface TeacherAttendanceRecord {
  id: string;
  teacher_id: string;
  date: string;
  status: AttendanceStatus;
}

export interface Homework {
  id: string;
  class_id: string;
  section_id: string;
  subject_id: string;
  teacher_id: string;
  title: string;
  description: string;
  due_date: string;
  assigned_date: string;
}

export interface Exam {
  id: string;
  name: string;
  exam_type: ExamType;
  start_date: string;
  end_date: string;
}

export interface Mark {
  id: string;
  student_id: string;
  exam_id: string;
  subject_id: string;
  marks_obtained: number;
  max_marks: number;
  grade: string;
}

export interface Fee {
  id: string;
  student_id: string;
  fee_type: FeeType;
  amount: number;
  due_date: string;
  status: FeeStatus;
  paid_date?: string;
}

export interface FeeStructureItem {
  id: string;
  class_id: string;
  fee_type: FeeType;
  amount: number;
  frequency: "monthly" | "quarterly" | "annual";
}

export interface FeePayment {
  id: string;
  fee_id: string;
  student_id: string;
  amount: number;
  method: PaymentMethod;
  payment_date: string;
  recorded_by: string;
  reference?: string;
}

export interface FeeReceipt {
  id: string;
  payment_id: string;
  receipt_no: string;
  student_id: string;
  amount: number;
  issued_on: string;
}

export interface Route {
  id: string;
  name: string;
  vehicle_number: string;
  driver_name: string;
  driver_phone: string;
  capacity: number;
  stops: string[];
}

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

export interface TransportDriver {
  id: string;
  name: string;
  phone: string;
  route_id: string;
  vehicle_number: string;
  license_no: string;
}

export interface StudentTransport {
  id: string;
  student_id: string;
  route_id: string;
  stop_name: string;
  pickup_time: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  created_by: string;
  date: string;
  target: Role | "all";
  priority: "high" | "medium" | "low";
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  timestamp: string;
  sender_name: string;
  receiver_name: string;
}

export interface TimetableEntry {
  period: number;
  subject: string;
  teacher: string;
  class_name: string;
  section: string;
  time: string;
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  total_copies: number;
  available_copies: number;
  issued_to?: string;
  issue_date?: string;
  return_date?: string;
}

export interface LibraryRecord {
  id: string;
  book_id: string;
  student_id: string;
  issue_date: string;
  return_date: string;
  actual_return_date?: string;
  status: LibraryRecordStatus;
  issued_by: string;
}

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

export type StaffFeature = "fees" | "transport" | "library" | "student_lookup" | "student_requests" | "communication" | "reports" | "hostel" | "mess";

export type StaffPermissionMap = Record<StaffRole, Record<StaffFeature, "none" | "view" | "manage">>;

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "homework" | "fee" | "announcement" | "exam" | "attendance";
  read: boolean;
  timestamp: string;
}
