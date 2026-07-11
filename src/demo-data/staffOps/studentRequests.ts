import type { StudentRequest } from "@/types";

export const defaultStudentRequests: StudentRequest[] = [
  { id: "sr-1", student_id: "stu3", request_type: "transfer_certificate", status: "pending", requested_date: "2026-03-16", assigned_to: "sf8", note: "Family relocation to Pune." },
  { id: "sr-2", student_id: "stu8", request_type: "duplicate_id_card", status: "in_progress", requested_date: "2026-03-15", assigned_to: "sf9" },
  { id: "sr-3", student_id: "stu2", request_type: "fee_receipt", status: "completed", requested_date: "2026-03-14", assigned_to: "sf1" },
  { id: "sr-4", student_id: "stu11", request_type: "bonafide_certificate", status: "pending", requested_date: "2026-03-17", assigned_to: "sf8" },
];
