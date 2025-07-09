"use client";

import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  progress?: {
    value: number;
    max?: number;
    showPercentage?: boolean;
  };
  isLoading?: boolean;
  className?: string;
}

export function KPICard({
  title,
  value,
  subtitle,
  icon,
  trend,
  progress,
  isLoading = false,
  className,
}: KPICardProps) {
  if (isLoading) {
    return (
      <Card className={cn("p-6 border border-slate-200 bg-white", className)}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="text-right space-y-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            {progress && <Skeleton className="h-2 w-full" />}
          </div>
        </div>
      </Card>
    );
  }

  const formatValue = (val: string | number): string => {
    if (typeof val === "number") {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <Card className={cn("p-6 border border-slate-200 bg-white", className)}>
      <div className="space-y-4">
        {/* Header with Icon and Value */}
        <div className="flex items-center justify-between">
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
            <div className="h-6 w-6 text-blue-600">
              {icon}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl md:text-3xl font-semibold text-slate-900 mb-1">
              {formatValue(value)}
            </div>
            {trend && (
              <div className="flex items-center justify-end gap-1">
                <span className="text-sm font-medium text-slate-600">
                  {trend.isPositive ? "↗" : "↘"} {Math.abs(trend.value)}%
                </span>
                {trend.label && (
                  <Badge variant="outline" className="text-xs font-normal border-slate-300">
                    {trend.label}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Title and Subtitle */}
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-slate-700 leading-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500">
              {subtitle}
            </p>
          )}
        </div>

        {/* Progress Bar */}
        {progress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Progress</span>
              {progress.showPercentage && (
                <span>
                  {Math.round((progress.value / (progress.max || 100)) * 100)}%
                </span>
              )}
            </div>
            <Progress 
              value={(progress.value / (progress.max || 100)) * 100} 
              className="h-2"
            />
          </div>
        )}
      </div>
    </Card>
  );
}

// Specialized KPI Card for displaying percentage metrics
interface PercentageKPICardProps {
  title: string;
  percentage: number;
  total: number;
  count: number;
  icon: ReactNode;
  isLoading?: boolean;
  className?: string;
}

export function PercentageKPICard({
  title,
  percentage,
  total,
  count,
  icon,
  isLoading = false,
  className,
}: PercentageKPICardProps) {
  return (
    <KPICard
      title={title}
      value={`${percentage.toFixed(1)}%`}
      subtitle={`${count.toLocaleString()} of ${total.toLocaleString()} total`}
      icon={icon}
      progress={{
        value: percentage,
        max: 100,
        showPercentage: false,
      }}
      isLoading={isLoading}
      className={className}
    />
  );
}

// Specialized KPI Card for time-based metrics
interface TimeKPICardProps {
  title: string;
  hours: number;
  days: number;
  total: number;
  icon: ReactNode;
  isLoading?: boolean;
  className?: string;
}

export function TimeKPICard({
  title,
  hours,
  days,
  total,
  icon,
  isLoading = false,
  className,
}: TimeKPICardProps) {
  const formatTime = () => {
    if (days >= 1) {
      return `${days.toFixed(1)} days`;
    } else {
      return `${hours.toFixed(1)} hrs`;
    }
  };

  return (
    <KPICard
      title={title}
      value={formatTime()}
      subtitle={`Based on ${total.toLocaleString()} anomalies`}
      icon={icon}
      isLoading={isLoading}
      className={className}
    />
  );
} 