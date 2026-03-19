import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { students } from "@/data/mock";
import { useNavigate } from "react-router-dom";
import { getTransportRoutes } from "@/data/transportRouteStore";

export default function StaffTransportRoutes() {
  const navigate = useNavigate();
  const routes = getTransportRoutes();
  const rows = routes.map((r) => ({
    ...r,
    assigned: students.filter((s) => s.transport_route_id === r.id).length,
  }));

  return (
    <>
      <PageHeader
        title="Transport Routes"
        breadcrumbs={[{ label: "Dashboard", to: "/staff" }, { label: "Transport" }, { label: "Routes" }]}
      />
      <DataTable
        columns={[
          { key: "name", label: "Route" },
          { key: "vehicle_number", label: "Bus Number" },
          { key: "driver_name", label: "Driver" },
          { key: "capacity", label: "Capacity" },
          { key: "assigned", label: "Assigned" },
          { key: "stops", label: "Stops", render: (r) => r.stops.join(" → ") },
        ]}
        rows={rows}
        onRowClick={(row) => navigate(`/staff/transport/routes/${(row as { id: string }).id}`)}
      />
    </>
  );
}
