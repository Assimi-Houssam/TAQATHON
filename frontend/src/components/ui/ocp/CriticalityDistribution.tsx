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
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum: number, entry: { value: number }) => sum + entry.value, 0);
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <div className="text-sm font-medium text-gray-900 mb-2">{label}</div>
        <div className="text-xs text-gray-600 mb-2">Total: {total}</div>
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

export const CriticalityDistribution = ({ className, data }: CriticalityDistributionProps) => {
  const hasData = data.length > 0 && data.some(item => 
    item.low > 0 || item.medium > 0 || item.high > 0 || item.critical > 0
  );

  if (!hasData) {
    return (
      <Card className={cn("bg-white border border-gray-200", className)}>
        <CardContent className="flex flex-col items-center justify-center h-[300px] text-center">
          <Shield className="w-8 h-8 text-gray-400 mb-3" />
          <h3 className="text-sm font-medium text-gray-900 mb-1">No criticality data</h3>
          <p className="text-xs text-gray-500">Data will appear when anomalies are classified</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-white border border-gray-200", className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: chartColors.low }} />
            <span className="text-xs text-gray-600">Low</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: chartColors.medium }} />
            <span className="text-xs text-gray-600">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: chartColors.high }} />
            <span className="text-xs text-gray-600">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: chartColors.critical }} />
            <span className="text-xs text-gray-600">Critical</span>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis
              dataKey="name"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#6b7280" }}
            />
            <YAxis
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#6b7280" }}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="low" stackId="a" fill={chartColors.low} radius={[0, 0, 0, 0]} />
            <Bar dataKey="medium" stackId="a" fill={chartColors.medium} radius={[0, 0, 0, 0]} />
            <Bar dataKey="high" stackId="a" fill={chartColors.high} radius={[0, 0, 0, 0]} />
            <Bar dataKey="critical" stackId="a" fill={chartColors.critical} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}; 