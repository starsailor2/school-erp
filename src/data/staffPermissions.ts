import type { StaffFeature, StaffPermissionMap, StaffRole } from "@/types";

export const staffPermissions: StaffPermissionMap = {
  accountant: {
    fees: "manage",
    transport: "none",
    library: "none",
    student_lookup: "manage",
    student_requests: "view",
    communication: "manage",
    reports: "manage",
  },
  transport_manager: {
    fees: "none",
    transport: "manage",
    library: "none",
    student_lookup: "manage",
    student_requests: "view",
    communication: "manage",
    reports: "manage",
  },
  library_staff: {
    fees: "none",
    transport: "none",
    library: "manage",
    student_lookup: "manage",
    student_requests: "view",
    communication: "manage",
    reports: "manage",
  },
  office_staff: {
    fees: "view",
    transport: "none",
    library: "none",
    student_lookup: "manage",
    student_requests: "manage",
    communication: "manage",
    reports: "view",
  },
};

export function getStaffPermission(staffRole: StaffRole, feature: StaffFeature) {
  return staffPermissions[staffRole][feature];
}

export function canViewFeature(staffRole: StaffRole, feature: StaffFeature) {
  return getStaffPermission(staffRole, feature) !== "none";
}

export function canManageFeature(staffRole: StaffRole, feature: StaffFeature) {
  return getStaffPermission(staffRole, feature) === "manage";
}
