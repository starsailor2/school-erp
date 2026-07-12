import { useState } from "react";
import {
  Paper, Table, TableHead, TableBody, TableRow, TableCell, Chip, Typography, Stack,
  MenuItem, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Box, Divider, IconButton, Tooltip,
} from "@mui/material";
import ReceiptIcon from "@mui/icons-material/Receipt";
import HistoryIcon from "@mui/icons-material/History";
import { PageHeader } from "@/components/PageHeader";
import StatusChip from "@/components/StatusChip";
import { useAuth } from "@/context/AuthContext";
import { parents, getChildrenOfParent, getStudentFees, getClassName } from "@/demo-data";
import type { Fee } from "@/types";

export default function ParentFees() {
  const { user, selectedChildId, setSelectedChildId } = useAuth();
  const parent = parents.find((p) => p.id === user?.id);
  const children = parent ? getChildrenOfParent(parent.id) : [];
  const child = children.find((c) => c.id === selectedChildId) ?? children[0];
  const fees = child ? getStudentFees(child.id) : [];
  const totalDue = fees.reduce((s, f) => s + f.amount, 0);
  const totalPaid = fees.filter((f) => f.status === "paid").reduce((s, f) => s + f.amount, 0);
  const totalPending = totalDue - totalPaid;
  const [historyOpen, setHistoryOpen] = useState(false);
  const [receiptFee, setReceiptFee] = useState<Fee | null>(null);

  const paidFees = fees.filter((f) => f.status === "paid");

  return (
    <>
      <PageHeader title="Fees" breadcrumbs={[{ label: "Dashboard", to: "/parent" }, { label: "Fees" }]} />

      {children.length > 1 && (
        <TextField
          select size="small" label="Select Child" value={selectedChildId ?? children[0]?.id ?? ""}
          onChange={(e) => setSelectedChildId(e.target.value)}
          sx={{ mb: 2, minWidth: 280 }}
        >
          {children.map((c) => (
            <MenuItem key={c.id} value={c.id}>{c.name} — {getClassName(c.class_id)}</MenuItem>
          ))}
        </TextField>
      )}

      {!child ? (
        <Typography color="text.secondary">Select a child from the dashboard.</Typography>
      ) : (
        <>
          <Stack direction="row" spacing={2} sx={{ mb: 3 }} flexWrap="wrap" useFlexGap>
            <Paper sx={{ p: 2, flex: 1, textAlign: "center", minWidth: 150 }}>
              <Typography variant="body2" color="text.secondary">Total Due</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>₹{totalDue.toLocaleString()}</Typography>
            </Paper>
            <Paper sx={{ p: 2, flex: 1, textAlign: "center", minWidth: 150 }}>
              <Typography variant="body2" color="text.secondary">Paid</Typography>
              <Typography variant="h5" color="success.main" sx={{ fontWeight: 700 }}>₹{totalPaid.toLocaleString()}</Typography>
            </Paper>
            <Paper sx={{ p: 2, flex: 1, textAlign: "center", minWidth: 150 }}>
              <Typography variant="body2" color="text.secondary">Pending</Typography>
              <Typography variant="h5" color="error.main" sx={{ fontWeight: 700 }}>₹{totalPending.toLocaleString()}</Typography>
            </Paper>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Button variant="outlined" size="small" startIcon={<HistoryIcon />} onClick={() => setHistoryOpen(true)}>
              Payment History
            </Button>
          </Stack>

          <Paper>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Fee Type</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Paid Date</TableCell>
                  <TableCell align="center">Receipt</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fees.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell sx={{ textTransform: "capitalize" }}>{f.fee_type}</TableCell>
                    <TableCell align="right">₹{f.amount.toLocaleString()}</TableCell>
                    <TableCell>{f.due_date}</TableCell>
                    <TableCell>
                      <StatusChip status={f.status} />
                    </TableCell>
                    <TableCell>{f.paid_date ?? "—"}</TableCell>
                    <TableCell align="center">
                      {f.status === "paid" ? (
                        <Tooltip title="View Receipt">
                          <IconButton size="small" onClick={() => setReceiptFee(f)}>
                            <ReceiptIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
                {fees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="text.secondary" sx={{ py: 2 }}>No fee records found.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </>
      )}

      {/* Payment History Modal */}
      <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Payment History — {child?.name}</DialogTitle>
        <DialogContent dividers>
          {paidFees.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 2 }}>No payments recorded yet.</Typography>
          ) : (
            <Stack spacing={2}>
              {paidFees.map((f) => (
                <Paper key={f.id} variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ textTransform: "capitalize" }}>{f.fee_type}</Typography>
                      <Typography variant="caption" color="text.secondary">Paid on: {f.paid_date}</Typography>
                    </Box>
                    <Typography variant="subtitle1" fontWeight={700} color="success.main">₹{f.amount.toLocaleString()}</Typography>
                  </Box>
                </Paper>
              ))}
              <Divider />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="subtitle2">Total Paid</Typography>
                <Typography variant="subtitle1" fontWeight={700}>₹{totalPaid.toLocaleString()}</Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Receipt Modal */}
      <Dialog open={!!receiptFee} onClose={() => setReceiptFee(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Fee Receipt</DialogTitle>
        <DialogContent>
          {receiptFee && child && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box sx={{ textAlign: "center", pb: 2, borderBottom: 1, borderColor: "divider" }}>
                <Typography variant="h6">School ERP</Typography>
                <Typography variant="caption" color="text.secondary">Fee Payment Receipt</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Receipt No.</Typography>
                <Typography variant="body2" fontWeight={500}>{receiptFee.id.toUpperCase()}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Student</Typography>
                <Typography variant="body2" fontWeight={500}>{child.name}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Class</Typography>
                <Typography variant="body2" fontWeight={500}>{getClassName(child.class_id)}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Fee Type</Typography>
                <Typography variant="body2" fontWeight={500} sx={{ textTransform: "capitalize" }}>{receiptFee.fee_type}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Amount</Typography>
                <Typography variant="body2" fontWeight={700}>₹{receiptFee.amount.toLocaleString()}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Paid Date</Typography>
                <Typography variant="body2" fontWeight={500}>{receiptFee.paid_date}</Typography>
              </Box>
              <Divider />
              <Chip label="PAID" color="success" sx={{ alignSelf: "center" }} />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReceiptFee(null)}>Close</Button>
          <Button variant="contained" onClick={() => window.print()}>Print Receipt</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
