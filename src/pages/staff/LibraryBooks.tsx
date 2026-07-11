import { useEffect, useState } from "react";
import { Chip, Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { getLibraryBooksState } from "@/demo-data/library/libraryCirculationStore";

export default function LibraryBooks() {
  const navigate = useNavigate();
  const [, setRefresh] = useState(0);
  const rows = getLibraryBooksState();

  useEffect(() => {
    const onUpdate = () => setRefresh((v) => v + 1);
    window.addEventListener("erp-library-updated", onUpdate);
    return () => window.removeEventListener("erp-library-updated", onUpdate);
  }, []);

  return (
    <>
      <PageHeader
        title="Library Books"
        breadcrumbs={[{ label: "Dashboard", to: "/staff" }, { label: "Library" }, { label: "Books" }]}
        action={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" size="small" onClick={() => navigate("/staff/library/categories")}>Categories</Button>
            <Button variant="contained" size="small" onClick={() => navigate("/staff/library/issue")}>Issue Book</Button>
          </Stack>
        }
      />
      <DataTable
        columns={[
          { key: "title", label: "Title" },
          { key: "author", label: "Author" },
          { key: "category", label: "Category", render: (b) => <Chip label={b.category} size="small" variant="outlined" /> },
          { key: "available_copies", label: "Status", render: (b) => <Chip label={b.available_copies > 0 ? "Available" : "Issued"} size="small" color={b.available_copies > 0 ? "success" : "warning"} /> },
          { key: "issued_to", label: "Issued To", render: (b) => b.issued_to ?? "—" },
          { key: "return_date", label: "Return Date", render: (b) => b.return_date ?? "—" },
        ]}
        rows={rows}
      />
    </>
  );
}
