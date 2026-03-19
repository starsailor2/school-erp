import type { Notification } from "@/types";
import { mockNotifications } from "@/data/mock";

const STORAGE_KEY = "erp_notifications";

function isNotificationArray(value: unknown): value is Notification[] {
  return Array.isArray(value) && value.every((n) => n && typeof n === "object" && "id" in n && "read" in n);
}

export function getNotifications(): Notification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return mockNotifications;
    const parsed: unknown = JSON.parse(raw);
    return isNotificationArray(parsed) ? parsed : mockNotifications;
  } catch {
    return mockNotifications;
  }
}

export function saveNotifications(rows: Notification[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  window.dispatchEvent(new Event("erp-notifications-updated"));
}

export function resetNotifications() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("erp-notifications-updated"));
}

export function getUnreadNotificationCount() {
  return getNotifications().filter((n) => !n.read).length;
}
