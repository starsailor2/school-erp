import { useMemo } from "react";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import StatusChip from "@/components/StatusChip";
import { students } from "@/demo-data";
import { getLibraryRecords, getLibraryBooksState } from "@/demo-data/library/libraryCirculationStore";

export default function LibraryRecords() {
  const rows = useMemo(() => {
    const books = getLibraryBooksState();
    return getLibraryRecords().map((r) => {
      const student = students.find((s) => s.id === r.student_id);
      const book = books.find((b) => b.id === r.book_id);
      return {
        ...r,
        studentName: student?.name ?? "-",
        bookTitle: book?.title ?? "-",
      };
    });
  }, []);

  return (
    <>
      <PageHeader
        title="Library Records"
        breadcrumbs={[{ label: "Dashboard", to: "/staff" }, { label: "Library", to: "/staff/library/books" }, { label: "Records" }]}
      />
      <DataTable
        rows={rows}
        columns={[
          { key: "bookTitle", label: "Book" },
          { key: "studentName", label: "Student" },
          { key: "issue_date", label: "Issue Date" },
          { key: "return_date", label: "Expected Return" },
          { key: "actual_return_date", label: "Actual Return", render: (r) => r.actual_return_date ?? "-" },
          {
            key: "status",
            label: "Status",
            render: (r) => <StatusChip status={r.status} />,
          },
        ]}
      />
    </>
  );
}
