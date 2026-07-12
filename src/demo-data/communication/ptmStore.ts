import { defaultPTMs } from "@/demo-data/communication/ptmRequests";
import type { ParentTeacherMeeting, PTMStatus } from "@/types";

const STORAGE_KEY = "erp_ptm_requests";

function isPTMArray(value: unknown): value is ParentTeacherMeeting[] {
  return Array.isArray(value) && value.every((r) => r && typeof r === "object" && "id" in r && "teacher_id" in r && "status" in r);
}

export function getPTMs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPTMs;
    const parsed: unknown = JSON.parse(raw);
    return isPTMArray(parsed) ? parsed : defaultPTMs;
  } catch {
    return defaultPTMs;
  }
}

export function savePTMs(rows: ParentTeacherMeeting[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  window.dispatchEvent(new Event("erp-ptm-updated"));
}

export function requestPTM(input: {
  teacherId: string;
  parentId: string;
  studentId: string;
  requestedBy: "parent" | "teacher";
  proposedDate: string;
  proposedTime: string;
  reason?: string;
}) {
  const meeting: ParentTeacherMeeting = {
    id: `ptm-${Date.now()}`,
    teacher_id: input.teacherId,
    parent_id: input.parentId,
    student_id: input.studentId,
    requested_by: input.requestedBy,
    proposed_date: input.proposedDate,
    proposed_time: input.proposedTime,
    status: "pending",
    reason: input.reason,
    created_date: new Date().toISOString().split("T")[0],
  };
  savePTMs([meeting, ...getPTMs()]);
  return meeting;
}

export function updatePTMStatus(id: string, status: PTMStatus, notes?: string) {
  const next = getPTMs().map((m) => (m.id === id ? { ...m, status, notes: notes ?? m.notes } : m));
  savePTMs(next);
}
