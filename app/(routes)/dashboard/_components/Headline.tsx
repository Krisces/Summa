"use client"
import { useUser } from '@clerk/nextjs'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import AddIncome from './AddIncome';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { differenceInDays, startOfMonth } from 'date-fns';
import { MAX_DATE_RANGE_DAYS } from '@/lib/constants';
import { toast } from 'sonner';
import AddExpenseDialog from './AddExpenseDialog';


function Headline() {
  const { user } = useUser();

  const [value, setValue] = useState({
    startDate: null,
    endDate: null
  });

  const [dateRange, setDateRange] = useState<{from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: new Date(),
  })
  
  return (
    <div className='p-10'>
      <div className='flex items-center justify-between'>
        <div className=''>
          <h2 className='font-bold text-3xl'>{`Hi, ${user?.username}`}</h2>
          <p className='text-gray-500'>Here is what is happening with your money. Let us manage your expenses</p>
        </div>
        <div className='flex items-center gap-10 relative'>
          {/* Ensure the DateRangePicker has enough space and proper positioning */}
          <div>
            <DateRangePicker 
            initialDateFrom={dateRange.from}
            initialDateTo={dateRange.to}
            showCompare={false}
            onUpdate={values => {
              const {from, to} = values.range;

              if (!from || !to)return;
              if (differenceInDays(to, from) > MAX_DATE_RANGE_DAYS)
              {
                toast.error(
                  `The selected date range is too big. Max allowed date range is ${MAX_DATE_RANGE_DAYS} days.`
                )
                return;
              }

              setDateRange({from, to});
            }}
            />
          </div>
          <div className='flex gap-2'>
            <AddIncome />
            <AddExpenseDialog />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Headline