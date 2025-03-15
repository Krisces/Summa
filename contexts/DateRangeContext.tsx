"use client";
import { createContext, useContext, useState, useEffect } from 'react';
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
  // Load dateRange from localStorage on initial render
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const storedDateRange = localStorage.getItem('dateRange');
    if (storedDateRange) {
      return JSON.parse(storedDateRange, (key, value) => {
        if (key === 'from' || key === 'to') {
          return new Date(value); // Convert string back to Date
        }
        return value;
      });
    }
    // Default to current month if no dateRange is stored
    return {
      from: startOfMonth(new Date()),
      to: new Date(),
    };
  });

  // Save dateRange to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('dateRange', JSON.stringify(dateRange));
  }, [dateRange]);

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