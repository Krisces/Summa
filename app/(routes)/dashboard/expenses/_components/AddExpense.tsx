import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'
import { db } from '@/utils/dbConfig';
import { Budgets, Expenses } from '@/utils/schema';
import moment from 'moment';
import React, { useState } from 'react'
import { toast } from 'sonner';

interface AddExpenseProps {
  budgetId: string; // Passed as a string from parent
  user: any; // Adjust type as necessary
  refreshData: any;
}

function AddExpense({ budgetId, user, refreshData }: AddExpenseProps) {

  const [name, setName] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  const addNewExpense=async()=>{

    const budgetIdInt = parseInt(budgetId, 10);

    const result=await db.insert(Expenses)
    .values({
      name:name,
      amount:amount,
      budgetId:budgetIdInt,
      createdAt:moment().format('MM/DD/YYYY')
    }).returning({insertedId:Budgets.id})

    console.log(result);
    if(result)
    {
      refreshData()
      toast('New Expense Added!')
    }
  }

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
      <Button disabled={!(name && amount)}
        onClick={() => addNewExpense()}
        className='mt-3 w-full'>Add New Expense</Button>
    </div>
  )
}

export default AddExpense