"use client"

import * as React from "react"
import { startOfMonth, endOfMonth, format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useTimeFrame } from "@/context/TimeFrameContext"

interface TimeframeSelectProps {
  className?: string;
  fromYear?: number;
  toYear?: number;
}

export const TimeframeSelect = ({
  className,
  fromYear = new Date().getFullYear() - 20,
  toYear = new Date().getFullYear(),
}: TimeframeSelectProps) => {
  const { dateRange, setDateRange } = useTimeFrame();
  const [open, setOpen] = React.useState(false);

  // Generate year and month options
  const years = Array.from({ length: toYear - fromYear + 1 }, (_, i) => fromYear + i);
  const months = [
    { value: 0, label: "Jan" }, { value: 1, label: "Feb" }, { value: 2, label: "Mar" },
    { value: 3, label: "Apr" }, { value: 4, label: "May" }, { value: 5, label: "Jun" },
    { value: 6, label: "Jul" }, { value: 7, label: "Aug" }, { value: 8, label: "Sep" },
    { value: 9, label: "Oct" }, { value: 10, label: "Nov" }, { value: 11, label: "Dec" }
  ];

  // Current selected values
  const fromMonth = dateRange.from?.getMonth() ?? new Date().getMonth();
  const selectedFromYear = dateRange.from?.getFullYear() ?? new Date().getFullYear();
  const toMonth = dateRange.to?.getMonth() ?? new Date().getMonth();
  const selectedToYear = dateRange.to?.getFullYear() ?? new Date().getFullYear();

  const handleDateChange = (type: 'from' | 'to', year: number, month: number) => {
    const newDate = type === 'from' 
      ? startOfMonth(new Date(year, month))
      : endOfMonth(new Date(year, month));
    
    const newRange = {
      from: type === 'from' ? newDate : dateRange.from,
      to: type === 'to' ? newDate : dateRange.to
    };

    // Ensure from date is not after to date
    if (newRange.from && newRange.to && newRange.from > newRange.to) {
      if (type === 'from') {
        newRange.to = endOfMonth(new Date(year, month));
      } else {
        newRange.from = startOfMonth(new Date(year, month));
      }
    }

    setDateRange(newRange);
  };

  const formatDateRange = () => {
    if (!dateRange.from || !dateRange.to) return "Select period";
    
    const fromStr = format(dateRange.from, "MMM yyyy");
    const toStr = format(dateRange.to, "MMM yyyy");
    
    return fromStr === toStr ? fromStr : `${fromStr} - ${toStr}`;
  };

  const DateSelector = ({ type, year, month }: { type: 'from' | 'to', year: number, month: number }) => (
    <div className="space-y-3">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {type === 'from' ? 'From' : 'To'}
      </div>
      
      <div className="space-y-2">
        <select
          value={year}
          onChange={(e) => handleDateChange(type, parseInt(e.target.value), month)}
          className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        
        <select
          value={month}
          onChange={(e) => handleDateChange(type, year, parseInt(e.target.value))}
          className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {months.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <div className={cn("flex", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[120px] justify-start text-left font-normal",
              !dateRange.from && "text-muted-foreground",
              "bg-background/50 backdrop-blur-sm border-border/50 hover:bg-accent/50 transition-all duration-200"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
            <span className="truncate">{formatDateRange()}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-80 p-4 bg-background/95 backdrop-blur-sm border-border/50" 
          align="start"
        >
          <div className="grid grid-cols-2 gap-4">
            <DateSelector type="from" year={selectedFromYear} month={fromMonth} />
            <DateSelector type="to" year={selectedToYear} month={toMonth} />
          </div>
          
          <div className="mt-4 pt-3 border-t border-border/50">
            <div className="text-xs text-muted-foreground text-center">
              {format(dateRange.from || new Date(), "MMM yyyy")} to {format(dateRange.to || new Date(), "MMM yyyy")}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
} 