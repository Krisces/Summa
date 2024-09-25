"use client";
// Overview.tsx
import React from 'react';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { toast } from 'sonner';
import { differenceInDays } from 'date-fns';

const MAX_DATE_RANGE_DAYS = 30; // Adjust as necessary

interface OverviewProps {
  dateRange: { from: Date; to: Date };
  setDateRange: React.Dispatch<React.SetStateAction<{ from: Date; to: Date }>>;
}

const Overview: React.FC<OverviewProps> = ({ dateRange, setDateRange }) => {
  return (
    <div className="px-10 mb-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <h2 className="font-bold text-2xl">Overview</h2>
        <div className="mt-4 md:mt-0">
          <DateRangePicker
            initialDateFrom={dateRange.from} // Initial date range from state
            initialDateTo={dateRange.to} // Initial date range to state
            showCompare={false}
            onUpdate={values => {
              const { from, to } = values.range; // Destructure from and to dates
              if (!from || !to) return; // Validate dates
              if (differenceInDays(to, from) > MAX_DATE_RANGE_DAYS) {
                // Show error if selected range exceeds limit
                toast.error(`The selected date range is too big. Max allowed date range is ${MAX_DATE_RANGE_DAYS} days.`);
                return;
              }
              setDateRange({ from, to }); // Update date range state
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Overview;
