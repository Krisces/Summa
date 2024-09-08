"use client"
import React, { ReactNode, useEffect } from 'react';
import SideNav from './_components/SideNav';
import DashboardHeader from './_components/DashboardHeader';
import { db } from '@/utils/dbConfig';
import { Categories } from '@/utils/schema';
import { useUser } from '@clerk/nextjs';
import { eq } from 'drizzle-orm';
import { useRouter } from 'next/navigation';

interface DashboardLayoutProps {
  children: ReactNode;
}

function DashboardLayout({ children }: DashboardLayoutProps) {

  const {user}=useUser();
  const router=useRouter();
  
  useEffect(()=>{
    user && checkUserBudgets();
  },[user])
  
  const checkUserBudgets=async()=>{
    const result = await db.select()
      .from(Categories)
      .where(eq(Categories.createdBy, user?.primaryEmailAddress?.emailAddress as string))
      
    if (result.length == 0) {
      router.replace('/dashboard/categories')
    }
    console.log(result);
  }
  
  return (
    <div>
      <div className='fixed md:w-64 hidden md:block z-10'>
        <SideNav />
      </div>
      <div className='md:ml-64'>
        <DashboardHeader />
        {children}
      </div>
      <div>
      </div>
    </div>
  );
}

export default DashboardLayout;
