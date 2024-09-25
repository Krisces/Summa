import React, { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface HistoryPeriodSelectorProps {
  period: { year: number; month: number };
  setPeriod: React.Dispatch<React.SetStateAction<{ year: number; month: number }>>;
  timeframe: 'year' | 'month';
  setTimeframe: React.Dispatch<React.SetStateAction<'year' | 'month'>>;
  years: number[];
  months: number[];
  refreshData: () => void;
}

const HistoryPeriodSelector: React.FC<HistoryPeriodSelectorProps> = ({
  period,
  setPeriod,
  timeframe,
  setTimeframe,
  years,
  months,
  refreshData,
}) => {
  const [filteredMonths, setFilteredMonths] = useState<number[]>(months); // Set all months by default

  useEffect(() => {
    if (timeframe === 'month') {
      setFilteredMonths(months); // Set all available months
    }
  }, [timeframe, months]);

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(event.target.value);
    setPeriod(prev => ({ ...prev, year: newYear, month: 1 })); // Reset month when year changes
    refreshData(); // Refresh data when year changes
  };

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(event.target.value);
    setPeriod(prev => ({ ...prev, month: newMonth }));
    refreshData(); // Refresh data when month changes
  };

  return (
    <div className='p-4 rounded-lg border-gray-300'>
      <div className='flex flex-wrap items-center gap-4 mb-4'>
        <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as 'year' | 'month')}>
          <TabsList>
            <TabsTrigger value="year">Year</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className='flex gap-4'>
          <div className='flex items-center gap-2'>
            <label htmlFor="year" className="font-semibold">Year:</label>
            <select
              id="year"
              value={period.year}
              onChange={handleYearChange}
              className="p-2 border rounded"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          {timeframe === 'month' && (
            <div className='flex items-center gap-2'>
              <label htmlFor="month" className="font-semibold">Month:</label>
              <select
                id="month"
                value={period.month}
                onChange={handleMonthChange}
                className="p-2 border rounded"
              >
                {filteredMonths.map(month => (
                  <option key={month} value={month}>
                    {new Date(period.year, month - 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPeriodSelector;
