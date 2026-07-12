import type { HostelRoom, HostelRoomType } from "@/types";
import { hostelBlocks } from "@/demo-data/hostel/blocks";

const ROOM_TYPE_CYCLE: HostelRoomType[] = ["double", "double", "single", "dorm", "double", "double", "single"];
const CAPACITY_BY_TYPE: Record<HostelRoomType, number> = { single: 1, double: 2, dorm: 6 };
const ROOMS_PER_BLOCK = 25;

export const hostelRooms: HostelRoom[] = hostelBlocks.flatMap((block) =>
  Array.from({ length: ROOMS_PER_BLOCK }, (_, i) => {
    const type = ROOM_TYPE_CYCLE[i % ROOM_TYPE_CYCLE.length];
    return {
      id: `${block.id}-rm${i + 1}`,
      block_id: block.id,
      room_number: `${Math.floor(i / 10) + 1}${String((i % 10) + 1).padStart(2, "0")}`,
      type,
      capacity: CAPACITY_BY_TYPE[type],
    };
  })
);
