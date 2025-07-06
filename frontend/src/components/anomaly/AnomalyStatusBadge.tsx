import { AnomalyStatus, getStatusColor, getStatusLabel } from "@/types/anomaly";

interface AnomalyStatusProps {
  status: AnomalyStatus;
  className?: string;
}

export function AnomalyStatus({ 
  status, 
  className 
}: AnomalyStatusProps) {
  return (
    <span className={`text-sm font-medium ${getStatusColor(status)} ${className}`}>
      {getStatusLabel(status)}
    </span>
  );
} 