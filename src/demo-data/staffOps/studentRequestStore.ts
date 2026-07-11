import { defaultStudentRequests } from "@/demo-data/staffOps/studentRequests";
import type { StudentRequest, StudentRequestType } from "@/types";

const STORAGE_KEY = "erp_student_requests";

function isStudentRequestArray(value: unknown): value is StudentRequest[] {
  return Array.isArray(value) && value.every((r) => r && typeof r === "object" && "id" in r && "student_id" in r && "request_type" in r);
}

export function getStudentRequests() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStudentRequests;
    const parsed: unknown = JSON.parse(raw);
    return isStudentRequestArray(parsed) ? parsed : defaultStudentRequests;
  } catch {
    return defaultStudentRequests;
  }
}

export function saveStudentRequests(rows: StudentRequest[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  window.dispatchEvent(new Event("erp-student-requests-updated"));
}

export function resetStudentRequests() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("erp-student-requests-updated"));
}

export function updateStudentRequest(
  id: string,
  actorId: string,
  action: string,
  updater: (current: StudentRequest) => StudentRequest,
) {
  const today = new Date().toISOString().split("T")[0];
  const next = getStudentRequests().map((r) => {
    if (r.id !== id) return r;
    const updated = updater(r);
    const entry = {
      date: today,
      by: actorId,
      action,
      from_status: r.status,
      to_status: updated.status,
      note: updated.note,
    };
    return {
      ...updated,
      updated_date: today,
      history: [...(r.history ?? []), entry],
    };
  });
  saveStudentRequests(next);
}

export function createStudentRequest(input: {
  student_id: string;
  request_type: StudentRequestType;
  requested_by: string;
  assigned_to?: string;
  note?: string;
}) {
  const today = new Date().toISOString().split("T")[0];
  const row: StudentRequest = {
    id: `req-${Date.now()}`,
    student_id: input.student_id,
    request_type: input.request_type,
    status: "pending",
    requested_date: today,
    assigned_to: input.assigned_to ?? "sf1",
    note: input.note,
    updated_date: today,
    history: [
      {
        date: today,
        by: input.requested_by,
        action: "created",
        to_status: "pending",
        note: input.note,
      },
    ],
  };
  saveStudentRequests([row, ...getStudentRequests()]);
}
