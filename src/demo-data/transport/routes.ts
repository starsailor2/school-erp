import type { Route } from "@/types";

export const routes: Route[] = [
  { id: "r1", name: "North Zone", vehicle_number: "KA01AB1234", driver_name: "Rajesh", driver_phone: "9876500001", capacity: 45, stops: ["MG Road", "Brigade Road", "Koramangala", "HSR Layout"] },
  { id: "r2", name: "City Center", vehicle_number: "KA01AB2345", driver_name: "Mohan", driver_phone: "9876500002", capacity: 40, stops: ["Majestic", "Vidhana Soudha", "Cubbon Park", "MG Road"] },
  { id: "r3", name: "East Area", vehicle_number: "KA01AB3456", driver_name: "Suresh", driver_phone: "9876500003", capacity: 45, stops: ["Whitefield", "Marathahalli", "Indiranagar", "Old Airport Road"] },
  { id: "r4", name: "South Zone", vehicle_number: "KA01AB4567", driver_name: "Ganesh", driver_phone: "9876500004", capacity: 42, stops: ["JP Nagar", "Jayanagar", "BTM Layout", "Bannerghatta Road"] },
  { id: "r5", name: "West Zone", vehicle_number: "KA01AB5678", driver_name: "Dinesh", driver_phone: "9876500005", capacity: 40, stops: ["Rajajinagar", "Malleshwaram", "Yeshwanthpur", "Vijaynagar"] },
  { id: "r6", name: "Outer Ring Road", vehicle_number: "KA01AB6789", driver_name: "Naresh", driver_phone: "9876500006", capacity: 45, stops: ["Sarjapur", "Electronic City", "Bommanahalli", "Silk Board"] },
];

export function getRouteName(routeId: string) {
  return routes.find((r) => r.id === routeId)?.name ?? routeId;
}
