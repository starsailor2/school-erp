import { useEffect, useState } from "react";
import { Paper, Typography, Stack, Box, Chip, Button, Dialog, DialogTitle, DialogContent, Grid, TextField, MenuItem } from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import StatusChip from "@/components/StatusChip";
import { getStaffTasks, saveStaffTasks, updateStaffTask } from "@/demo-data/staffOps/staffTaskStore";
import { useAuth } from "@/context/AuthContext";
import type { StaffTask } from "@/types";

export default function Tasks() {
  const { user } = useAuth();
  const [, setRefresh] = useState(0);
  const tasks = getStaffTasks();
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [supportCount, setSupportCount] = useState(1);
  const [supportReason, setSupportReason] = useState("");

  const activeTask = tasks.find((t) => t.id === activeTaskId) ?? null;

  useEffect(() => {
    const onUpdate = () => setRefresh((v) => v + 1);
    window.addEventListener("erp-staff-tasks-updated", onUpdate);
    return () => window.removeEventListener("erp-staff-tasks-updated", onUpdate);
  }, []);

  const addTask = () => {
    const today = new Date().toISOString().split("T")[0];
    const next = [
      {
        id: `task-${Date.now()}`,
        title: "Follow up pending student requests",
        description: "Review open office requests and route to responsible staff.",
        category: "office" as const,
        location: "Admin Office",
        created_date: today,
        assigned_to: user.id,
        assigned_by: "admin",
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "pending" as const,
        priority: "medium" as const,
      },
      ...tasks,
    ];
    saveStaffTasks(next);
  };

  const updateStatus = (id: string) => {
    const today = new Date().toISOString().split("T")[0];
    updateStaffTask(id, (t) => {
      if (t.status === "pending") return { ...t, status: "in_progress" as const, updated_date: today };
      if (t.status === "in_progress") return { ...t, status: "completed" as const, updated_date: today };
      return t;
    });
  };

  const requestMorePersonnel = (task: StaffTask) => {
    const today = new Date().toISOString().split("T")[0];
    updateStaffTask(task.id, (t) => ({
      ...t,
      updated_date: today,
      support_request: {
        requested: true,
        requested_on: today,
        requested_by: user.id,
        additional_personnel: Math.max(1, supportCount),
        reason: supportReason.trim() || "Additional support required to complete task safely.",
        status: "pending",
      },
    }));
    setSupportCount(1);
    setSupportReason("");
  };

  return (
    <>
      <PageHeader
        title="Tasks"
        breadcrumbs={[{ label: "Dashboard", to: "/staff" }, { label: "Tasks" }]}
        action={<Button variant="contained" size="small" onClick={addTask}>New Task</Button>}
      />
      <Paper sx={{ p: 2 }}>
        <Stack spacing={2}>
          {tasks.map((t) => (
            <Box key={t.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
              <Box>
                <Typography variant="body2" fontWeight={500} sx={{ textDecoration: t.status === "completed" ? "line-through" : "none" }}>
                  {t.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">Due: {t.due_date}{t.location ? ` | ${t.location}` : ""}</Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 0.5 }}>
                <Chip label={t.priority} size="small" color={t.priority === "high" ? "error" : t.priority === "medium" ? "warning" : "default"} />
                <StatusChip status={t.status} />
                {t.support_request?.requested && <Chip label="Support Requested" size="small" color="warning" />}
                <Button size="small" variant="outlined" onClick={() => setActiveTaskId(t.id)}>
                  View
                </Button>
                <Button size="small" variant="outlined" onClick={() => updateStatus(t.id)} disabled={t.status === "completed"}>
                  Update
                </Button>
              </Box>
            </Box>
          ))}
        </Stack>
      </Paper>

      <Dialog open={!!activeTask} onClose={() => setActiveTaskId(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Task Detail</DialogTitle>
        <DialogContent>
          {activeTask && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight={700}>{activeTask.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {activeTask.description ?? "No description provided."}
                </Typography>
                <Grid container spacing={1.5} sx={{ mt: 1 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">Category</Typography>
                    <Typography variant="body2">{activeTask.category ?? "general"}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">Location</Typography>
                    <Typography variant="body2">{activeTask.location ?? "-"}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">Due Date</Typography>
                    <Typography variant="body2">{activeTask.due_date}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">Status</Typography>
                    <Typography variant="body2">{activeTask.status.replace("_", " ")}</Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>Request More Personnel</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                  Use this if the assigned person cannot finish alone, for example unresolved maintenance like a broken pipe.
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      size="small"
                      select
                      label="Additional Staff"
                      value={String(supportCount)}
                      onChange={(e) => setSupportCount(Number(e.target.value))}
                    >
                      <MenuItem value="1">1</MenuItem>
                      <MenuItem value="2">2</MenuItem>
                      <MenuItem value="3">3</MenuItem>
                      <MenuItem value="4">4</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 8 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Reason"
                      value={supportReason}
                      onChange={(e) => setSupportReason(e.target.value)}
                      placeholder="Mechanic could not fix pipe leak. Need electrician + additional maintenance support."
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Button variant="contained" size="small" onClick={() => requestMorePersonnel(activeTask)}>
                      Submit Personnel Request
                    </Button>
                  </Grid>
                </Grid>

                {activeTask.support_request?.requested && (
                  <Paper variant="outlined" sx={{ p: 1.25, mt: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Requested on {activeTask.support_request.requested_on} by {activeTask.support_request.requested_by}
                    </Typography>
                    <Typography variant="body2">
                      Personnel Needed: {activeTask.support_request.additional_personnel ?? 1}
                    </Typography>
                    <Typography variant="body2">Status: {activeTask.support_request.status ?? "pending"}</Typography>
                    <Typography variant="body2">Reason: {activeTask.support_request.reason ?? "-"}</Typography>
                  </Paper>
                )}
              </Paper>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
