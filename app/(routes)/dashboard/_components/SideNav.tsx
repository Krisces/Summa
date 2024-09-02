"use client"
import { UserButton } from '@clerk/nextjs'
import { Layout, LayoutGrid, PiggyBank, ReceiptText } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect } from 'react'

function SideNav() {
    const menuList=[
        {
            id:1,
            name:'Dashboard',
            icon: LayoutGrid,
            path:'/dashboard'
        },
        {
            id:2,
            name:'Budgets',
            icon:PiggyBank,
            path:'/dashboard/budgets'
        },
        {
            id:3,
            name:'Expenses',
            icon: ReceiptText,
            path:'/dashboard/expenses'
        }
    ]
    const path=usePathname();

    useEffect(()=>{
        console.log(path)
    },[path])
  return (
    <div className='h-screen p-5 border shadow-sm'>
        <div className='mt-2 mb-5'>
        <Image src={'/logo.svg'}
        alt='logo'
        width={160}
        height={100}
        />
        </div>
        <div>
            {menuList.map((menu,index)=>(
                <Link href={menu.path}>
                <h2 className={`flex gap-2 items-center text-gray-500 font-medium mb-2 p-6 cursor-pointer rounded-md hover:text-primary hover:bg-violet-100 ${path==menu.path&&'text-primary bg-violet-100'}`}>
                    <menu.icon/>
                    {menu.name}
                </h2>
                </Link>
            ))}
        </div>
        <div className='fixed bottom-5 p-5 flex gap-2 items-center'>
            <UserButton/>
            Profile
        </div>
    </div>
  )
}

export default SideNav