import { useState } from "react";
import {
  Paper, Typography, Box, Avatar, Stack, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Snackbar, Alert, MenuItem, Grid,
  Chip,
} from "@mui/material";
import MessageIcon from "@mui/icons-material/Message";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import {
  teachers, students, parents, getTeacherClasses, getClassName,
} from "@/data/mock";
import { addMessage } from "@/data/messageStore";
import { createStudentRequest } from "@/data/studentRequestStore";
import type { Parent } from "@/types";

export default function ParentCommunication() {
  const { user } = useAuth();
  const teacher = teachers.find((t) => t.id === user?.id);
  const allocations = teacher ? getTeacherClasses(teacher.id) : [];
  const classIds = [...new Set(allocations.map((a) => a.class_id))];
  const [classFilter, setClassFilter] = useState(classIds[0] ?? "");
  const [messageOpen, setMessageOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [messageText, setMessageText] = useState("");
  const [snack, setSnack] = useState(false);

  const classStudents = students.filter((s) => s.class_id === classFilter);
  const parentIds = [...new Set(classStudents.map((s) => s.parent_id))];
  const classParents = parents.filter((p) => parentIds.includes(p.id));

  const openMessage = (p: Parent) => {
    setSelectedParent(p);
    setMessageText("");
    setMessageOpen(true);
  };

  const handleSend = () => {
    if (!messageText.trim()) return;
    if (!teacher || !selectedParent) return;
    addMessage({
      id: `m-${Date.now()}`,
      sender_id: teacher.id,
      sender_name: teacher.name,
      receiver_id: selectedParent.id,
      receiver_name: selectedParent.name,
      content: messageText.trim(),
      timestamp: new Date().toISOString(),
    });
    setMessageOpen(false);
    setSnack(true);
    setMessageText("");
  };

  const handleRequestStaffFollowUp = () => {
    if (!teacher || !selectedParent) return;
    const child = classStudents.find((s) => s.parent_id === selectedParent.id);
    if (!child) return;

    createStudentRequest({
      student_id: child.id,
      request_type: "office_support",
      requested_by: teacher.id,
      assigned_to: "sf1",
      note: `Teacher follow-up for parent ${selectedParent.name}: ${messageText.trim() || "Please contact parent for support."}`,
    });
    setMessageOpen(false);
    setSnack(true);
    setMessageText("");
  };

  const getChildrenNames = (p: Parent) => {
    return classStudents.filter((s) => s.parent_id === p.id).map((s) => s.name).join(", ");
  };

  return (
    <>
      <PageHeader
        title="Parent Communication"
        breadcrumbs={[{ label: "Dashboard", to: "/teacher" }, { label: "Class Management", to: "/teacher/class-mgmt" }, { label: "Parents" }]}
      />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth select size="small" label="Class" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
            {classIds.map((cid) => <MenuItem key={cid} value={cid}>{getClassName(cid)}</MenuItem>)}
          </TextField>
        </Grid>
      </Grid>
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Class Parents ({classParents.length})
        </Typography>
        <Stack spacing={1.5}>
          {classParents.map((p) => (
            <Box key={p.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                <Avatar sx={{ width: 36, height: 36, fontSize: 14 }}>{p.name.charAt(0)}</Avatar>
                <Box>
                  <Typography variant="body2" fontWeight={500}>{p.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{p.phone} · {p.occupation}</Typography>
                  <Box sx={{ display: "flex", gap: 0.5, mt: 0.5 }}>
                    <Chip label={getChildrenNames(p)} size="small" variant="outlined" sx={{ fontSize: 11 }} />
                  </Box>
                </Box>
              </Box>
              <Button size="small" variant="outlined" startIcon={<MessageIcon />} onClick={() => openMessage(p)}>Message</Button>
            </Box>
          ))}
        </Stack>
      </Paper>

      {/* Message Dialog */}
      <Dialog open={messageOpen} onClose={() => setMessageOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Message to {selectedParent?.name}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth multiline rows={4} label="Message"
            value={messageText} onChange={(e) => setMessageText(e.target.value)}
            sx={{ mt: 1 }}
            placeholder="Type your message here..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMessageOpen(false)}>Cancel</Button>
          <Button variant="outlined" onClick={handleRequestStaffFollowUp} disabled={!selectedParent}>Request Staff Follow-up</Button>
          <Button variant="contained" onClick={handleSend}>Send</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack} autoHideDuration={3000} onClose={() => setSnack(false)}>
        <Alert severity="success" onClose={() => setSnack(false)}>Message sent successfully!</Alert>
      </Snackbar>
    </>
  );
}
