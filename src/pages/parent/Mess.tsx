import { Paper, Typography, Stack, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import { useAuth } from "@/context/AuthContext";
import { getMessPlanForStudent, messMenu } from "@/demo-data";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
const MEALS = ["breakfast", "lunch", "snacks", "dinner"] as const;

export default function ParentMess() {
  const { selectedChildId } = useAuth();
  const plan = getMessPlanForStudent(selectedChildId);

  if (!plan) {
    return (
      <>
        <PageHeader title="My Mess" eyebrow="Mess" />
        <Paper sx={{ p: 2 }}>
          <EmptyState icon={<RestaurantIcon fontSize="inherit" />} title="No active mess plan" description="This child is not currently subscribed to a mess plan." />
        </Paper>
      </>
    );
  }

  return (
    <>
      <PageHeader title="My Mess" eyebrow="Mess" />
      <Stack spacing={2}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>My Plan</Typography>
          <Typography variant="body2">Type: {plan.plan_type === "veg" ? "Vegetarian" : "Non-Vegetarian"}</Typography>
          <Typography variant="body2">Subscribed Since: {plan.subscribed_since}</Typography>
        </Paper>
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
                    return <TableCell key={meal}><Typography variant="body2">{entry?.items.join(", ") ?? "—"}</Typography></TableCell>;
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Stack>
    </>
  );
}
