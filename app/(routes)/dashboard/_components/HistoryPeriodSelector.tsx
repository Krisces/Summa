import React, { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface HistoryPeriodSelectorProps {
  period: { year: number; month: number };
  setPeriod: React.Dispatch<React.SetStateAction<{ year: number; month: number }>>;
  timeframe: 'year' | 'month';
  setTimeframe: React.Dispatch<React.SetStateAction<'year' | 'month'>>;
  years: number[]; // Ensure this is number[]
  months: number[]; // Ensure this is number[]
}

const HistoryPeriodSelector: React.FC<HistoryPeriodSelectorProps> = ({
  period,
  setPeriod,
  timeframe,
  setTimeframe,
  years,
  months, // Receive months as a prop
}) => {
  const [filteredMonths, setFilteredMonths] = useState<number[]>([]);

  useEffect(() => {
    // Set the filtered months based on the selected year
    if (timeframe === 'month') {
      const monthCount = new Date(period.year, 0, 0).getMonth(); // Get the number of months in the selected year
      setFilteredMonths(months.slice(0, monthCount + 1)); // Slice months based on the count
    }
  }, [period.year, timeframe, months]);

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPeriod(prev => ({ ...prev, year: parseInt(event.target.value), month: 1 })); // Reset month when year changes
  };

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPeriod(prev => ({ ...prev, month: parseInt(event.target.value) }));
  };

  return (
    <div className='border p-4 rounded-lg border-gray-300'>
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
