"use client";
import { useUser } from '@clerk/nextjs';
import React, { useEffect, useState } from 'react';
import AddIncome from './_components/AddIncome';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { differenceInDays, startOfMonth } from 'date-fns';
import { MAX_DATE_RANGE_DAYS } from '@/lib/constants';
import { toast } from 'sonner';
import AddExpenseDialog from './_components/AddExpenseDialog';
import CardInfo from './_components/CardInfo';
import { Skeleton } from "@/components/ui/skeleton";
import { db } from '@/utils/dbConfig';
import { Categories, Expenses, Income } from '@/utils/schema';
import { desc, eq, getTableColumns, sql } from 'drizzle-orm';
import moment from 'moment';
import CategoryStats from './_components/CategoryStats';
import CategoryChart from './_components/CategoryChart';

function Page() {
  const { user } = useUser();
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });
  const [loading, setLoading] = useState<boolean>(true); // Add loading state

  useEffect(() => {
    if (user) {
      setLoading(true); // Set loading to true before fetching data
      Promise.all([getCategoryList(), getTotalIncome()]).finally(() => {
        setLoading(false); // Set loading to false after data is fetched
      });
    }
  }, [user, dateRange]);

  // Fetch category list with total expenses in the selected date range
  const getCategoryList = async () => {
    const result = await db.select({
      ...getTableColumns(Categories),
      totalExpenses: sql`COALESCE(SUM(${Expenses.amount}), 0)`.mapWith(Number),
      totalItem: sql`COALESCE(COUNT(${Expenses.id}), 0)`.mapWith(Number)
    })
      .from(Categories)
      .leftJoin(
        Expenses,
        eq(Categories.id, Expenses.categoryId)
      )
      .where(
        sql`${Categories.createdBy} = ${user?.primaryEmailAddress?.emailAddress as string}
            AND (${Expenses.createdAt} >= ${moment(dateRange.from).format('MM-DD-YYYY')}
            AND ${Expenses.createdAt} <= ${moment(dateRange.to).format('MM-DD-YYYY')} 
            OR ${Expenses.createdAt} IS NULL)` 
      )
      .groupBy(Categories.id)
      .orderBy(desc(Categories.id))
      .execute(); // Execute query

    setCategoryList(result);

    const totalExpenses = result.reduce((sum: number, item: any) => sum + (item.totalExpenses || 0), 0);
    setTotalExpenses(totalExpenses);
  };

  // Fetch total income in the selected date range
  const getTotalIncome = async () => {
    const result = await db.select({
      totalIncome: sql`COALESCE(SUM(${Income.amount}), 0)`.mapWith(Number)
    })
      .from(Income)
      .where(
        sql`${Income.createdBy} = ${user?.primaryEmailAddress?.emailAddress as string}
            AND ${Income.transactionDate} >= ${moment(dateRange.from).format('MM-DD-YYYY')}
            AND ${Income.transactionDate} <= ${moment(dateRange.to).format('MM-DD-YYYY')}`
      )
      .execute(); // Execute query

    setTotalIncome(result[0]?.totalIncome ?? 0);
  };

  return (
    <div>
      <div className='p-10'>
        <div className='flex flex-col md:flex-row items-start md:items-center md:justify-between'>
          <div className='mb-4 md:mb-0'>
            <h2 className='font-bold text-3xl'>{`Hi, ${user?.username}`}</h2>
            <p className='text-gray-500'>Here is what is happening with your money. Let us manage your expenses</p>
          </div>
          <div className='flex flex-col md:flex-row gap-4 md:gap-10 md:justify-end'>
            <div className='flex flex-wrap gap-2'>
              <div className='flex gap-2 md:ml-5'>
                <AddIncome refreshData={() => getTotalIncome()} />
                <AddExpenseDialog refreshData={() => getCategoryList()} />
              </div>
              <div className='w-full md:w-auto mt-4 md:mt-0'>
                <DateRangePicker
                  initialDateFrom={dateRange.from}
                  initialDateTo={dateRange.to}
                  showCompare={false}
                  onUpdate={values => {
                    const { from, to } = values.range;

                    if (!from || !to) return;
                    if (differenceInDays(to, from) > MAX_DATE_RANGE_DAYS) {
                      toast.error(
                        `The selected date range is too big. Max allowed date range is ${MAX_DATE_RANGE_DAYS} days.`
                      );
                      return;
                    }

                    setDateRange({ from, to });
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='px-10'>
        <CardInfo totalIncome={totalIncome} totalExpenses={totalExpenses} />
      </div>
      <div className='grid grid-cols-1 md:grid-cols-3 mx-10 my-5 gap-5'>
        <div className='md:col-span-2 p-7 border rounded-lg flex flex-col h-auto'>
          {loading ? ( // Show skeleton when loading
            <Skeleton className='w-full h-86' />
          ) : (
            <CategoryStats categoryList={categoryList} totalIncome={totalIncome} />
          )}
        </div>
        <div className='p-7 border rounded-lg flex items-center h-auto'>
          <CategoryChart categoryList={categoryList} />
        </div>
      </div>
    </div>
  );
}

export default Page;
