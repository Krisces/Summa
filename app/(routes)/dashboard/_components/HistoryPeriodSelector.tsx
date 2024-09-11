import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Ensure the import path is correct

interface HistoryPeriodSelectorProps {
  period: { year: number; month: number };
  setPeriod: React.Dispatch<React.SetStateAction<{ year: number; month: number }>>;
  timeframe: 'year' | 'month';
  setTimeframe: React.Dispatch<React.SetStateAction<'year' | 'month'>>;
  years: number[]; // Pass years as an array
}

const HistoryPeriodSelector: React.FC<HistoryPeriodSelectorProps> = ({
  period,
  setPeriod,
  timeframe,
  setTimeframe,
  years
}) => {
  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPeriod(prev => ({ ...prev, year: parseInt(event.target.value) }));
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
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <option key={month} value={month}>
                    {new Date(2021, month - 1).toLocaleString('default', { month: 'long' })}
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
