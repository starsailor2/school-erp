import { announcements as defaultAnnouncements } from "@/data/mock";
import type { Announcement } from "@/types";

const STORAGE_KEY = "erp_announcements";
const EVENT_NAME = "erp-announcements-updated";

function isAnnouncementArray(value: unknown): value is Announcement[] {
  return Array.isArray(value)
    && value.every((row) => row && typeof row === "object" && "id" in row && "title" in row && "target" in row);
}

export function getAnnouncements() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultAnnouncements;
    const parsed: unknown = JSON.parse(raw);
    return isAnnouncementArray(parsed) ? parsed : defaultAnnouncements;
  } catch {
    return defaultAnnouncements;
  }
}

export function saveAnnouncements(rows: Announcement[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function addAnnouncement(row: Announcement) {
  saveAnnouncements([row, ...getAnnouncements()]);
}

export const ANNOUNCEMENT_STORE_EVENT = EVENT_NAME;
