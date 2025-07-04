import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { AlertTriangle, AlertCircle, Shield } from "lucide-react";
import { motion } from "framer-motion";

interface CriticalityDistributionProps {
  className?: string;
  data: {
    name: string;
    low: number;
    medium: number;
    high: number;
    critical: number;
  }[];
}

const chartColors = {
  low: "#10B981",
  medium: "#F59E0B",
  high: "#EF4444",
  critical: "#991B1B",
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
    const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
    
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
        <p className="text-sm text-gray-600 mb-2">
          Total: <span className="font-semibold">{total}</span>
        </p>
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
    low: "Low",
    medium: "Medium", 
    high: "High",
    critical: "Critical"
  };

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-sm"
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

export const CriticalityDistribution = ({ className, data }: CriticalityDistributionProps) => {
  const hasData = data.length > 0 && data.some(item => 
    item.low > 0 || item.medium > 0 || item.high > 0 || item.critical > 0
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
                  <Shield className="w-12 h-12 text-blue-600/80" />
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
                No criticality data available
              </motion.p>
              <motion.p
                className="text-sm text-gray-500 max-w-xs mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Criticality distribution across industrial units will appear here when anomalies are detected and classified.
              </motion.p>
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "bg-white/50 backdrop-blur-sm border border-gray-200/50",
        className
      )}
    >
      <CardContent className="pt-6 px-4 pb-4">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 35 }}
            className={cn(
              "[&_.recharts-cartesian-grid-horizontal_line]:stroke-muted/20",
              "[&_.recharts-cartesian-grid-vertical_line]:stroke-muted/20",
              "[&_.recharts-bar-rectangle]:transition-colors duration-200",
              "font-medium"
            )}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={chartColors.grid}
            />
            <XAxis
              dataKey="name"
              fontSize={12}
              tickLine={true}
              axisLine={{ stroke: chartColors.border }}
              tick={{
                fill: chartColors.text,
                fontWeight: 600,
              }}
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
            <Bar
              dataKey="low"
              stackId="a"
              fill={chartColors.low}
              radius={[0, 0, 0, 0]}
              animationDuration={1000}
            />
            <Bar
              dataKey="medium"
              stackId="a"
              fill={chartColors.medium}
              radius={[0, 0, 0, 0]}
              animationDuration={1000}
            />
            <Bar
              dataKey="high"
              stackId="a"
              fill={chartColors.high}
              radius={[0, 0, 0, 0]}
              animationDuration={1000}
            />
            <Bar
              dataKey="critical"
              stackId="a"
              fill={chartColors.critical}
              radius={[4, 4, 0, 0]}
              animationDuration={1000}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}; 