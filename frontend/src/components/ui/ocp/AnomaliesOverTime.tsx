import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, Calendar, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface AnomaliesOverTimeProps {
  className?: string;
  data: {
    date: string;
    anomalies: number;
    resolved: number;
    critical: number;
  }[];
}

const chartColors = {
  anomalies: "#3B82F6",
  resolved: "#10B981",
  critical: "#EF4444",
  text: "hsl(215.4, 16.3%, 46.9%)",
  grid: "hsl(215.4, 16.3%, 46.9%, 0.1)",
  border: "hsl(215.4, 16.3%, 46.9%, 0.2)",
  tooltip: {
    background: "hsl(0, 0%, 100%)",
    border: "hsl(215.4, 16.3%, 46.9%, 0.2)",
    text: "hsl(215.4, 16.3%, 46.9%)",
  },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: chartColors.tooltip.background,
          border: `1px solid ${chartColors.tooltip.border}`,
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          padding: "12px 16px",
        }}
      >
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-semibold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: any) => {
  const legendLabels = {
    anomalies: "Total Anomalies",
    resolved: "Resolved",
    critical: "Critical"
  };

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm font-medium text-gray-700">
            {legendLabels[entry.value as keyof typeof legendLabels] || entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export const AnomaliesOverTime = ({ className, data }: AnomaliesOverTimeProps) => {
  const [viewType, setViewType] = useState<"line" | "area">("line");
  const [timeframe, setTimeframe] = useState("daily");

  const hasData = data.length > 0 && data.some(item => 
    item.anomalies > 0 || item.resolved > 0 || item.critical > 0
  );

  if (!hasData) {
    return (
      <Card
        className={cn(
          "bg-white/50 backdrop-blur-sm border-none overflow-hidden",
          className
        )}
      >
        <CardContent className="pt-4 p-0 h-[350px] relative">
          <motion.div
            className="relative h-full flex flex-col items-center justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.2,
                duration: 0.5,
                type: "spring",
                stiffness: 100,
              }}
              className="mb-4"
            >
              <div className="relative">
                <motion.div
                  animate={{
                    rotate: [0, 5, 0, -5, 0],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative z-10"
                >
                  <TrendingUp className="w-12 h-12 text-blue-600/80" />
                </motion.div>
                <motion.div
                  className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </motion.div>

            <motion.div
              className="text-center space-y-3 px-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <motion.p
                className="text-gray-700 font-semibold text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                No historical data available
              </motion.p>
              <motion.p
                className="text-sm text-gray-500 max-w-xs mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Anomaly trends over time will appear here as your monitoring systems collect data over time.
              </motion.p>
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <Card
      className={cn(
        "bg-white/50 backdrop-blur-sm border border-gray-200/50",
        className
      )}
    >
      <CardContent className="pt-6 px-4 pb-4">
        <div className="flex items-center gap-2 mb-4">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[120px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Select value={viewType} onValueChange={(value: "line" | "area") => setViewType(value)}>
            <SelectTrigger className="w-[100px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line</SelectItem>
              <SelectItem value="area">Area</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          {viewType === "line" ? (
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 35 }}
              className={cn(
                "[&_.recharts-cartesian-grid-horizontal_line]:stroke-muted/20",
                "[&_.recharts-cartesian-grid-vertical_line]:stroke-muted/20",
                "font-medium"
              )}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={chartColors.grid}
              />
              <XAxis
                dataKey="date"
                fontSize={12}
                tickLine={true}
                axisLine={{ stroke: chartColors.border }}
                tick={{
                  fill: chartColors.text,
                  fontWeight: 600,
                }}
                tickFormatter={formatDate}
                tickMargin={10}
              />
              <YAxis
                fontSize={12}
                tickLine={true}
                axisLine={{ stroke: chartColors.border }}
                tick={{
                  fill: chartColors.text,
                  fontWeight: 600,
                }}
                tickMargin={10}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
              <Line
                type="monotone"
                dataKey="anomalies"
                stroke={chartColors.anomalies}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                animationDuration={1000}
              />
              <Line
                type="monotone"
                dataKey="resolved"
                stroke={chartColors.resolved}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                animationDuration={1000}
              />
              <Line
                type="monotone"
                dataKey="critical"
                stroke={chartColors.critical}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                animationDuration={1000}
              />
            </LineChart>
          ) : (
            <AreaChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 35 }}
              className={cn(
                "[&_.recharts-cartesian-grid-horizontal_line]:stroke-muted/20",
                "[&_.recharts-cartesian-grid-vertical_line]:stroke-muted/20",
                "font-medium"
              )}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={chartColors.grid}
              />
              <XAxis
                dataKey="date"
                fontSize={12}
                tickLine={true}
                axisLine={{ stroke: chartColors.border }}
                tick={{
                  fill: chartColors.text,
                  fontWeight: 600,
                }}
                tickFormatter={formatDate}
                tickMargin={10}
              />
              <YAxis
                fontSize={12}
                tickLine={true}
                axisLine={{ stroke: chartColors.border }}
                tick={{
                  fill: chartColors.text,
                  fontWeight: 600,
                }}
                tickMargin={10}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
              <Area
                type="monotone"
                dataKey="anomalies"
                stackId="1"
                stroke={chartColors.anomalies}
                fill={chartColors.anomalies}
                fillOpacity={0.6}
                animationDuration={1000}
              />
              <Area
                type="monotone"
                dataKey="resolved"
                stackId="1"
                stroke={chartColors.resolved}
                fill={chartColors.resolved}
                fillOpacity={0.6}
                animationDuration={1000}
              />
              <Area
                type="monotone"
                dataKey="critical"
                stackId="1"
                stroke={chartColors.critical}
                fill={chartColors.critical}
                fillOpacity={0.6}
                animationDuration={1000}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}; 