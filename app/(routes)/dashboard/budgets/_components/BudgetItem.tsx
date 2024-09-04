import Link from 'next/link';
import React from 'react'


function BudgetItem({ budget }:any) {

    if (!budget || budget.amount === null) {
        return null;
    }

    const amount = parseFloat(budget.amount);
    const totalSpend = budget.totalSpend ?? 0;
    const remaining = amount - totalSpend;
    const calculateProgressPerc=()=>{
        const perc=(budget.totalSpend/budget.amount)*100
        return perc.toFixed(2);
    }

  return (
    <Link href={'/dashboard/expenses/'+budget.id} className='p-5 border rounded-lg hover:shadow-md cursor-pointer h-[170px]'>
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
                <div className='bg-violet-800 h-2 rounded-full'
                style={{
                    width:`${calculateProgressPerc()}%`
                }}
                >

                </div>
            </div>
        </div>
    </Link>
  );
}

export default BudgetItem;