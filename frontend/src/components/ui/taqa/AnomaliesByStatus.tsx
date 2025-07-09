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
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number; percentage: string } }> }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <div className="text-sm font-medium text-gray-900 mb-1">{data.name}</div>
        <div className="text-xs text-gray-600">
          {data.value} ({data.percentage}%)
        </div>
      </div>
    );
  }
  return null;
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
      <Card className={cn("bg-white border border-gray-200", className)}>
        <CardContent className="flex flex-col items-center justify-center h-[300px] text-center">
          <AlertTriangle className="w-8 h-8 text-gray-400 mb-3" />
          <h3 className="text-sm font-medium text-gray-900 mb-1">No anomalies</h3>
          <p className="text-xs text-gray-500">All systems operating normally</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-white border border-gray-200", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {dataWithPercentages.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-gray-600">{entry.name}</span>
                <span className="text-xs font-medium text-gray-900">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={dataWithPercentages}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={100}
              paddingAngle={1}
              dataKey="value"
              stroke="none"
              className="focus:outline-none"
            >
              {dataWithPercentages.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}; 