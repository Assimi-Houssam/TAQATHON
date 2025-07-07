import { getStatusColor, getStatusLabel } from "@/types/anomaly";
import type { AnomalyStatus } from "@/types/anomaly";

interface AnomalyStatusProps {
  status: AnomalyStatus;
  className?: string;
}

export function AnomalyStatus({ 
  status, 
  className 
}: AnomalyStatusProps) {
  const isNew = status === 'New';
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {isNew && (
        <div className="relative opacity-75">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse duration-1500" />
          <div className="absolute inset-0 w-2 h-2 bg-blue-500 rounded-full animate-ping duration-1500" />
        </div>
      )}
      <span className={`text-sm font-medium ${getStatusColor(status)}`}>
        {getStatusLabel(status)}
      </span>
    </div>
  );
} 