import { useState } from "react";
import { Paper, Tabs, Tab, Table, TableHead, TableBody, TableRow, TableCell, Chip, MenuItem, TextField, Typography } from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { timetable, parents, getChildrenOfParent, getClassName } from "@/data/mock";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function ParentTimetable() {
  const { user, selectedChildId, setSelectedChildId } = useAuth();
  const parent = parents.find((p) => p.id === user?.id);
  const children = parent ? getChildrenOfParent(parent.id) : [];
  const child = children.find((c) => c.id === selectedChildId) ?? children[0];
  const [day, setDay] = useState(0);

  // Filter timetable by child's class and section
  const classNum = child?.class_id.replace("c", "") ?? "";
  const sectionId = child?.section_id ?? "";
  const sectionName = sectionId.split("-")[1]?.replace("s", "") ?? "";
  const sectionLetter = String.fromCharCode(65 + parseInt(sectionName || "0"));

  const entries = (timetable[days[day]] ?? []).filter(
    (e) => e.class_name === classNum && e.section === sectionLetter
  );

  return (
    <>
      <PageHeader
        title={`Timetable — ${child?.name ?? ""}`}
        breadcrumbs={[{ label: "Dashboard", to: "/parent" }, { label: "Timetable" }]}
      />

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

      {child && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {getClassName(child.class_id)} — Section {sectionLetter}
        </Typography>
      )}

      <Paper sx={{ mb: 2 }}>
        <Tabs value={day} onChange={(_, v) => setDay(v)} variant="scrollable" scrollButtons="auto">
          {days.map((d) => <Tab key={d} label={d} />)}
        </Tabs>
      </Paper>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Period</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Teacher</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map((e) => (
              <TableRow key={e.period} sx={e.subject === "Lunch Break" ? { bgcolor: "action.hover" } : {}}>
                <TableCell>{e.period}</TableCell>
                <TableCell>{e.time}</TableCell>
                <TableCell>
                  <Chip label={e.subject} size="small"
                    variant={e.subject === "Lunch Break" || e.subject === "Free Period" ? "filled" : "outlined"}
                    color={e.subject === "Lunch Break" ? "warning" : e.subject === "Free Period" ? "default" : "primary"}
                  />
                </TableCell>
                <TableCell>{e.teacher || "—"}</TableCell>
              </TableRow>
            ))}
            {entries.length === 0 && (
              <TableRow><TableCell colSpan={4} align="center"><Typography color="text.secondary" sx={{ py: 2 }}>No classes on this day</Typography></TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
}
