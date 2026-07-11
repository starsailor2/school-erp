import { Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { messMenu } from "@/demo-data";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
const MEALS = ["breakfast", "lunch", "snacks", "dinner"] as const;

export default function StaffMessMenu() {
  return (
    <>
      <PageHeader title="Weekly Menu" eyebrow="Mess" />
      <Paper sx={{ overflow: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Day</TableCell>
              {MEALS.map((m) => <TableCell key={m} sx={{ textTransform: "capitalize" }}>{m}</TableCell>)}
            </TableRow>
          </TableHead>
          <TableBody>
            {DAYS.map((day) => (
              <TableRow key={day}>
                <TableCell sx={{ fontWeight: 600 }}>{day}</TableCell>
                {MEALS.map((meal) => {
                  const entry = messMenu.find((m) => m.day_of_week === day && m.meal === meal);
                  return (
                    <TableCell key={meal}>
                      <Typography variant="body2">{entry?.items.join(", ") ?? "—"}</Typography>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
}
