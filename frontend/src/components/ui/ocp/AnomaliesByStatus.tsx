import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { AlertTriangle, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface AnomaliesByStatusProps {
  className?: string;
  data: {
    name: string;
    value: number;
    color: string;
    icon: React.ReactNode;
  }[];
}

const chartColors = {
  new: "#3B82F6",
  inProgress: "#F59E0B",
  resolved: "#10B981",
  escalated: "#EF4444",
  tooltip: {
    background: "hsl(0, 0%, 100%)",
    border: "hsl(215.4, 16.3%, 46.9%, 0.2)",
    text: "hsl(215.4, 16.3%, 46.9%)",
  },
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
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
        <div className="flex items-center gap-2 mb-2">
          {data.icon}
          <span className="font-semibold text-gray-900">{data.name}</span>
        </div>
        <p className="text-sm text-gray-600">
          Count: <span className="font-semibold">{data.value}</span>
        </p>
        <p className="text-sm text-gray-600">
          Percentage: <span className="font-semibold">{data.percentage}%</span>
        </p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm font-medium text-gray-700">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export const AnomaliesByStatus = ({ className, data }: AnomaliesByStatusProps) => {
  const hasData = data.length > 0 && data.some(item => item.value > 0);
  
  // Calculate percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const dataWithPercentages = data.map(item => ({
    ...item,
    percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : 0
  }));

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
                  <AlertTriangle className="w-12 h-12 text-blue-600/80" />
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
                No anomalies detected
              </motion.p>
              <motion.p
                className="text-sm text-gray-500 max-w-xs mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                All systems operating normally. Anomaly status distribution will appear here when issues are detected.
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
          <PieChart>
            <Pie
              data={dataWithPercentages}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
              className="focus:outline-none"
              animationDuration={1000}
            >
              {dataWithPercentages.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}; 