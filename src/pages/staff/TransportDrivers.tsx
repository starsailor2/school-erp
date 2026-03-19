import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { routes, transportDrivers } from "@/data/mock";

export default function TransportDrivers() {
  const rows = transportDrivers.map((d) => ({
    ...d,
    routeName: routes.find((r) => r.id === d.route_id)?.name ?? "-",
  }));

  return (
    <>
      <PageHeader
        title="Drivers"
        breadcrumbs={[{ label: "Dashboard", to: "/staff" }, { label: "Transport", to: "/staff/transport/routes" }, { label: "Drivers" }]}
      />
      <DataTable
        rows={rows}
        columns={[
          { key: "name", label: "Driver" },
          { key: "phone", label: "Phone" },
          { key: "vehicle_number", label: "Vehicle" },
          { key: "routeName", label: "Route" },
          { key: "license_no", label: "License" },
        ]}
      />
    </>
  );
}
