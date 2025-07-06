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
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <div className="text-sm font-medium text-gray-900 mb-2">{label}</div>
        {payload.map((entry: { name: string; value: number; color: string }, index: number) => (
          <div key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const AnomaliesOverTime = ({ className, data }: AnomaliesOverTimeProps) => {
  const [viewType, setViewType] = useState<"line" | "area">("line");
  
  const hasData = data.length > 0;
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!hasData) {
    return (
      <Card className={cn("bg-white border border-gray-200", className)}>
        <CardContent className="flex flex-col items-center justify-center h-[300px] text-center">
          <TrendingUp className="w-8 h-8 text-gray-400 mb-3" />
          <h3 className="text-sm font-medium text-gray-900 mb-1">No trend data</h3>
          <p className="text-xs text-gray-500">Anomaly tracking will appear here</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-white border border-gray-200", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-medium text-gray-900">Anomalies Over Time</h3>
          </div>
          <Select value={viewType} onValueChange={(value: "line" | "area") => setViewType(value)}>
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line</SelectItem>
              <SelectItem value="area">Area</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ResponsiveContainer width="100%" height={250}>
          {viewType === "line" ? (
            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis
                dataKey="date"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#6b7280" }}
                tickFormatter={formatDate}
              />
              <YAxis
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#6b7280" }}
                width={30}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="anomalies"
                stroke={chartColors.anomalies}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="resolved"
                stroke={chartColors.resolved}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="critical"
                stroke={chartColors.critical}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          ) :
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis
                dataKey="date"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#6b7280" }}
                tickFormatter={formatDate}
              />
              <YAxis
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#6b7280" }}
                width={30}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="anomalies"
                stackId="1"
                stroke={chartColors.anomalies}
                fill={chartColors.anomalies}
                fillOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="resolved"
                stackId="1"
                stroke={chartColors.resolved}
                fill={chartColors.resolved}
                fillOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="critical"
                stackId="1"
                stroke={chartColors.critical}
                fill={chartColors.critical}
                fillOpacity={0.3}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}; 