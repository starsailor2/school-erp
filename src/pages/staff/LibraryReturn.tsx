import { useState } from "react";
import { Button } from "@mui/material";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { students, libraryBooks } from "@/demo-data";
import { getLibraryRecords, returnLibraryBook } from "@/demo-data/library/libraryCirculationStore";

export default function LibraryReturn() {
  const [, setRefresh] = useState(0);

  const rows = getLibraryRecords()
    .filter((r) => r.status === "issued")
    .map((r) => {
      const student = students.find((s) => s.id === r.student_id);
      const book = libraryBooks.find((b) => b.id === r.book_id);
      return {
        ...r,
        studentName: student?.name ?? "-",
        bookTitle: book?.title ?? "-",
      };
    });

  const handleReturn = (recordId: string) => {
    returnLibraryBook(recordId);
    setRefresh((v) => v + 1);
  };

  return (
    <>
      <PageHeader
        title="Return Book"
        breadcrumbs={[{ label: "Dashboard", to: "/staff" }, { label: "Library", to: "/staff/library/books" }, { label: "Return Book" }]}
      />
      <DataTable
        rows={rows}
        columns={[
          { key: "bookTitle", label: "Book" },
          { key: "studentName", label: "Student" },
          { key: "issue_date", label: "Issued On" },
          { key: "return_date", label: "Due Date" },
          {
            key: "actions",
            label: "Actions",
            render: (r) => (
              <Button size="small" variant="outlined" onClick={() => handleReturn(r.id)}>
                Mark Returned
              </Button>
            ),
          },
        ]}
      />
    </>
  );
}
