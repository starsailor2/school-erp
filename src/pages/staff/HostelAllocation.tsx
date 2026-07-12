import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import StatusChip from "@/components/StatusChip";
import { hostelAllocations, hostelRooms, hostelBlocks, students } from "@/demo-data";

export default function StaffHostelAllocation() {
  const rows = hostelAllocations.map((a) => {
    const room = hostelRooms.find((r) => r.id === a.room_id);
    const block = hostelBlocks.find((b) => b.id === room?.block_id);
    const student = students.find((s) => s.id === a.student_id);
    return {
      ...a,
      studentName: student?.name ?? a.student_id,
      roomLabel: room ? `${room.room_number} (${block?.name ?? ""})` : a.room_id,
    };
  });

  return (
    <>
      <PageHeader title="Room Allocation" eyebrow="Hostel" />
      <DataTable
        pagination
        pageSize={25}
        columns={[
          { key: "studentName", label: "Student" },
          { key: "roomLabel", label: "Room" },
          { key: "check_in_date", label: "Check-in Date" },
          { key: "status", label: "Status", render: (r) => <StatusChip status={r.status} /> },
        ]}
        rows={rows}
        emptyTitle="No allocations found"
      />
    </>
  );
}
