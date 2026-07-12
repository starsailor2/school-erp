import { routes } from "@/demo-data/transport/routes";
import type { Route } from "@/types";

const STORAGE_KEY = "erp_transport_routes";

function isRouteArray(value: unknown): value is Route[] {
  return Array.isArray(value) && value.every((r) => r && typeof r === "object" && "id" in r && "name" in r && "stops" in r);
}

export function getTransportRoutes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return routes;
    const parsed: unknown = JSON.parse(raw);
    return isRouteArray(parsed) ? parsed : routes;
  } catch {
    return routes;
  }
}

export function saveTransportRoutes(rows: Route[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  window.dispatchEvent(new Event("erp-transport-routes-updated"));
}

export function updateTransportRoute(id: string, updater: (route: Route) => Route) {
  const next = getTransportRoutes().map((r) => (r.id === id ? updater(r) : r));
  saveTransportRoutes(next);
}

export function resetTransportRoutes() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("erp-transport-routes-updated"));
}
