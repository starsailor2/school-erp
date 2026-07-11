import type { HostelAllocation } from "@/types";
import { students } from "@/demo-data/people/students";
import { hostelBlocks } from "@/demo-data/hostel/blocks";
import { hostelRooms } from "@/demo-data/hostel/rooms";
import { shuffle } from "@/demo-data/generators/random";

const TARGET_RESIDENTS = 120;

const boysBlockIds = new Set(hostelBlocks.filter((b) => b.gender === "boys").map((b) => b.id));
const girlsBlockIds = new Set(hostelBlocks.filter((b) => b.gender === "girls").map((b) => b.id));

const eligible = shuffle(students).filter((s) => s.gender !== "other").slice(0, TARGET_RESIDENTS);

const roomOccupancy = new Map<string, number>();

export const hostelAllocations: HostelAllocation[] = eligible.map((s, i) => {
  const candidateRooms = hostelRooms.filter((r) =>
    s.gender === "male" ? boysBlockIds.has(r.block_id) : girlsBlockIds.has(r.block_id)
  );
  // Find the first candidate room with free capacity.
  const room = candidateRooms.find((r) => (roomOccupancy.get(r.id) ?? 0) < r.capacity) ?? candidateRooms[0];
  roomOccupancy.set(room.id, (roomOccupancy.get(room.id) ?? 0) + 1);

  const checkIn = new Date();
  checkIn.setMonth(checkIn.getMonth() - ((i % 10) + 1));

  return {
    id: `ha-${i + 1}`,
    student_id: s.id,
    room_id: room.id,
    check_in_date: checkIn.toISOString().split("T")[0],
    status: "active",
  };
});

export function getHostelAllocationForStudent(studentId: string) {
  return hostelAllocations.find((a) => a.student_id === studentId && a.status === "active");
}

export function getRoommates(studentId: string) {
  const allocation = getHostelAllocationForStudent(studentId);
  if (!allocation) return [];
  const roommateIds = hostelAllocations
    .filter((a) => a.room_id === allocation.room_id && a.student_id !== studentId && a.status === "active")
    .map((a) => a.student_id);
  return students.filter((s) => roommateIds.includes(s.id));
}
