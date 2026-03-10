import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Target, Activity, Percent } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import type { DisaggregationKPIs } from "@/data/mockData";

interface Props {
  kpis: DisaggregationKPIs;
}

export function ForecastKPIStrip({ kpis }: Props) {
  const cards = [
    {
      title: "Forecasted Revenue",
      value: `$${(kpis.forecastedRevenue / 1000000).toFixed(1)}M`,
      sparkline: kpis.revenueSparkline,
      icon: DollarSign,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Volume Growth %",
      value: `${kpis.volumeGrowth > 0 ? "+" : ""}${kpis.volumeGrowth}%`,
      sparkline: kpis.growthSparkline,
      icon: TrendingUp,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Forecast Accuracy",
      value: `${kpis.forecastAccuracy}%`,
      sparkline: kpis.accuracySparkline,
      icon: Target,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Demand Volatility",
      value: `${kpis.demandVolatility}%`,
      sparkline: kpis.volatilitySparkline,
      icon: Activity,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Projected Margin",
      value: `${kpis.marginImpact}%`,
      sparkline: kpis.marginSparkline,
      icon: Percent,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <div className="grid grid-cols-5 gap-3">
      {cards.map((card, i) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.06 }}
          className="kpi-card !p-4"
        >
          <div className="flex items-start justify-between mb-2">
            <div className={`p-1.5 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-3.5 w-3.5 ${card.color}`} />
            </div>
            <div className="w-12 h-5">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={card.sparkline.map((v, j) => ({ v, i: j }))}>
                  <Line type="monotone" dataKey="v" stroke="hsl(var(--accent))" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <p className="text-xl font-bold text-foreground tracking-tight">{card.value}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{card.title}</p>
        </motion.div>
      ))}
    </div>
  );
}
