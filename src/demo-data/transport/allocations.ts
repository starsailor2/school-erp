import type { StudentTransport } from "@/types";
import { students } from "@/demo-data/people/students";
import { routes } from "@/demo-data/transport/routes";

export const studentTransport: StudentTransport[] = students
  .filter((s) => s.transport_route_id)
  .map((s, i) => {
    const route = routes.find((r) => r.id === s.transport_route_id)!;
    return {
      id: `st-${i}`,
      student_id: s.id,
      route_id: s.transport_route_id!,
      stop_name: route.stops[i % route.stops.length],
      pickup_time: `07:${String(15 + ((i * 5) % 40)).padStart(2, "0")} AM`,
    };
  });
