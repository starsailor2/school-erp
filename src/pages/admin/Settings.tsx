import {
  Paper, Typography, Grid, TextField, Button, Stack, Tabs, Tab, MenuItem,
  Table, TableHead, TableBody, TableRow, TableCell, Checkbox, Chip,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";

const tabPaths = ["/admin/settings", "/admin/settings/academic-year", "/admin/settings/permissions", "/admin/settings/system"];

export default function Settings() {
  const location = useLocation();
  const initialTab = tabPaths.indexOf(location.pathname);
  const [tab, setTab] = useState(initialTab >= 0 ? initialTab : 0);
  const [profile, setProfile] = useState({
    schoolName: "Delhi Public School",
    board: "CBSE",
    phone: "+91 80 12345678",
    email: "admin@dps.edu.in",
    address: "MG Road, Bangalore 560001",
  });
  const [academicYear, setAcademicYear] = useState({
    currentYear: "2025-26",
    startDate: "2025-04-01",
    endDate: "2026-03-31",
    termPattern: "quarterly",
  });
  const [portal, setPortal] = useState({
    allowParentMessaging: "yes",
    attendanceCutoff: 75,
    defaultTheme: "light",
  });
  const [permissions, setPermissions] = useState([
    { role: "Teacher", canViewAttendance: true, canEditMarks: true, canSendMessages: true, canViewFees: false, canManageStudents: false },
    { role: "Staff", canViewAttendance: true, canEditMarks: false, canSendMessages: true, canViewFees: true, canManageStudents: false },
    { role: "Parent", canViewAttendance: true, canEditMarks: false, canSendMessages: true, canViewFees: true, canManageStudents: false },
    { role: "Student", canViewAttendance: true, canEditMarks: false, canSendMessages: false, canViewFees: false, canManageStudents: false },
  ]);

  useEffect(() => {
    const idx = tabPaths.indexOf(location.pathname);
    if (idx >= 0) setTab(idx);
  }, [location.pathname]);

  const togglePermission = (roleIdx: number, key: string) => {
    setPermissions((prev) => prev.map((p, i) =>
      i === roleIdx ? { ...p, [key]: !(p as Record<string, boolean | string>)[key] } : p
    ));
  };

  return (
    <>
      <PageHeader
        title="Settings"
        breadcrumbs={[
          { label: "Dashboard", to: "/admin" },
          { label: "Settings" },
        ]}
      />
      <Paper sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(_, value) => setTab(value)}>
          <Tab label="School Profile" />
          <Tab label="Academic Year" />
          <Tab label="Permissions" />
          <Tab label="System Settings" />
        </Tabs>
      </Paper>
      <Stack spacing={3}>
        {tab === 0 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>School Profile</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="School Name" value={profile.schoolName} onChange={(e) => setProfile((prev) => ({ ...prev, schoolName: e.target.value }))} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Board" value={profile.board} onChange={(e) => setProfile((prev) => ({ ...prev, board: e.target.value }))} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Phone" value={profile.phone} onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Email" value={profile.email} onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth label="Address" value={profile.address} multiline rows={2} onChange={(e) => setProfile((prev) => ({ ...prev, address: e.target.value }))} />
              </Grid>
            </Grid>
            <Button variant="contained" sx={{ mt: 2 }}>Save Profile</Button>
          </Paper>
        )}

        {tab === 1 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>Academic Year Configuration</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField fullWidth label="Current Year" value={academicYear.currentYear} onChange={(e) => setAcademicYear((prev) => ({ ...prev, currentYear: e.target.value }))} />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField fullWidth type="date" label="Start Date" slotProps={{ inputLabel: { shrink: true } }} value={academicYear.startDate} onChange={(e) => setAcademicYear((prev) => ({ ...prev, startDate: e.target.value }))} />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField fullWidth type="date" label="End Date" slotProps={{ inputLabel: { shrink: true } }} value={academicYear.endDate} onChange={(e) => setAcademicYear((prev) => ({ ...prev, endDate: e.target.value }))} />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField fullWidth select label="Term Pattern" value={academicYear.termPattern} onChange={(e) => setAcademicYear((prev) => ({ ...prev, termPattern: e.target.value }))}>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                  <MenuItem value="trimester">Trimester</MenuItem>
                  <MenuItem value="semester">Semester</MenuItem>
                </TextField>
              </Grid>
            </Grid>
            <Typography variant="body2" component="div" color="text.secondary" sx={{ mt: 2 }}>
              Current Academic Year: <Chip label={academicYear.currentYear} size="small" color="primary" /> &nbsp;
              ({academicYear.startDate} to {academicYear.endDate})
            </Typography>
            <Button variant="contained" sx={{ mt: 2 }}>Update Academic Year</Button>
          </Paper>
        )}

        {tab === 2 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>Role Permissions</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Configure what each role can access in the system.
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Role</TableCell>
                  <TableCell align="center">View Attendance</TableCell>
                  <TableCell align="center">Edit Marks</TableCell>
                  <TableCell align="center">Send Messages</TableCell>
                  <TableCell align="center">View Fees</TableCell>
                  <TableCell align="center">Manage Students</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {permissions.map((p, idx) => (
                  <TableRow key={p.role}>
                    <TableCell><Chip label={p.role} size="small" variant="outlined" /></TableCell>
                    <TableCell align="center"><Checkbox checked={p.canViewAttendance} onChange={() => togglePermission(idx, "canViewAttendance")} /></TableCell>
                    <TableCell align="center"><Checkbox checked={p.canEditMarks} onChange={() => togglePermission(idx, "canEditMarks")} /></TableCell>
                    <TableCell align="center"><Checkbox checked={p.canSendMessages} onChange={() => togglePermission(idx, "canSendMessages")} /></TableCell>
                    <TableCell align="center"><Checkbox checked={p.canViewFees} onChange={() => togglePermission(idx, "canViewFees")} /></TableCell>
                    <TableCell align="center"><Checkbox checked={p.canManageStudents} onChange={() => togglePermission(idx, "canManageStudents")} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button variant="contained" sx={{ mt: 2 }}>Save Permissions</Button>
          </Paper>
        )}

        {tab === 3 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>System Settings</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField fullWidth select label="Allow Parent Messaging" value={portal.allowParentMessaging} onChange={(e) => setPortal((prev) => ({ ...prev, allowParentMessaging: e.target.value }))}>
                  <MenuItem value="yes">Yes</MenuItem>
                  <MenuItem value="no">No</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField fullWidth type="number" label="Attendance Cutoff (%)" value={portal.attendanceCutoff} onChange={(e) => setPortal((prev) => ({ ...prev, attendanceCutoff: Number(e.target.value) }))} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField fullWidth select label="Default Theme" value={portal.defaultTheme} onChange={(e) => setPortal((prev) => ({ ...prev, defaultTheme: e.target.value }))}>
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField fullWidth select label="Date Format" defaultValue="dd/mm/yyyy">
                  <MenuItem value="dd/mm/yyyy">DD/MM/YYYY</MenuItem>
                  <MenuItem value="mm/dd/yyyy">MM/DD/YYYY</MenuItem>
                  <MenuItem value="yyyy-mm-dd">YYYY-MM-DD</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField fullWidth select label="Language" defaultValue="english">
                  <MenuItem value="english">English</MenuItem>
                  <MenuItem value="hindi">Hindi</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField fullWidth select label="SMS Notifications" defaultValue="enabled">
                  <MenuItem value="enabled">Enabled</MenuItem>
                  <MenuItem value="disabled">Disabled</MenuItem>
                </TextField>
              </Grid>
            </Grid>
            <Button variant="contained" sx={{ mt: 2 }}>Save System Settings</Button>
          </Paper>
        )}
      </Stack>
    </>
  );
}
