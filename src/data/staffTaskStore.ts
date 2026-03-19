import { defaultStaffTasks } from "@/data/mock";
import type { StaffTask } from "@/types";

const STORAGE_KEY = "erp_staff_tasks";

function isStaffTaskArray(value: unknown): value is StaffTask[] {
  return Array.isArray(value) && value.every((r) => r && typeof r === "object" && "id" in r && "title" in r && "status" in r);
}

export function getStaffTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStaffTasks;
    const parsed: unknown = JSON.parse(raw);
    return isStaffTaskArray(parsed) ? parsed : defaultStaffTasks;
  } catch {
    return defaultStaffTasks;
  }
}

export function saveStaffTasks(rows: StaffTask[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  window.dispatchEvent(new Event("erp-staff-tasks-updated"));
}

export function resetStaffTasks() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("erp-staff-tasks-updated"));
}

export function updateStaffTask(id: string, updater: (task: StaffTask) => StaffTask) {
  const next = getStaffTasks().map((task) => (task.id === id ? updater(task) : task));
  saveStaffTasks(next);
}
