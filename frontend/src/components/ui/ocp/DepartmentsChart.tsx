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
import { Factory } from "lucide-react";
import { DepartmentData } from "@/types/dashboard";

interface DepartmentsChartProps {
  className?: string;
  dateRange: DateRange;
  data: DepartmentData[];
}

const chartColors = {
  bar: "#3B82F6",
  barHover: "#2563EB",
  tooltip: {
    background: "rgba(255, 255, 255, 0.95)",
    border: "rgba(148, 163, 184, 0.2)",
  },
};

const formatValue = (value: number) => {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + "M";
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1) + "K";
  }
  return value.toString();
};

export const DepartmentsChart = ({
  className,
  dateRange,
  data,
}: DepartmentsChartProps) => {
  // Show empty state if no data
  if (!data || data.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Factory className="w-12 h-12 text-blue-600" />
              </div>
            </div>
            <div className="text-center space-y-3 px-4">
              <p className="text-gray-700 font-semibold text-lg">
                No anomaly data available
              </p>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                Start monitoring your industrial units to track anomaly distribution across departments
              </p>
            </div>
            <div className="flex justify-center items-center gap-2 text-xs text-blue-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Ready to receive monitoring data</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show data chart
  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-0">
        <div className="p-6 pb-0">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Department Distribution
            </h3>
            <p className="text-sm text-gray-600">
              Anomaly distribution across departments
            </p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis
              dataKey="name"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#6b7280" }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#6b7280" }}
              tickFormatter={formatValue}
              width={60}
            />
            <Tooltip
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
                  Anomalies
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
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
