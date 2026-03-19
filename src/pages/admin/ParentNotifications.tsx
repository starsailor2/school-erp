import { useState } from "react";
import {
  Typography, TextField, MenuItem, Button, Chip, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid,
} from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { classes } from "@/data/mock";

interface ParentNotice {
  id: string;
  title: string;
  message: string;
  targetClass: string;
  type: "attendance" | "fee_reminder" | "exam" | "general";
  sentDate: string;
  status: "sent" | "draft";
}

const typeLabels: Record<string, string> = {
  attendance: "Attendance Alert",
  fee_reminder: "Fee Reminder",
  exam: "Exam Notice",
  general: "General",
};

const mockNotices: ParentNotice[] = [
  { id: "pn1", title: "Low Attendance Warning", message: "Your child's attendance is below 75%. Please ensure regular attendance.", targetClass: "All Classes", type: "attendance", sentDate: "2025-07-10", status: "sent" },
  { id: "pn2", title: "Fee Payment Reminder", message: "The quarterly fee for Term 2 is due by 15th July. Please clear the dues at the earliest.", targetClass: "Class 7", type: "fee_reminder", sentDate: "2025-07-08", status: "sent" },
  { id: "pn3", title: "Mid-Term Exam Schedule", message: "Mid-term examinations will begin from 1st August. Detailed schedule has been shared.", targetClass: "All Classes", type: "exam", sentDate: "2025-07-05", status: "sent" },
  { id: "pn4", title: "Parent Teacher Meeting", message: "PTM scheduled for 20th July. Your presence is requested.", targetClass: "Class 10", type: "general", sentDate: "2025-07-03", status: "sent" },
];

export default function ParentNotifications() {
  const [notices, setNotices] = useState(mockNotices);
  const [open, setOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [form, setForm] = useState({ title: "", message: "", targetClass: "All Classes", type: "general" as string });

  const filtered = notices.filter((n) => typeFilter === "all" || n.type === typeFilter);

  const handleSend = () => {
    setNotices((prev) => [
      {
        id: `pn${prev.length + 1}`,
        title: form.title,
        message: form.message,
        targetClass: form.targetClass,
        type: form.type as ParentNotice["type"],
        sentDate: new Date().toISOString().split("T")[0],
        status: "sent",
      },
      ...prev,
    ]);
    setOpen(false);
    setForm({ title: "", message: "", targetClass: "All Classes", type: "general" });
  };

  return (
    <>
      <PageHeader
        title="Parent Notifications"
        breadcrumbs={[{ label: "Dashboard", to: "/admin" }, { label: "Communication" }, { label: "Parent Notifications" }]}
        action={<Button variant="contained" size="small" onClick={() => setOpen(true)}>Send Notification</Button>}
      />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField select fullWidth size="small" label="Type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <MenuItem value="all">All Types</MenuItem>
            {Object.entries(typeLabels).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
          </TextField>
        </Grid>
      </Grid>

      <DataTable
        columns={[
          { key: "title", label: "Title" },
          { key: "message", label: "Message", render: (n) => <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>{n.message}</Typography> },
          { key: "targetClass", label: "Target" },
          {
            key: "type", label: "Type",
            render: (n) => <Chip label={typeLabels[n.type]} size="small" color={n.type === "attendance" ? "warning" : n.type === "fee_reminder" ? "error" : n.type === "exam" ? "info" : "default"} />,
          },
          { key: "sentDate", label: "Sent Date" },
          {
            key: "status", label: "Status",
            render: (n) => <Chip label={n.status} size="small" color={n.status === "sent" ? "success" : "default"} />,
          },
        ]}
        rows={filtered}
      />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Parent Notification</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} fullWidth size="small" />
            <TextField label="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} fullWidth size="small" multiline rows={3} />
            <TextField select label="Target Class" value={form.targetClass} onChange={(e) => setForm({ ...form, targetClass: e.target.value })} fullWidth size="small">
              <MenuItem value="All Classes">All Classes</MenuItem>
              {classes.map((c) => <MenuItem key={c.id} value={c.name}>{c.name}</MenuItem>)}
            </TextField>
            <TextField select label="Notification Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} fullWidth size="small">
              {Object.entries(typeLabels).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSend} disabled={!form.title || !form.message}>Send</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
