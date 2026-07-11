import type { Notification } from "@/types";

export const mockNotifications: Notification[] = [
  { id: "n1", title: "New Homework", message: "New homework assigned for your class", type: "homework", read: false, timestamp: "2026-03-10T09:00:00" },
  { id: "n2", title: "Fee Reminder", message: "Term fees due by 31st March", type: "fee", read: false, timestamp: "2026-03-09T10:00:00" },
  { id: "n3", title: "PTM Scheduled", message: "Parent Teacher Meeting on 20th March", type: "announcement", read: true, timestamp: "2026-03-08T08:00:00" },
  { id: "n4", title: "Exam Schedule", message: "Unit Test 1 starts on 20th March", type: "exam", read: false, timestamp: "2026-03-07T12:00:00" },
  { id: "n5", title: "Attendance Alert", message: "Your attendance is below 80%", type: "attendance", read: true, timestamp: "2026-03-06T14:00:00" },
];
