"use client";
import { createContext, useContext, useState } from 'react';
import { startOfMonth } from 'date-fns';

interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangeContextType {
  dateRange: DateRange;
  setGlobalDateRange: (range: DateRange) => void;
}

const DateRangeContext = createContext<DateRangeContextType>({
  dateRange: { from: startOfMonth(new Date()), to: new Date() },
  setGlobalDateRange: () => {},
});

export const DateRangeProvider = ({ children }: { children: React.ReactNode }) => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });

  const setGlobalDateRange = (range: DateRange) => {
    setDateRange(range);
  };

  return (
    <DateRangeContext.Provider value={{ dateRange, setGlobalDateRange }}>
      {children}
    </DateRangeContext.Provider>
  );
};

export const useDateRange = () => useContext(DateRangeContext);