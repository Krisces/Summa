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
import { Badge } from '@/components/ui/badge';

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
  const [months, setMonths] = useState<number[]>([]); // For month numbers
  const [years, setYears] = useState<number[]>([]); // For year numbers
  const [period, setPeriod] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() + 1 });
  const [timeframe, setTimeframe] = useState<'year' | 'month'>('year');

  // Existing useEffect to fetch categories and income
  useEffect(() => {
    if (user) {
      setLoading(true); // Set loading state to true while fetching data
      Promise.all([getCategoryList(), getTotalIncome()]) // Fetch both category list and total income concurrently
        .finally(() => {
          setLoading(false); // Set loading state to false after fetching is complete
        });
    }
  }, [user, dateRange]);

  const getCategoryList = async () => {
    try {
        const formattedFromDate = moment(dateRange.from).format('MM-DD-YYYY'); // Format from date
        const formattedToDate = moment(dateRange.to).format('MM-DD-YYYY'); // Format to date

        const result = await db.select({
            ...getTableColumns(Categories), // Fetch columns from Categories table
            totalExpenses: sql`COALESCE(SUM(${Expenses.amount}), 0)`.mapWith(Number), // Calculate total expenses per category
            totalItem: sql`COALESCE(COUNT(${Expenses.id}), 0)`.mapWith(Number) // Count total items per category
        })
        .from(Categories)
        .leftJoin(
            Expenses,
            eq(Categories.id, Expenses.categoryId) // Join Categories with Expenses
        )
        .where(
            sql`${Categories.createdBy} = ${user?.primaryEmailAddress?.emailAddress as string}
            AND (${Expenses.createdAt} >= ${formattedFromDate}
            AND ${Expenses.createdAt} <= ${formattedToDate}
            OR ${Expenses.createdAt} IS NULL)` // Check for NULL and date range
        )
        .groupBy(Categories.id) // Group by category ID
        .orderBy(desc(Categories.id)) // Order by category ID descending
        .execute();

        setCategoryList(result); // Update state with fetched category list

        // Calculate total expenses across all categories
        const totalExpenses = result.reduce((sum: number, item: any) => sum + (item.totalExpenses || 0), 0);
        setTotalExpenses(totalExpenses); // Update total expenses state
    } catch (error) {
        console.error("Error fetching category list:", error); // Log error for debugging
    }
};


  const getTotalIncome = async () => {
    try {
        const formattedFromDate = moment(dateRange.from).format('MM-DD-YYYY'); // Format from date
        const formattedToDate = moment(dateRange.to).format('MM-DD-YYYY'); // Format to date

        const result = await db.select({
            totalIncome: sql`COALESCE(SUM(${Income.amount}), 0)`.mapWith(Number) // Calculate total income
        })
        .from(Income)
        .where(
            sql`${Income.createdBy} = ${user?.primaryEmailAddress?.emailAddress as string}
            AND ${Income.transactionDate} >= ${formattedFromDate}
            AND ${Income.transactionDate} <= ${formattedToDate}` // Use formatted dates directly in the SQL
        )
        .execute();

        setTotalIncome(result[0]?.totalIncome ?? 0); // Update total income state
    } catch (error) {
        console.error("Error fetching total income:", error); // Log error for debugging
    }
};


  // Define the interface for the expected structure of periods
  interface Period {
    year: number;
    month: number;
  }

  const getAvailablePeriods = async () => {
    if (!user) return;

    try {
      // Fetch income periods
      const incomePeriods = await db
        .select({
          year: sql`SUBSTRING(${Income.transactionDate}, 7, 4)::INT`, // Extract year
          month: sql`SUBSTRING(${Income.transactionDate}, 1, 2)::INT`, // Extract month
        })
        .from(Income)
        .where(eq(Income.createdBy, user?.primaryEmailAddress?.emailAddress as string))
        .groupBy(
          sql`SUBSTRING(${Income.transactionDate}, 7, 4)`, // Group by year
          sql`SUBSTRING(${Income.transactionDate}, 1, 2)` // Group by month
        )
        .orderBy(
          sql`SUBSTRING(${Income.transactionDate}, 7, 4)::INT DESC`, // Order by extracted year
          sql`SUBSTRING(${Income.transactionDate}, 1, 2)::INT DESC` // Order by extracted month
        )
        .execute() as Period[]; // Assert type

      // Fetch expense periods
      const expensePeriods = await db
        .select({
          year: sql`SUBSTRING(${Expenses.createdAt}, 7, 4)::INT`, // Extract year
          month: sql`SUBSTRING(${Expenses.createdAt}, 1, 2)::INT`, // Extract month
        })
        .from(Expenses)
        .leftJoin(Categories, eq(Expenses.categoryId, Categories.id))
        .where(eq(Categories.createdBy, user?.primaryEmailAddress?.emailAddress as string))
        .groupBy(
          sql`SUBSTRING(${Expenses.createdAt}, 7, 4)`, // Group by year
          sql`SUBSTRING(${Expenses.createdAt}, 1, 2)` // Group by month
        )
        .orderBy(
          sql`SUBSTRING(${Expenses.createdAt}, 7, 4)::INT DESC`, // Order by extracted year
          sql`SUBSTRING(${Expenses.createdAt}, 1, 2)::INT DESC` // Order by extracted month
        )
        .execute() as Period[]; // Assert type

      // Combine and process all periods
      const allPeriods: Period[] = [...incomePeriods, ...expensePeriods];

      // Get unique years
      const uniqueYears = [...new Set(allPeriods.map(period => period.year))].sort((a, b) => b - a);
      setYears(uniqueYears); // Should now be number[]

      // Get available months for the most recent year
      const currentYear = Math.max(...uniqueYears);
      const availableMonths = [...new Set(allPeriods.filter(p => p.year === currentYear).map(p => p.month))].sort((a, b) => a - b);
      setMonths(availableMonths); // Ensure this is a number[] and matches your state definition

    } catch (error) {
      console.error("Error fetching available periods:", error);
    }
  };


  // useEffect to trigger fetching when user is defined
  useEffect(() => {
    if (user) {
      getAvailablePeriods();
    }
  }, [user]);

  const formatDate = (dateString: string) => {
    const dateParts = dateString.split('-'); // Split the MM-DD-YYYY string
    const month = dateParts[0]; // Month
    const day = dateParts[1]; // Day
    const year = dateParts[2]; // Year

    return `${month}-${day}-${year}`; // Format as 'MM-DD-YYYY'
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

      {/* Overview section with DateRangePicker */}
      <div className="px-10 mb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <h2 className="font-bold text-2xl">Overview</h2>
          <div className="mt-4 md:mt-0">
            <DateRangePicker
              initialDateFrom={dateRange.from} // Initial date range from state
              initialDateTo={dateRange.to} // Initial date range to state
              showCompare={false}
              onUpdate={values => {
                const { from, to } = values.range; // Destructure from and to dates
                if (!from || !to) return; // Validate dates
                if (differenceInDays(to, from) > MAX_DATE_RANGE_DAYS) {
                  // Show error if selected range exceeds limit
                  toast.error(`The selected date range is too big. Max allowed date range is ${MAX_DATE_RANGE_DAYS} days.`);
                  return;
                }
                setDateRange({ from, to }); // Update date range state
              }}
            />
          </div>
        </div>
      </div>

      <div className="mx-10">
        <CardInfo totalIncome={totalIncome} totalExpenses={totalExpenses} />
      </div>

      {/* Category Stats and Chart */}
      <div className="grid grid-cols-1 md:grid-cols-3 mx-10 my-5 gap-5">
        <div className="md:col-span-2 p-7 border rounded-lg flex flex-col h-auto">
          {loading ? (
            <Skeleton className="w-full h-86" /> // Show skeleton loading state
          ) : (
            <CategoryStats categoryList={categoryList} totalIncome={totalIncome} /> // Pass category list and income to CategoryStats
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
        <div className="p-4 border rounded-lg flex flex-col gap-4 md:flex-row md:items-center justify-between">
          <HistoryPeriodSelector
            period={period}
            setPeriod={setPeriod}
            timeframe={timeframe}
            setTimeframe={setTimeframe}
            years={years} // Pass years from state
            months={months} // Pass months from state
          />


          <div className="flex flex-col gap-2 md:flex-row md:gap-4">
            <Badge className="flex items-center gap-2 text-sm">
              <div className="h-4 w-4 rounded-full bg-emerald-500"></div>
              Income
            </Badge>
            <Badge className="flex items-center gap-2 text-sm">
              <div className="h-4 w-4 rounded-full bg-red-500"></div>
              Expenses
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;