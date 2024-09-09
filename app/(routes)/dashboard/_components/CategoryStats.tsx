"use client";
import React from 'react';

interface CategoryStatsProps {
  categoryList: any[];
  totalIncome: number;
}

function CategoryStats({ categoryList, totalIncome }: CategoryStatsProps) {
  // Calculate progress percentage for each category
  const calculateProgressPerc = (totalSpend: number) => {
    if (totalIncome > 0) {
      const perc = (totalSpend / totalIncome) * 100;
      return perc.toFixed(2);
    }
    return '0.00'; // Default value when there is no income
  };

  return (
    <div className='w-full'>
      {categoryList.map((category) => {
        // Debugging: Log category data to ensure correct values
        console.log('Category:', category);
        
        const budgetAmount = category.budgetAmount !== null ? parseFloat(category.budgetAmount) : 0;
        const totalSpend = category.totalExpenses ?? 0;
        const progressPercentage = calculateProgressPerc(totalSpend);

        return (
          <div key={category.id} className='mb-4 w-full'>
            <div className='flex items-center justify-between mb-1'>
              <div className='flex items-center mt-2'>
                <h2 className='text-xs p-1 px-2 bg-slate-100 rounded-full'>
                  {category.icon}
                </h2>
                <div className='pl-2'>
                  <h4 className='text-sm font-medium'>{category.name}</h4>
                </div>
              </div>
              <h4 className='text-sm font-medium text-violet-800'>
                ${totalSpend}
              </h4>
            </div>
            <div className='w-full bg-slate-300 h-1 rounded-full mt-2'>
              <div className='bg-violet-800 h-full rounded-full'
                style={{
                  width: `${progressPercentage}%`
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default CategoryStats;
