import { Paper, Typography } from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { PageHeader } from "@/components/PageHeader";
import { homework, classes } from "@/demo-data";

export default function HomeworkReports() {
  const data = classes.slice(0, 8).map((c) => ({
    name: c.name,
    count: homework.filter((h) => h.class_id === c.id).length,
  }));

  return (
    <>
      <PageHeader
        title="Homework Reports"
        breadcrumbs={[
          { label: "Dashboard", to: "/admin" },
          { label: "Homework", to: "/admin/homework" },
          { label: "Reports" },
        ]}
      />
      <Paper sx={{ p: 2, height: 400 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Homework Assigned per Class
        </Typography>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </>
  );
}
