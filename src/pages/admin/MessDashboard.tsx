import { Grid } from "@mui/material";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import GroupIcon from "@mui/icons-material/Group";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { ChartCard } from "@/components/ChartCard";
import { getChartPalette, getChartTooltipStyle } from "@/theme/chartPalette";
import { useColorMode } from "@/context/ColorModeContext";
import { messPlans, messAttendance } from "@/demo-data";

export default function MessDashboard() {
  const { mode } = useColorMode();
  const palette = getChartPalette(mode);
  const tooltipStyle = getChartTooltipStyle(mode);

  const vegCount = messPlans.filter((p) => p.plan_type === "veg").length;
  const nonVegCount = messPlans.filter((p) => p.plan_type === "non_veg").length;

  const planPie = [
    { name: "Vegetarian", value: vegCount, color: palette.categorical[0] },
    { name: "Non-Vegetarian", value: nonVegCount, color: palette.categorical[1] },
  ];

  const consumptionTrend = (() => {
    const byDate = new Map<string, number>();
    for (const rec of messAttendance) {
      if (!rec.consumed) continue;
      byDate.set(rec.date, (byDate.get(rec.date) ?? 0) + 1);
    }
    return [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({
      day: new Date(date).toLocaleDateString("en", { day: "2-digit", month: "short" }),
      meals: count,
    }));
  })();

  return (
    <>
      <PageHeader title="Mess Dashboard" eyebrow="Operations" breadcrumbs={[{ label: "Operations" }, { label: "Mess" }]} />
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <StatCard title="Active Mess Plans" value={messPlans.length} numericValue={messPlans.length} icon={<RestaurantIcon />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <StatCard title="Vegetarian Plans" value={vegCount} numericValue={vegCount} icon={<GroupIcon />} delay={0.05} />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <ChartCard eyebrow="Consumption" title="Meals Served — Last 30 Days">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={consumptionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
                <XAxis dataKey="day" stroke={palette.axis} fontSize={10} interval={4} />
                <YAxis stroke={palette.axis} fontSize={12} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="meals" name="Meals" stroke={palette.categorical[0]} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ChartCard eyebrow="Plans" title="Plan Distribution">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={planPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {planPie.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>
    </>
  );
}
