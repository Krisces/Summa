import { HandCoins, Landmark, ReceiptText } from 'lucide-react';
import React from 'react';

function CardInfo({ totalIncome, totalExpenses }: any) { // Receive totalIncome and totalExpenses as props
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
      <div className='p-7 border rounded-lg flex items-center justify-between'>
        <div>
          <h2 className='text-sm'>Total Income</h2>
          <h2 className='font-bold text-2xl'>${totalIncome.toFixed(2)}</h2> {/* Display totalIncome */}
        </div>
        <Landmark className='bg-primary p-3 h-12 w-12 rounded-full text-white'/>
      </div>
      <div className='p-7 border rounded-lg flex items-center justify-between'>
        <div>
          <h2 className='text-sm'>Total Expenses</h2>
          <h2 className='font-bold text-2xl'>${totalExpenses.toFixed(2)}</h2> {/* Display totalExpenses */}
        </div>
        <ReceiptText className='bg-primary p-3 h-12 w-12 rounded-full text-white'/>
      </div>
      <div className='p-7 border rounded-lg flex items-center justify-between'>
        <div>
          <h2 className='text-sm'>Net Balance</h2>
          <h2 className='font-bold text-2xl'>${(totalIncome - totalExpenses).toFixed(2)}</h2> {/* Calculate net balance */}
        </div>
        <HandCoins className='bg-primary p-3 h-12 w-12 rounded-full text-white'/>
      </div>
    </div>
  );
}

export default CardInfo;
