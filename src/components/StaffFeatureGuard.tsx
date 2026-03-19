import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import type { StaffFeature } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { canManageFeature, canViewFeature } from "@/data/staffPermissions";

interface StaffFeatureGuardProps {
  feature: StaffFeature;
  minimum?: "view" | "manage";
  children: ReactNode;
}

export default function StaffFeatureGuard({ feature, minimum = "view", children }: StaffFeatureGuardProps) {
  const { role, staffRole } = useAuth();

  if (role !== "staff") {
    return <Navigate to="/staff" replace />;
  }

  const allowed = minimum === "manage" ? canManageFeature(staffRole, feature) : canViewFeature(staffRole, feature);

  if (!allowed) {
    return <Navigate to="/staff" replace />;
  }

  return <>{children}</>;
}
