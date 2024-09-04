import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'
import React, { useState } from 'react'

function AddExpense() {

  const [name, setName] = useState<string>('');
    const [amount, setAmount] = useState<string>('');

  return (
    <div className='border p-5 rounded-lg'>
      <h2 className='font-bold text-lg'>
        Add Expense
      </h2>
      <div className='mt-3'>
        <h2 className='text-black font-medium my-1'>
          Expense Name
        </h2>
        <Input
          type="string"
          placeholder='e.g. Walmart'
          onChange={(e) => { setName(e.target.value) }}
        />
      </div>
      <div className='mt-3'>
        <h2 className='text-black font-medium my-1'>
          Expense Name
        </h2>
        <Input
          type="string"
          placeholder='e.g. 50'
          onChange={(e) => { setAmount(e.target.value) }}
        />
      </div>
      <Button disabled={!(name&&amount)} className='mt-3 w-full'>Add New Expense</Button>
    </div>
  )
}

export default AddExpense