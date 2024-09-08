"use client"
import React, { useEffect, useState } from 'react'
import CreateCategory from './CreateCategory'
import { db } from '@/utils/dbConfig'
import { desc, eq, getTableColumns, sql } from 'drizzle-orm'
import { Categories, Expenses } from '@/utils/schema'
import { useUser } from '@clerk/nextjs'
import CategoryItem from './CategoryItem'

function CategoryList() {

  const [categoryList, setCategoryList] = useState<any[]>([]);
  const { user } = useUser();
  useEffect(() => {
    user && getCategoryList();
  }, [user])

  /**
   * Used to get category list
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
      .orderBy(desc(Categories.id))

      console.log(result); // Debugging output

    setCategoryList(result);
  }

  return (
    <div className='mt-7'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
        <CreateCategory
          refreshData={() => getCategoryList()} />
        {categoryList?.length>0? categoryList.map((category, index) => (
          <CategoryItem category={category} key={index} />
        ))
        :[1,2,3,4,5].map((item,index)=>(
          <div key={index} className='w-full bg-slate-200 rounded-lg h-[170px] animate-pulse'>

          </div>
        ))
        }
      </div>
    </div>
  )
}

export default CategoryList