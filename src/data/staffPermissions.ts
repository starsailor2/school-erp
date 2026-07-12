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
    hostel: "view",
    mess: "view",
  },
  transport_manager: {
    fees: "none",
    transport: "manage",
    library: "none",
    student_lookup: "manage",
    student_requests: "view",
    communication: "manage",
    reports: "manage",
    hostel: "none",
    mess: "none",
  },
  library_staff: {
    fees: "none",
    transport: "none",
    library: "manage",
    student_lookup: "manage",
    student_requests: "view",
    communication: "manage",
    reports: "manage",
    hostel: "none",
    mess: "none",
  },
  office_staff: {
    fees: "view",
    transport: "none",
    library: "none",
    student_lookup: "manage",
    student_requests: "manage",
    communication: "manage",
    reports: "view",
    hostel: "view",
    mess: "view",
  },
  hostel_warden: {
    fees: "none",
    transport: "none",
    library: "none",
    student_lookup: "manage",
    student_requests: "view",
    communication: "manage",
    reports: "view",
    hostel: "manage",
    mess: "none",
  },
  mess_manager: {
    fees: "none",
    transport: "none",
    library: "none",
    student_lookup: "view",
    student_requests: "none",
    communication: "manage",
    reports: "view",
    hostel: "none",
    mess: "manage",
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
