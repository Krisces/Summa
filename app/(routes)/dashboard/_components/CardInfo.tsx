import { HandCoins, Landmark, PiggyBank, ReceiptText } from 'lucide-react'
import React, { useEffect } from 'react'

function CardInfo({budgetList}:any) {

    useEffect(()=>{
        calculateCardInfo();
    },[])

    const calculateCardInfo=()=>{
        console.log(budgetList)
    }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
        <div className='p-7 border rounded-lg flex items-center justify-between'>
            <div>
            <h2 className='text-sm'>Total Income</h2>
            <h2 className='font-bold text-2xl'>$1500</h2>
            </div>
            <Landmark className='bg-primary p-3 h-12 w-12 rounded-full text-white'/>
        </div>
        <div className='p-7 border rounded-lg flex items-center justify-between'>
            <div>
            <h2 className='text-sm'>Total Expenses</h2>
            <h2 className='font-bold text-2xl'>$1500</h2>
            </div>
            <ReceiptText className='bg-primary p-3 h-12 w-12 rounded-full text-white'/>
        </div>
        <div className='p-7 border rounded-lg flex items-center justify-between'>
            <div>
            <h2 className='text-sm'>Net balance</h2>
            <h2 className='font-bold text-2xl'>$1500</h2>
            </div>
            <HandCoins className='bg-primary p-3 h-12 w-12 rounded-full text-white'/>
        </div>
    </div>
  )
}

export default CardInfo