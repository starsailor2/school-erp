import { createContext, useContext, useState, type ReactNode } from "react";
import type { Role, TeacherType, StaffRole } from "@/types";

interface UserInfo {
  id: string;
  name: string;
}

interface AuthState {
  role: Role;
  teacherType: TeacherType;
  staffRole: StaffRole;
  user: UserInfo;
  logout: () => void;
  setRole: (role: Role) => void;
  setTeacherType: (type: TeacherType) => void;
  setStaffRole: (role: StaffRole) => void;
  selectedChildId: string;
  setSelectedChildId: (id: string) => void;
}

const AuthContext = createContext<AuthState | null>(null);

const roleUserMap: Record<Role, UserInfo> = {
  admin: { id: "admin", name: "Admin User" },
  teacher: { id: "t1", name: "Mrs Mehta" },
  parent: { id: "par1", name: "Mr Kumar" },
  student: { id: "stu1", name: "Amit Kumar" },
  staff: { id: "sf1", name: "Rajesh Kumar" },
};

const validRoles: Role[] = ["admin", "teacher", "parent", "student", "staff"];

function detectRoleFromPath(): Role {
  const path = window.location.pathname.split("/")[1] ?? "";
  if (validRoles.includes(path as Role)) return path as Role;
  return (localStorage.getItem("erp_role") as Role) || "admin";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(detectRoleFromPath);
  const [teacherType, setTeacherTypeState] = useState<TeacherType>(
    () => (localStorage.getItem("erp_teacherType") as TeacherType) || "class_teacher"
  );
  const [staffRole, setStaffRoleState] = useState<StaffRole>(
    () => (localStorage.getItem("erp_staffRole") as StaffRole) || "accountant"
  );
  const [selectedChildId, setSelectedChildIdState] = useState(
    () => localStorage.getItem("erp_childId") || "stu1"
  );

  const setRole = (r: Role) => { localStorage.setItem("erp_role", r); setRoleState(r); };
  const setTeacherType = (t: TeacherType) => { localStorage.setItem("erp_teacherType", t); setTeacherTypeState(t); };
  const setStaffRole = (r: StaffRole) => { localStorage.setItem("erp_staffRole", r); setStaffRoleState(r); };
  const setSelectedChildId = (id: string) => { localStorage.setItem("erp_childId", id); setSelectedChildIdState(id); };
  const logout = () => {
    localStorage.removeItem("erp_role");
    localStorage.removeItem("erp_teacherType");
    localStorage.removeItem("erp_staffRole");
    localStorage.removeItem("erp_childId");
    setRoleState("admin");
    setTeacherTypeState("class_teacher");
    setStaffRoleState("accountant");
    setSelectedChildIdState("stu1");
  };

  const user = roleUserMap[role];

  return (
    <AuthContext.Provider
      value={{
        role,
        teacherType,
        staffRole,
        user,
        logout,
        setRole,
        setTeacherType,
        setStaffRole,
        selectedChildId,
        setSelectedChildId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
