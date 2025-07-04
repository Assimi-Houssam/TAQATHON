"use client"

import * as React from "react"
import { startOfMonth, endOfMonth } from "date-fns"
import { safeFormat } from "@/lib/utils/date"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useTimeFrame } from "@/context/TimeFrameContext"
import { Separator } from "@/components/ui/separator"

interface TimeframeSelectProps {
  className?: string;
  fromYear?: number;
  toYear?: number;
}

export const TimeframeSelect = ({
  className,
  fromYear = 2024,
  toYear = new Date().getFullYear(),
}: TimeframeSelectProps) => {
  const { dateRange, setDateRange } = useTimeFrame();
  const [localRange, setLocalRange] = React.useState({
    startMonth: dateRange.from?.getMonth() || new Date().getMonth(),
    startYear: dateRange.from?.getFullYear() || new Date().getFullYear(),
    endMonth: dateRange.to?.getMonth() || new Date().getMonth(),
    endYear: dateRange.to?.getFullYear() || new Date().getFullYear(),
  });

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const handleRangeChange = (
    type: 'startMonth' | 'startYear' | 'endMonth' | 'endYear',
    value: number
  ) => {
    const newRange = {
      ...localRange,
      [type]: value
    };

    const fromDate = startOfMonth(new Date(newRange.startYear, newRange.startMonth));
    const toDate = endOfMonth(new Date(newRange.endYear, newRange.endMonth));

    if (fromDate > toDate) {
      if (type.startsWith('start')) {
        newRange.endMonth = newRange.startMonth;
        newRange.endYear = newRange.startYear;
      } else {
        newRange.startMonth = newRange.endMonth;
        newRange.startYear = newRange.endYear;
      }
    }

    setLocalRange(newRange);
    setDateRange({
      from: startOfMonth(new Date(newRange.startYear, newRange.startMonth)),
      to: endOfMonth(new Date(newRange.endYear, newRange.endMonth))
    });
  };

  const formatDateRange = (range: DateRange) => {
    if (!range.from || !range.to) return "Select date range";
    return `${safeFormat(range.from, "MMM yyyy", "Invalid")} - ${safeFormat(range.to, "MMM yyyy", "Invalid")}`;
  }

  const DateSelector = ({ isStart }: { isStart: boolean }) => {
    const currentMonth = isStart ? localRange.startMonth : localRange.endMonth;
    const currentYear = isStart ? localRange.startYear : localRange.endYear;
    
    return (
      <div className="space-y-4 select-none">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-medium text-sm text-muted-foreground">
            {isStart ? "From" : "To"}
          </h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleRangeChange(
                isStart ? 'startYear' : 'endYear',
                currentYear - 1
              )}
              disabled={currentYear <= fromYear}
            >
              <ChevronLeftIcon className="h-3 w-3" />
            </Button>
            <span className="font-medium min-w-[4rem] text-center">
              {currentYear}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleRangeChange(
                isStart ? 'startYear' : 'endYear',
                currentYear + 1
              )}
              disabled={currentYear >= toYear}
            >
              <ChevronRightIcon className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1">
          {months.map((month, index) => (
            <Button
              key={month}
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-2",
                currentMonth === index && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                "transition-all duration-200"
              )}
              onClick={() => handleRangeChange(
                isStart ? 'startMonth' : 'endMonth',
                index
              )}
            >
              {month}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={cn("flex flex-col sm:flex-row gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !dateRange && "text-muted-foreground",
              "hover:bg-accent hover:text-accent-foreground transition-colors"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange(dateRange)}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[32rem] p-4"
          align="start"
        >
          <div className="grid grid-cols-2 gap-10">
            <DateSelector isStart={true} />
            <DateSelector isStart={false} />
          </div>

          <Separator className="my-2" />
          
          <div className="flex justify-between text-sm text-muted-foreground">
            <p>
              From: {safeFormat(new Date(localRange.startYear, localRange.startMonth), "MMM yyyy", "Invalid")}
            </p>
            <p>
              To: {safeFormat(new Date(localRange.endYear, localRange.endMonth), "MMM yyyy", "Invalid")}
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
} 