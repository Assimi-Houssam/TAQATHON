"use client"

import * as React from "react"
import { subDays, startOfDay, endOfDay } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTimeFrame } from "@/context/TimeFrameContext"

interface TimeframeSelectProps {
  className?: string;
}

type TimeframePeriod = '1D' | '7D' | '30D';

export const TimeframeSelect = ({ className }: TimeframeSelectProps) => {
  const { dateRange, setDateRange } = useTimeFrame();
  const [selectedPeriod, setSelectedPeriod] = React.useState<TimeframePeriod>('30D');

  const timeframePeriods: { value: TimeframePeriod; label: string; days: number }[] = [
    { value: '1D', label: '1 Day', days: 1 },
    { value: '7D', label: '7 Days', days: 7 },
    { value: '30D', label: '30 Days', days: 30 },
  ];

  const handleTimeframeChange = (period: TimeframePeriod, days: number) => {
    setSelectedPeriod(period);
    
    const now = new Date();
    const from = startOfDay(subDays(now, days - 1)); // Include today
    const to = endOfDay(now);
    
    setDateRange({ from, to });
  };

  // Set default 30D on mount
  React.useEffect(() => {
    if (!dateRange.from || !dateRange.to) {
      handleTimeframeChange('30D', 30);
    }
  }, []);

  return (
    <div className={cn("flex", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline"
            className="bg-background/50 backdrop-blur-sm border-border/50 hover:bg-accent/50 transition-all duration-200"
          >
            <CalendarIcon className="h-4 w-4 mr-2 opacity-50" />
            {selectedPeriod}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="start" 
          className="w-32 p-1 bg-background/95 backdrop-blur-sm border-border/50"
        >
          {timeframePeriods.map((period) => (
            <DropdownMenuItem
              key={period.value}
              onClick={() => handleTimeframeChange(period.value, period.days)}
              className={cn(
                "cursor-pointer px-3 py-2 rounded-sm transition-colors duration-150",
                selectedPeriod === period.value 
                  ? "bg-blue-50 text-blue-700 font-medium" 
                  : "hover:bg-accent/50"
              )}
            >
              <span className="text-sm">{period.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}; 