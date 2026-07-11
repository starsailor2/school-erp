import { useState } from "react";
import {
  TextField, MenuItem, Button, Grid, InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import StatusChip from "@/components/StatusChip";
import { students } from "@/demo-data";

interface DocumentRecord {
  id: string;
  studentId: string;
  studentName: string;
  docType: string;
  status: "available" | "requested" | "issued";
  requestDate: string;
  issueDate: string | null;
}

const docTypes = ["Transfer Certificate", "Character Certificate", "Bonafide Certificate", "Migration Certificate", "Marksheet Copy", "ID Card"];

const mockDocs: DocumentRecord[] = students.slice(0, 10).flatMap((s, i) => [
  {
    id: `doc${i * 2 + 1}`,
    studentId: s.id,
    studentName: s.name,
    docType: docTypes[i % docTypes.length],
    status: (["available", "requested", "issued"] as const)[i % 3],
    requestDate: `2025-0${(i % 6) + 1}-${10 + i}`,
    issueDate: i % 3 === 2 ? `2025-0${(i % 6) + 1}-${15 + i}` : null,
  },
]);

export default function StudentDocuments() {
  const [docs, setDocs] = useState(mockDocs);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = docs.filter((d) => {
    if (search && !d.studentName.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== "all" && d.docType !== typeFilter) return false;
    return true;
  });

  const handleIssue = (id: string) => {
    setDocs((prev) => prev.map((d) =>
      d.id === id ? { ...d, status: "issued" as const, issueDate: new Date().toISOString().split("T")[0] } : d
    ));
  };

  return (
    <>
      <PageHeader
        title="Student Documents"
        breadcrumbs={[{ label: "Dashboard", to: "/admin" }, { label: "Students", to: "/admin/students" }, { label: "Documents" }]}
      />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth size="small" placeholder="Search student..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField select fullWidth size="small" label="Document Type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <MenuItem value="all">All Types</MenuItem>
            {docTypes.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>
        </Grid>
      </Grid>

      <DataTable
        columns={[
          { key: "studentName", label: "Student" },
          { key: "docType", label: "Document Type" },
          { key: "requestDate", label: "Request Date" },
          {
            key: "status", label: "Status",
            render: (d) => <StatusChip status={d.status} />,
          },
          { key: "issueDate", label: "Issue Date", render: (d) => d.issueDate ?? "—" },
          {
            key: "id", label: "Action",
            render: (d) => d.status === "requested" ? (
              <Button size="small" onClick={() => handleIssue(d.id)}>Issue</Button>
            ) : d.status === "available" ? (
              <Button size="small" variant="outlined" onClick={() => handleIssue(d.id)}>Generate</Button>
            ) : "—",
          },
        ]}
        rows={filtered}
      />
    </>
  );
}
