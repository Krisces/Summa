"use client";
import React, { useEffect, useState } from 'react';
import CreateCategory from './CreateCategory';
import { db } from '@/utils/dbConfig';
import { desc, eq, getTableColumns, sql } from 'drizzle-orm';
import { Categories, Expenses } from '@/utils/schema';
import { useUser } from '@clerk/nextjs';
import CategoryItem from './CategoryItem';
import { useDateRange } from '@/context/DateRangeContext'; // Import the hook
import moment from 'moment';

function CategoryList() {
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const { user } = useUser();
  const { dateRange } = useDateRange(); // Get the date range from the context

  // Fetch categories on mount and when dateRange changes
  useEffect(() => {
    if (user) {
      getCategoryList(dateRange);
    }
  }, [user, dateRange]); // Add dateRange as a dependency

  // Fetch categories on component mount
  useEffect(() => {
    if (user) {
      getCategoryList(dateRange);
    }
  }, []); /// Empty dependency array ensures this runs only once on mount

  /**
   * Used to get category list
   */
  const getCategoryList = async (dateRange: { from: Date; to: Date }) => {
    // Format dates as MM-DD-YYYY
    const formattedFromDate = moment(dateRange.from).format('MM-DD-YYYY'); // Format from date
    const formattedToDate = moment(dateRange.to).format('MM-DD-YYYY'); // Format to date

    console.log("Fetching categories for date range:", formattedFromDate, "to", formattedToDate); // Debugging

    // Fetch all categories
    const categories = await db.select({
      ...getTableColumns(Categories),
    })
      .from(Categories)
      .where(eq(Categories.createdBy, user?.primaryEmailAddress?.emailAddress as string))
      .orderBy(desc(Categories.id));

    // Fetch expenses for each category and calculate totalSpend and totalItem
    const categoriesWithExpenses = await Promise.all(
      categories.map(async (category) => {
        const expenses = await db.select({
          amount: Expenses.amount,
        })
          .from(Expenses)
          .where(
            sql`${Expenses.categoryId} = ${category.id}
              AND ${Expenses.createdAt} >= ${formattedFromDate}
              AND ${Expenses.createdAt} <= ${formattedToDate}`
          )
          .execute();

          const totalSpend = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
        const totalItem = expenses.length;

        return {
          ...category,
          totalSpend,
          totalItem,
        };
      })
    );

    console.log("Fetched categories with expenses:", categoriesWithExpenses); // Debugging

    setCategoryList(categoriesWithExpenses);
  };

  return (
    <div className='mt-7'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
        <CreateCategory refreshData={() => getCategoryList(dateRange)} />
        {categoryList?.length > 0 ? categoryList.map((category, index) => (
          <CategoryItem category={category} key={index} />
        ))
          : [1, 2, 3, 4, 5].map((item, index) => (
            <div key={index} className='w-full bg-slate-200 rounded-lg h-[170px] animate-pulse'></div>
          ))
        }
      </div>
    </div>
  );
}

export default CategoryList;