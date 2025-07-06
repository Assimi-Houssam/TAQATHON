import { AnomalyCriticality, getCriticalityLevel } from "@/types/anomaly";

interface AnomalyCriticalityIndicatorProps {
  criticality: number; // 1-15 scale
  showScore?: boolean;
  variant?: "dot" | "text" | "full";
  className?: string;
}

export function AnomalyCriticalityIndicator({ 
  criticality, 
  showScore = false,
  variant = "text",
  className 
}: AnomalyCriticalityIndicatorProps) {
  const level = getCriticalityLevel(criticality);
  
  const criticalityConfig = {
    'CRITICAL': {
      color: 'bg-red-500',
      textColor: 'text-red-700'
    },
    'HIGH': {
      color: 'bg-orange-500',
      textColor: 'text-orange-700'
    },
    'MEDIUM': {
      color: 'bg-yellow-500',
      textColor: 'text-yellow-700'
    },
    'LOW': {
      color: 'bg-green-500',
      textColor: 'text-green-700'
    }
  };

  const config = criticalityConfig[level];

  if (variant === "dot") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`w-2 h-2 rounded-full ${config.color}`} />
        <span className="text-sm">{level}</span>
        {showScore && <span className="text-xs text-gray-500">({criticality})</span>}
      </div>
    );
  }

  if (variant === "full") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`w-3 h-3 rounded-full ${config.color}`} />
        <div className="flex flex-col">
          <span className="text-sm font-medium">{level}</span>
          {showScore && <span className="text-xs text-gray-500">{criticality}</span>}
        </div>
      </div>
    );
  }

  return (
    <span className={`text-sm font-medium ${config.textColor} ${className}`}>
      {level}
      {showScore && <span className="text-xs text-gray-500 ml-1">({criticality})</span>}
    </span>
  );
} 