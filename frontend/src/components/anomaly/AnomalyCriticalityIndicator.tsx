import { AnomalyCriticality, getCriticalityLevel } from "@/types/anomaly";

interface AnomalyCriticalityIndicatorProps {
  criticality: number | string; // 1-15 scale (accepts both number and string)
  showScore?: boolean;
  variant?: "dot" | "text" | "full" | "badge";
  className?: string;
}

export function AnomalyCriticalityIndicator({ 
  criticality, 
  showScore = false,
  variant = "badge",
  className 
}: AnomalyCriticalityIndicatorProps) {
  const criticalityStr = typeof criticality === 'number' ? criticality.toString() : criticality;
  const criticalityNum = typeof criticality === 'string' ? parseFloat(criticality) || 0 : criticality;
  const level = getCriticalityLevel(criticalityStr);
  
  // Modern, flat, pill-style config
  const criticalityConfig = {
    'CRITICAL': {
      badgeClass: 'bg-red-50 text-red-600 font-bold',
    },
    'HIGH': {
      badgeClass: 'text-orange-600 font-bold',
    },
    'MEDIUM': {
      badgeClass: 'text-yellow-600 font-bold',
    },
    'LOW': {
      badgeClass: 'text-zinc-500',
    }
  };

  const config = criticalityConfig[level];

  if (variant === "badge") {
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs tracking-wide ${config.badgeClass} ${className}`}
        style={{ minWidth: 64, justifyContent: 'center' }}
      >
        {level}
        {showScore && (
          <span className="ml-1 opacity-70 font-normal">({criticalityNum})</span>
        )}
      </span>
    );
  }

  if (variant === "dot") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`w-2 h-2 rounded-full bg-${level.toLowerCase()}-500`} />
        <span className="text-sm font-medium">{level}</span>
        {showScore && <span className="text-xs text-gray-500">({criticalityNum})</span>}
      </div>
    );
  }

  if (variant === "full") {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center bg-gray-50`}>
          <div className={`w-2 h-2 rounded-full bg-${level.toLowerCase()}-500`} />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{level}</span>
          {showScore && <span className="text-xs text-gray-500">{criticalityNum}/15</span>}
        </div>
      </div>
    );
  }

  // Legacy text variant for backward compatibility
  return (
    <span className={`text-sm font-medium text-${level.toLowerCase()}-600 ${className}`}>
      {level}
      {showScore && <span className="text-xs text-gray-500 ml-1">({criticalityNum})</span>}
    </span>
  );
} 