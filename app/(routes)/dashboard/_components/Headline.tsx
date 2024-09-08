"use client"
import { useUser } from '@clerk/nextjs'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import Datepicker from "react-tailwindcss-datepicker";
import AddIncome from './AddIncome';

function Headline() {
  const { user } = useUser();

  const [value, setValue] = useState({
    startDate: null,
    endDate: null
  });
  
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
            <Datepicker value={value} onChange={newValue => setValue(newValue as any)} />
          </div>
          <div className='flex gap-2'>
            <AddIncome />
            <Button className=' text-white'>Add Expense</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Headline