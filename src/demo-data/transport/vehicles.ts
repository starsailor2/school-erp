import type { Vehicle } from "@/types";
import { routes } from "@/demo-data/transport/routes";

export const vehicles: Vehicle[] = routes.map((r, i) => ({
  id: `veh${i + 1}`,
  vehicle_number: r.vehicle_number,
  route_id: r.id,
  type: r.capacity > 42 ? "bus" : "minibus",
  capacity: r.capacity,
  make_model: ["Tata Starbus", "Ashok Leyland Falcon", "Force Traveller", "Eicher Skyline"][i % 4],
  year: 2020 + (i % 5),
  last_service_date: `2026-0${(i % 6) + 1}-15`,
  insurance_expiry: `2027-0${(i % 9) + 1}-01`,
  status: "active",
}));
