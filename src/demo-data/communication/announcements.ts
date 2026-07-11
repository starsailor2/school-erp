import type { Announcement } from "@/types";

export const announcements: Announcement[] = [
  { id: "an1", title: "Parent Teacher Meeting", content: "PTM scheduled for 20th March. All parents are requested to attend.", created_by: "admin", date: "2026-03-08", target: "all", priority: "high" },
  { id: "an2", title: "Annual Day Celebration", content: "Annual Day on 30th March. Students to prepare cultural programs.", created_by: "admin", date: "2026-03-07", target: "all", priority: "medium" },
  { id: "an3", title: "Science Fair", content: "Science fair next week. Project submissions by 15th March.", created_by: "admin", date: "2026-03-06", target: "student", priority: "medium" },
  { id: "an4", title: "Holiday Notice", content: "School closed on Friday for Holi festival.", created_by: "admin", date: "2026-03-05", target: "all", priority: "low" },
  { id: "an5", title: "Sports Day", content: "Sports Day on 5th April. Practice sessions start next week.", created_by: "admin", date: "2026-03-04", target: "all", priority: "medium" },
  { id: "an6", title: "Fee Reminder", content: "Last date for fee payment is 31st March. Please clear dues.", created_by: "admin", date: "2026-03-03", target: "parent", priority: "high" },
  { id: "an7", title: "Staff Meeting", content: "All teaching staff to attend meeting on 12th March at 4 PM.", created_by: "admin", date: "2026-03-02", target: "teacher", priority: "medium" },
];
