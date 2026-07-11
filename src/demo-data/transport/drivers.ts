import type { TransportDriver } from "@/types";
import { routes } from "@/demo-data/transport/routes";

export const transportDrivers: TransportDriver[] = routes.map((r, i) => ({
  id: `drv-${i + 1}`,
  name: r.driver_name,
  phone: r.driver_phone,
  route_id: r.id,
  vehicle_number: r.vehicle_number,
  license_no: `DL-${String(i + 1).padStart(3, "0")}-2024`,
}));
