import Link from 'next/link';
import React from 'react'


function CategorytItem({ category }: any) {


    // Handle budgetAmount, checking if it's null
    const budgetAmount = category.budgetAmount !== null ? parseFloat(category.budgetAmount) : null;
    const totalSpend = category.totalSpend ?? 0;
    // Calculate remaining amount if budgetAmount is not null
    const remaining = budgetAmount !== null ? budgetAmount - totalSpend : null;
    // Calculate progress percentage only if budgetAmount is not null
    const calculateProgressPerc = () => {
        if (budgetAmount !== null) {
            const perc = (totalSpend / budgetAmount) * 100;
            return perc.toFixed(2);
        }
        return '0.00'; // Default value when there is no budget
    };

    return (
        <Link href={'/dashboard/expenses/' + category.id} className='p-5 border rounded-lg hover:shadow-md cursor-pointer h-[170px]'>
            <div className='flex gap-2 items-center justify-between'>
                <div className='flex gap-2 items-center'>
                    <h2 className='text-2xl p-2 px-4 bg-slate-100 rounded-full'>
                        {category?.icon}
                    </h2>
                    <div className='pl-3'>
                        <h2 className='font-bold'>{category.name}</h2>
                        <h2 className='text-sm text-gray-500'>{category.totalItem} Item</h2>
                    </div>
                </div>
                <h2 className='font-bold text-violet-800 text-lg'>
                    ${category.budgetAmount}
                </h2>
            </div>
            <div className='mt-5'>
                <div className='flex items-center justify-between'>
                    <h2 className='text-s text-slate-400'>
                        ${totalSpend} Spent
                    </h2>
                    {/* Display remaining amount or 'No Budget Set' if budgetAmount is null */}
                    <h2 className='text-s text-slate-400'>
                        {remaining !== null ? `$${remaining.toFixed(2)} Remaining` : 'No Budget Set'}
                    </h2>
                </div>
                {budgetAmount !== null && (
                    <div className='w-full bg-slate-300 h-2 rounded-full'>
                        <div className='bg-violet-800 h-2 rounded-full'
                            style={{
                                width: `${calculateProgressPerc()}%`
                            }}
                        />
                    </div>
                )}

            </div>
        </Link >
    );
}

export default CategorytItem;