import type { TimetableEntry } from "@/types";
import { classes } from "@/demo-data/academics/classes";
import { teachers } from "@/demo-data/people/teachers";
import { subjects } from "@/demo-data/academics/subjects";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const LUNCH_PERIOD = 5;

function buildTimetable(): Record<string, TimetableEntry[]> {
  const entries: Record<string, TimetableEntry[]> = {};
  for (const d of daysOfWeek) entries[d] = [];

  const teacherSubjectPairs = teachers.map((t) => ({
    teacher: t.name,
    subject: subjects.find((s) => s.id === t.subjects[0])?.name ?? "General",
  }));

  const totalPeriods = (di: number) => (di < 5 ? 9 : 5);
  const sportsTeacher = teachers.find((t) => t.subjects.includes("sub10"))?.name ?? "Sports Coach";

  const periodTime = (p: number) => {
    if (p <= 4) return `${7 + p}:00 - ${7 + p}:45`;
    if (p === LUNCH_PERIOD) return "12:00 - 12:30";
    return `${7 + p - 1}:00 - ${7 + p - 1}:45`;
  };

  for (const cls of classes) {
    for (const sec of cls.sections) {
      const clsNum = parseInt(cls.id.replace("c", ""), 10);
      daysOfWeek.forEach((dayName, di) => {
        const numPeriods = totalPeriods(di);
        const offset = di + clsNum + sec.name.charCodeAt(0);
        const ptSlots = [{ day: 1, period: 3 }, { day: 4, period: 7 }];
        const isPT = (day: number, period: number) => ptSlots.some((s) => s.day === day && s.period === period && period <= numPeriods);

        for (let p = 1; p <= numPeriods; p++) {
          if (p === LUNCH_PERIOD) {
            entries[dayName].push({ period: p, subject: "Lunch Break", teacher: "", class_name: cls.name.replace("Class ", ""), section: sec.name, time: periodTime(p) });
            continue;
          }
          if (isPT(di, p)) {
            entries[dayName].push({ period: p, subject: "Physical Training", teacher: sportsTeacher, class_name: cls.name.replace("Class ", ""), section: sec.name, time: periodTime(p) });
            continue;
          }
          const actualP = p > LUNCH_PERIOD ? p - 1 : p;
          const pairIdx = (offset + actualP) % teacherSubjectPairs.length;
          const pair = teacherSubjectPairs[pairIdx];
          entries[dayName].push({ period: p, subject: pair.subject, teacher: pair.teacher, class_name: cls.name.replace("Class ", ""), section: sec.name, time: periodTime(p) });
        }
      });
    }
  }
  return entries;
}

export const timetable: Record<string, TimetableEntry[]> = buildTimetable();
