import { defaultLeaveRequests } from "@/demo-data/staffOps/leaveRequests";
import type { LeaveRequest, LeaveApplicantRole, LeaveType, LeaveStatus } from "@/types";

const STORAGE_KEY = "erp_leave_requests";

function isLeaveRequestArray(value: unknown): value is LeaveRequest[] {
  return Array.isArray(value) && value.every((r) => r && typeof r === "object" && "id" in r && "applicant_id" in r && "status" in r);
}

export function getLeaveRequests() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultLeaveRequests;
    const parsed: unknown = JSON.parse(raw);
    return isLeaveRequestArray(parsed) ? parsed : defaultLeaveRequests;
  } catch {
    return defaultLeaveRequests;
  }
}

export function saveLeaveRequests(rows: LeaveRequest[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  window.dispatchEvent(new Event("erp-leave-requests-updated"));
}

export function getLeaveRequestsFor(applicantId: string) {
  return getLeaveRequests().filter((r) => r.applicant_id === applicantId);
}

export function applyForLeave(input: {
  applicantId: string;
  applicantRole: LeaveApplicantRole;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}) {
  const request: LeaveRequest = {
    id: `lv-${Date.now()}`,
    applicant_id: input.applicantId,
    applicant_role: input.applicantRole,
    leave_type: input.leaveType,
    start_date: input.startDate,
    end_date: input.endDate,
    reason: input.reason,
    status: "pending",
    applied_date: new Date().toISOString().split("T")[0],
  };
  saveLeaveRequests([request, ...getLeaveRequests()]);
  return request;
}

export function reviewLeaveRequest(id: string, status: LeaveStatus, reviewedBy: string, note?: string) {
  const next = getLeaveRequests().map((r) =>
    r.id === id ? { ...r, status, reviewed_by: reviewedBy, review_note: note } : r
  );
  saveLeaveRequests(next);
}
