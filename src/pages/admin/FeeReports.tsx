import { Paper, Typography, Grid } from "@mui/material";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { PageHeader } from "@/components/PageHeader";
import { fees } from "@/demo-data";
import { getChartPalette } from "@/theme/chartPalette";
import { useColorMode } from "@/context/ColorModeContext";

export default function FeeReports() {
  const { mode } = useColorMode();
  const palette = getChartPalette(mode);
  const COLORS = [palette.status.good, palette.status.warning, palette.status.critical];
  const statusData = [
    { name: "Paid", value: fees.filter((f) => f.status === "paid").length },
    { name: "Pending", value: fees.filter((f) => f.status === "pending").length },
    { name: "Overdue", value: fees.filter((f) => f.status === "overdue").length },
  ];

  const typeData = [...new Set(fees.map((f) => f.fee_type))].map((type) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    collected: fees.filter((f) => f.fee_type === type && f.status === "paid").reduce((s, f) => s + f.amount, 0),
    pending: fees.filter((f) => f.fee_type === type && f.status !== "paid").reduce((s, f) => s + f.amount, 0),
  }));

  return (
    <>
      <PageHeader
        title="Payment Reports"
        breadcrumbs={[
          { label: "Dashboard", to: "/admin" },
          { label: "Fees", to: "/admin/fees" },
          { label: "Reports" },
        ]}
      />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 2, height: 380 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Fee Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 2, height: 380 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Collection by Fee Type
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="collected" fill={palette.status.good} radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" fill={palette.status.warning} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
