"use client"
import React, { useEffect, useState } from 'react'
import Headline from './_components/Headline'
import CardInfo from './_components/CardInfo'
import { useUser } from '@clerk/nextjs';
import { db } from '@/utils/dbConfig';
import { Categories, Expenses } from '@/utils/schema';
import { desc, eq, getTableColumns, sql } from 'drizzle-orm';

function page() {

  const [categoryList, setCategoryList] = useState<any[]>([]);
  const { user } = useUser();
  useEffect(() => {
    user && getCategoryList();
  }, [user])

  /**
   * Used to get budget list
   */
  const getCategoryList = async () => {

    const result = await db.select({
      ...getTableColumns(Categories),
      totalSpend: sql`sum(${Expenses.amount})`.mapWith(Number),
      totalItem: sql`count(${Expenses.id})`.mapWith(Number)
    })
      .from(Categories)
      .leftJoin(Expenses, eq(Categories.id, Expenses.categoryId))
      .where(eq(Categories.createdBy, user?.primaryEmailAddress?.emailAddress as string))
      .groupBy(Categories.id)
      .orderBy(desc(Categories.id));

    setCategoryList(result);
  }

  return (
    <div>
      <div>
        <Headline />
      </div>
      <div className='px-10'>
        <CardInfo budgetList={categoryList} />
      </div>
    </div>
  )
}

export default page
