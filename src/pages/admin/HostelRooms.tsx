import { useState } from "react";
import { Chip } from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { hostelBlocks, hostelRooms, hostelAllocations } from "@/demo-data";

export default function HostelRooms() {
  const [blockFilter] = useState<string | null>(null);

  const rows = hostelRooms
    .filter((r) => !blockFilter || r.block_id === blockFilter)
    .map((r) => {
      const block = hostelBlocks.find((b) => b.id === r.block_id);
      const occupants = hostelAllocations.filter((a) => a.room_id === r.id && a.status === "active").length;
      return { ...r, blockName: block?.name ?? r.block_id, occupants };
    });

  return (
    <>
      <PageHeader title="Blocks & Rooms" eyebrow="Hostel" breadcrumbs={[{ label: "Operations" }, { label: "Hostel", to: "/admin/hostel" }, { label: "Blocks & Rooms" }]} />
      <DataTable
        pagination
        pageSize={25}
        columns={[
          { key: "blockName", label: "Block" },
          { key: "room_number", label: "Room No." },
          { key: "type", label: "Type", render: (r) => <Chip size="small" label={r.type} variant="outlined" /> },
          { key: "capacity", label: "Capacity" },
          { key: "occupants", label: "Occupied", render: (r) => `${r.occupants} / ${r.capacity}` },
        ]}
        rows={rows}
        emptyTitle="No rooms found"
      />
    </>
  );
}
