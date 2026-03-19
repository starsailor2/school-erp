import { useState } from "react";
import {
  Paper, Table, TableHead, TableBody, TableRow, TableCell, Chip, Typography,
  Tabs, Tab, Box, Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Grid,
} from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { libraryBooks } from "@/data/mock";
import type { LibraryBook } from "@/types";

export default function StudentLibrary() {
  const { user } = useAuth();
  const [tab, setTab] = useState(0);
  const [viewing, setViewing] = useState<LibraryBook | null>(null);
  const requestKey = `erp_library_requests_${user?.id ?? "unknown"}`;
  const renewKey = `erp_library_renew_requests_${user?.id ?? "unknown"}`;
  const [requestedBookIds, setRequestedBookIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(requestKey);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
    } catch {
      return [];
    }
  });
  const [renewRequestedBookIds, setRenewRequestedBookIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(renewKey);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
    } catch {
      return [];
    }
  });

  const myBooks = libraryBooks.filter((b) => b.issued_to === user?.id);
  const allBooks = libraryBooks;

  const requestBook = (bookId: string) => {
    if (requestedBookIds.includes(bookId)) return;
    const next = [...requestedBookIds, bookId];
    setRequestedBookIds(next);
    localStorage.setItem(requestKey, JSON.stringify(next));
  };

  const requestRenewal = (bookId: string) => {
    if (renewRequestedBookIds.includes(bookId)) return;
    const next = [...renewRequestedBookIds, bookId];
    setRenewRequestedBookIds(next);
    localStorage.setItem(renewKey, JSON.stringify(next));
  };

  return (
    <>
      <PageHeader title="Library" breadcrumbs={[{ label: "Dashboard", to: "/student" }, { label: "Library" }]} />

      <Paper sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label={`My Books (${myBooks.length})`} />
          <Tab label="Catalog" />
        </Tabs>
      </Paper>

      {tab === 0 && (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Book</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Issue Date</TableCell>
                <TableCell>Return Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {myBooks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Box sx={{ py: 4 }}>
                      <MenuBookIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                      <Typography color="text.secondary">No borrowed books</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                myBooks.map((b) => {
                  const overdue = b.return_date && new Date(b.return_date) < new Date();
                  return (
                    <TableRow key={b.id} hover sx={{ cursor: "pointer" }} onClick={() => setViewing(b)}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500} color="primary.main">{b.title}</Typography>
                        <Typography variant="caption" color="text.secondary">ISBN: {b.isbn}</Typography>
                      </TableCell>
                      <TableCell>{b.author}</TableCell>
                      <TableCell>{b.issue_date ?? "—"}</TableCell>
                      <TableCell>{b.return_date ?? "—"}</TableCell>
                      <TableCell>
                        <Chip
                          label={overdue ? "Overdue" : "Issued"}
                          size="small"
                          color={overdue ? "error" : "info"}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Paper>
      )}

      {tab === 1 && (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="center">Total</TableCell>
                <TableCell>Availability</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allBooks.map((b) => (
                <TableRow key={b.id} hover sx={{ cursor: "pointer" }} onClick={() => setViewing(b)}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500} color="primary.main" sx={{ "&:hover": { textDecoration: "underline" } }}>
                      {b.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">ISBN: {b.isbn}</Typography>
                  </TableCell>
                  <TableCell>{b.author}</TableCell>
                  <TableCell><Chip label={b.category} size="small" variant="outlined" /></TableCell>
                  <TableCell align="center">{b.total_copies}</TableCell>
                  <TableCell>
                    <Chip
                      label={b.available_copies > 0 ? `${b.available_copies} available` : "Not Available"}
                      size="small"
                      color={b.available_copies > 0 ? "success" : "error"}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Book Detail Modal */}
      <Dialog open={!!viewing} onClose={() => setViewing(null)} maxWidth="xs" fullWidth>
        {viewing && (
          <>
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <MenuBookIcon color="primary" /> {viewing.title}
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <Typography variant="body2" color="text.secondary">Author</Typography>
                  <Typography variant="body1" fontWeight={500}>{viewing.author}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="body2" color="text.secondary">ISBN</Typography>
                  <Typography variant="body1">{viewing.isbn}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="body2" color="text.secondary">Category</Typography>
                  <Chip label={viewing.category} size="small" />
                </Grid>
                <Grid size={6}>
                  <Typography variant="body2" color="text.secondary">Total Copies</Typography>
                  <Typography variant="body1">{viewing.total_copies}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="body2" color="text.secondary">Available</Typography>
                  <Chip
                    label={viewing.available_copies > 0 ? `${viewing.available_copies} copies` : "Not Available"}
                    size="small"
                    color={viewing.available_copies > 0 ? "success" : "error"}
                  />
                </Grid>
                {viewing.issued_to === user?.id && (
                  <>
                    <Grid size={6}>
                      <Typography variant="body2" color="text.secondary">Issue Date</Typography>
                      <Typography variant="body1">{viewing.issue_date ?? "—"}</Typography>
                    </Grid>
                    <Grid size={6}>
                      <Typography variant="body2" color="text.secondary">Return Date</Typography>
                      <Typography variant="body1" color={viewing.return_date && new Date(viewing.return_date) < new Date() ? "error.main" : "text.primary"}>
                        {viewing.return_date ?? "—"}
                      </Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              {viewing.issued_to === user?.id ? (
                <Button
                  variant="contained"
                  onClick={() => requestRenewal(viewing.id)}
                  disabled={renewRequestedBookIds.includes(viewing.id)}
                >
                  {renewRequestedBookIds.includes(viewing.id) ? "Renewal Requested" : "Request Renewal"}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={() => requestBook(viewing.id)}
                  disabled={viewing.available_copies === 0 || requestedBookIds.includes(viewing.id)}
                >
                  {viewing.available_copies === 0 ? "Unavailable" : requestedBookIds.includes(viewing.id) ? "Requested" : "Request Book"}
                </Button>
              )}
              <Button onClick={() => setViewing(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}
