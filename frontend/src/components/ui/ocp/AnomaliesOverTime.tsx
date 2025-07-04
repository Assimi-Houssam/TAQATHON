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
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <div className="text-sm font-medium text-gray-900 mb-2">{label}</div>
        {payload.map((entry: any, index: number) => (
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
  const [timeframe, setTimeframe] = useState("daily");

  const hasData = data.length > 0 && data.some(item => 
    item.anomalies > 0 || item.resolved > 0 || item.critical > 0
  );

  if (!hasData) {
    return (
      <Card className={cn("bg-white border border-gray-200", className)}>
        <CardContent className="flex flex-col items-center justify-center h-[350px] text-center">
          <TrendingUp className="w-8 h-8 text-gray-400 mb-3" />
          <h3 className="text-sm font-medium text-gray-900 mb-1">No trend data</h3>
          <p className="text-xs text-gray-500">Historical trends will appear over time</p>
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
    <Card className={cn("bg-white border border-gray-200", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: chartColors.anomalies }} />
              <span className="text-xs text-gray-600">Total</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: chartColors.resolved }} />
              <span className="text-xs text-gray-600">Resolved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: chartColors.critical }} />
              <span className="text-xs text-gray-600">Critical</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <select
              value={viewType}
              onChange={(e) => setViewType(e.target.value as "line" | "area")}
              className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
            >
              <option value="line">Line</option>
              <option value="area">Area</option>
            </select>
          </div>
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
          ) : (
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