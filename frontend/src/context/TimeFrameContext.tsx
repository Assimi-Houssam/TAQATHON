"use client";

import { DateRange } from "react-day-picker";
import { createContext, useContext, useState, ReactNode } from "react";
import { startOfMonth, endOfMonth } from "date-fns";

interface TimeFrameContextType {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
}

const TimeFrameContext = createContext<TimeFrameContextType | undefined>(undefined);

export function TimeFrameProvider({ children }: { children: ReactNode }) {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  return (
    <TimeFrameContext.Provider value={{ dateRange, setDateRange }}>
      {children}
    </TimeFrameContext.Provider>
  );
}

export function useTimeFrame() {
  const context = useContext(TimeFrameContext);
  if (context === undefined) {
    throw new Error("useTimeFrame must be used within a TimeFrameProvider");
  }
  return context;
} 