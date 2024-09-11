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
import HistoryPeriodSelector from './_components/HistoryPeriodSelector';

function Page() {
  const { user } = useUser();
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [period, setPeriod] = useState<{ year: number; month: number }>({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  });
  const [timeframe, setTimeframe] = useState<'year' | 'month'>('month');
  const [years, setYears] = useState<number[]>(Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i));

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([getCategoryList(), getTotalIncome()]).finally(() => {
        setLoading(false);
      });
    }
  }, [user, dateRange]);

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
      .execute();

    setCategoryList(result);

    const totalExpenses = result.reduce((sum: number, item: any) => sum + (item.totalExpenses || 0), 0);
    setTotalExpenses(totalExpenses);
  };

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
      .execute();

    setTotalIncome(result[0]?.totalIncome ?? 0);
  };

  return (
    <div>
      <div className="p-10">
        <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="font-bold text-3xl">{`Hi, ${user?.username}`}</h2>
            <p className="text-gray-500">Here is what is happening with your money. Let us manage your expenses</p>
          </div>
          <div className="flex flex-col md:flex-row gap-4 md:gap-10 md:justify-end">
            <div className="flex flex-wrap gap-2 justify-end">
              <AddIncome refreshData={() => getTotalIncome()} />
              <AddExpenseDialog refreshData={() => getCategoryList()} />
            </div>
          </div>
        </div>
      </div>
      <div className="px-10 mb-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-2xl">Overview</h2>
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
      <div className="mx-10">
        <CardInfo totalIncome={totalIncome} totalExpenses={totalExpenses} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 mx-10 my-5 gap-5">
        <div className="md:col-span-2 p-7 border rounded-lg flex flex-col h-auto">
          {loading ? (
            <Skeleton className="w-full h-86" />
          ) : (
            <CategoryStats categoryList={categoryList} totalIncome={totalIncome} />
          )}
        </div>
        <div className="p-7 border rounded-lg flex items-center h-auto">
          <CategoryChart categoryList={categoryList} />
        </div>
      </div>
      <div className="mx-10 mt-8 mb-5">
        <h2 className="font-bold text-2xl">History</h2>
      </div>
      <div className="mx-10 mb-5">
        <HistoryPeriodSelector
          period={period}
          setPeriod={setPeriod}
          timeframe={timeframe}
          setTimeframe={setTimeframe}
          years={years}
        />
      </div>
    </div>
  );
}

export default Page;