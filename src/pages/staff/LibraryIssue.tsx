import { useState } from "react";
import { Button, Grid, MenuItem, TextField } from "@mui/material";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { students } from "@/demo-data";
import { getLibraryBooksState, issueLibraryBook } from "@/demo-data/library/libraryCirculationStore";
import { useAuth } from "@/context/AuthContext";

export default function LibraryIssue() {
  const { user } = useAuth();
  const [bookId, setBookId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [, setRefresh] = useState(0);

  const books = getLibraryBooksState().filter((b) => b.available_copies > 0);

  const handleIssue = () => {
    if (!bookId || !studentId || !returnDate) return;
    issueLibraryBook({
      bookId,
      studentId,
      returnDate,
      issuedBy: user.id,
    });
    setBookId("");
    setStudentId("");
    setReturnDate("");
    setRefresh((v) => v + 1);
  };

  return (
    <>
      <PageHeader
        title="Issue Book"
        breadcrumbs={[{ label: "Dashboard", to: "/staff" }, { label: "Library", to: "/staff/library/books" }, { label: "Issue Book" }]}
      />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select size="small" label="Book" value={bookId} onChange={(e) => setBookId(e.target.value)}>
            {books.map((b) => (
              <MenuItem key={b.id} value={b.id}>{b.title}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select size="small" label="Student" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
            {students.map((s) => (
              <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <TextField fullWidth size="small" label="Return Date" type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} InputLabelProps={{ shrink: true }} />
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Button variant="contained" fullWidth onClick={handleIssue}>Issue</Button>
        </Grid>
      </Grid>
      <DataTable
        rows={books}
        columns={[
          { key: "title", label: "Book" },
          { key: "author", label: "Author" },
          { key: "category", label: "Category" },
          { key: "available_copies", label: "Available" },
        ]}
      />
    </>
  );
}
