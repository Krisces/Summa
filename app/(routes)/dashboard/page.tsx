"use client";
import React, { useEffect, useState } from 'react';
import Headline from './_components/Headline';
import CardInfo from './_components/CardInfo';
import { useUser } from '@clerk/nextjs';
import { db } from '@/utils/dbConfig';
import { Categories, Expenses, Income } from '@/utils/schema';
import { desc, eq, getTableColumns, sql } from 'drizzle-orm';

function Page() {
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [totalExpenses, setTotalExpenses] = useState<number>(0); // State for totalExpenses
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      getCategoryList();
      getTotalIncome();
    }
  }, [user]);

  /**
   * Fetch category list with total spending and total expenses
   */
  const getCategoryList = async () => {
    const result = await db.select({
      ...getTableColumns(Categories),
      totalExpenses: sql`coalesce(sum(${Expenses.amount}), 0)`.mapWith(Number), // Calculate total expenses based on categories
      totalItem: sql`coalesce(count(${Expenses.id}), 0)`.mapWith(Number)
    })
      .from(Categories)
      .leftJoin(Expenses, eq(Categories.id, Expenses.categoryId))
      .where(eq(Categories.createdBy, user?.primaryEmailAddress?.emailAddress as string))
      .groupBy(Categories.id)
      .orderBy(desc(Categories.id));

    setCategoryList(result);

    // Extract totalExpenses from result
    const totalExpenses = result.reduce((sum: number, item: any) => sum + (item.totalExpenses || 0), 0);
    setTotalExpenses(totalExpenses);
  };

  /**
   * Fetch total income for the current user
   */
  const getTotalIncome = async () => {
    const result = await db.select({
      totalIncome: sql`coalesce(sum(${Income.amount}), 0)`.mapWith(Number)
    })
      .from(Income)
      .where(eq(Income.createdBy, user?.primaryEmailAddress?.emailAddress as string));

    setTotalIncome(result[0]?.totalIncome ?? 0); // Ensure fallback value
  };

  return (
    <div>
      <div>
        <Headline />
      </div>
      <div className='px-10'>
        <CardInfo totalIncome={totalIncome} totalExpenses={totalExpenses} /> {/* Pass totalIncome and totalExpenses */}
      </div>
    </div>
  );
}

export default Page;
