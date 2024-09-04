import Link from 'next/link';
import React from 'react'

// Define the type for the budget prop
type Budget = {
    id: number;
    name: string;
    amount: string | null;
    icon: string | null;
    createdBy: string;
    totalSpend?: number;
    totalItem?: number;
  };

interface BudgetItemProps {
  budget: Budget;
}

function BudgetItem({ budget }: BudgetItemProps) {

    if (!budget || budget.amount === null) {
        return null;
    }

    const amount = parseFloat(budget.amount);
    const totalSpend = budget.totalSpend ?? 0;
    const remaining = amount - totalSpend;

  return (
    <Link href={'/dashboard/expenses/'+budget.id} className='p-5 border rounded-lg hover:shadow-md cursor-pointer'>
        <div className='flex gap-2 items-center justify-between'>
            <div className='flex gap-2 items-center'>
                <h2 className='text-2xl p-2 px-4 bg-slate-100 rounded-full'>
                    {budget?.icon}
                </h2>
                <div className='pl-3'>
                    <h2 className='font-bold'>{budget.name}</h2>
                    <h2 className='text-sm text-gray-500'>{budget.totalItem} Item</h2>
                </div>
            </div>
            <h2 className='font-bold text-violet-800 text-lg'>
                ${budget.amount}
            </h2>
        </div>
        <div className='mt-5'>
            <div className='flex items-center justify-between'>
                <h2 className='text-s text-slate-400'>
                ${totalSpend} Spent
                </h2>
                <h2 className='text-s text-slate-400'>
                    ${remaining} Remaining
                </h2>
            </div>
            <div className='w-full bg-slate-300 h-2 rounded-full'>
                <div className='w-[40%] bg-violet-800 h-2 rounded-full'>

                </div>
            </div>
        </div>
    </Link>
  );
}

export default BudgetItem;