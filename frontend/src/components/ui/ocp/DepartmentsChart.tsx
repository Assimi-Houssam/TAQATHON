import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { DateRange } from "react-day-picker";
import { TableProperties } from "lucide-react";
import { motion } from "framer-motion";
import { DepartmentData } from "@/types/dashboard";

interface DepartmentsChartProps {
  className?: string;
  dateRange: DateRange;
  data: DepartmentData[];
}

const chartColors = {
  bar: "hsl(217.2, 91.2%, 59.8%)",
  barHover: "hsl(217.2, 91.2%, 65%)",
  text: "hsl(215.4, 16.3%, 46.9%)",
  grid: "hsl(215.4, 16.3%, 46.9%, 0.1)",
  border: "hsl(215.4, 16.3%, 46.9%, 0.2)",
  tooltip: {
    background: "hsl(0, 0%, 100%)",
    border: "hsl(215.4, 16.3%, 46.9%, 0.2)",
    text: "hsl(215.4, 16.3%, 46.9%)",
  },
};

export const DepartmentsChart = ({
  className,
  dateRange,
  data,
}: DepartmentsChartProps) => {
  const hasData = data.length > 0;
  const formatValue = (value: number) => {
    return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toString();
  };

  if (dateRange) {
    console.log(dateRange);
  }

  if (!hasData) {
    return (
      <Card
        className={cn(
          "bg-white/50 backdrop-blur-sm border-none overflow-hidden",
          className
        )}
      >
        <CardContent className="pt-4 p-0 h-[350px] relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100" />
            <div className="h-full w-full bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]" />
          </div>

          {/* Content Container */}
          <motion.div
            className="relative h-full flex flex-col items-center justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Icon */}
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
                    rotate: [0, 10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative z-10"
                >
                  <TableProperties className="w-12 h-12 text-blue-600/80" />
                </motion.div>
                <motion.div
                  className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </motion.div>

            {/* Text Content */}
            <motion.div
              className="text-center space-y-2 px-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <motion.p
                className="text-gray-600 font-medium text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                No data available for the selected time frame
              </motion.p>
              <motion.p
                className="text-sm text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Try selecting a different date range
              </motion.p>
            </motion.div>

            {/* Decorative Elements */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl" />
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
            margin={{ top: 20, right: 30, left: 10, bottom: 35 }}
            className={cn(
              "[&_.recharts-cartesian-grid-horizontal_line]:stroke-muted/20",
              "[&_.recharts-cartesian-grid-vertical_line]:stroke-muted/20",
              "[&_.recharts-bar-rectangle]:transition-colors duration-200",
              "font-medium"
            )}
            barGap={2}
            barSize={35}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={true}
              stroke={chartColors.grid}
            />
            <XAxis
              dataKey="name"
              fontSize={12}
              tickLine={true}
              axisLine={{ stroke: chartColors.border }}
              angle={-35}
              textAnchor="end"
              height={60}
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
              tickFormatter={formatValue}
              tick={{
                fill: chartColors.text,
                fontWeight: 600,
              }}
              tickMargin={10}
              width={50}
              padding={{ top: 20 }}
            />
            <Tooltip
              cursor={false}
              contentStyle={{
                backgroundColor: chartColors.tooltip.background,
                border: `1px solid ${chartColors.tooltip.border}`,
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                padding: "12px 16px",
              }}
              formatter={(value: number) => [
                <span
                  key="value"
                  className="font-semibold text-gray-900 text-base"
                >
                  {formatValue(value)}
                </span>,
                <span key="label" className="text-sm text-gray-600">
                  Requests
                </span>,
              ]}
              labelFormatter={(label) => (
                <span className="text-sm font-semibold text-gray-700">
                  {label}
                </span>
              )}
              wrapperStyle={{
                outline: "none",
                zIndex: 1000,
              }}
            />
            <Bar
              dataKey="requests"
              fill={chartColors.bar}
              radius={[6, 6, 0, 0]}
              className="hover:fill-[var(--bar-hover-color)]"
              isAnimationActive={true}
              animationDuration={1000}
              style={
                {
                  "--bar-hover-color": chartColors.barHover,
                } as React.CSSProperties
              }
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
