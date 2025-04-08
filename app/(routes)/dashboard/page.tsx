"use client";
import { useUser } from '@clerk/nextjs';
import React, { useEffect, useState } from 'react';
import {startOfMonth } from 'date-fns';
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
import { Bar, BarChart, Tooltip, XAxis, YAxis } from "recharts";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import Overview from './_components/Overview';
import AddExpenseDialog from './_components/AddExpenseDialog';
import AddIncome from './_components/AddIncome';
import ExpenseListTable from './expenses/_components/ExpenseListTable';
import { useDateRange } from '@/context/DateRangeContext';

function Page() {
  const { user } = useUser();
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [expensesList, setExpensesList] = useState<any[]>([]);
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const { dateRange, setGlobalDateRange } = useDateRange();
  const [loading, setLoading] = useState<boolean>(true);
  const [months, setMonths] = useState<number[]>([]);
  const [years, setYears] = useState<number[]>([]);
  
  // Main dashboard period controls (used by HistoryPeriodSelector)
  const [period, setPeriod] = useState({ 
    year: new Date().getFullYear(), 
    month: new Date().getMonth() + 1 
  });
  const [timeframe, setTimeframe] = useState<'year' | 'month'>('year');
  
  // Bar chart period controls - now properly synchronized
  const [barChartPeriod, setBarChartPeriod] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  });
  const [barChartTimeframe, setBarChartTimeframe] = useState<'year' | 'month'>('year');
  
  const [barChartData, setBarChartData] = useState<any[]>([]);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Synchronize bar chart period with main period
  useEffect(() => {
    setBarChartPeriod(period);
    setBarChartTimeframe(timeframe);
  }, [period, timeframe]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([getCategoryList(), getTotalIncome(), getAvailablePeriods(), getBarChartData()])
        .finally(() => setLoading(false));
    }
  }, [user, dateRange]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([getCategoryList(), getTotalIncome(), getAvailablePeriods(), getBarChartData()])
        .finally(() => setLoading(false));
    }
  }, []);

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
      getAllExpenses();

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
          year: sql`SUBSTRING(${Income.transactionDate}, 7, 4)::INT`,
          month: sql`SUBSTRING(${Income.transactionDate}, 1, 2)::INT`,
        })
        .from(Income)
        .where(eq(Income.createdBy, user?.primaryEmailAddress?.emailAddress as string))
        .groupBy(
          sql`SUBSTRING(${Income.transactionDate}, 7, 4)`,
          sql`SUBSTRING(${Income.transactionDate}, 1, 2)`
        )
        .orderBy(
          sql`SUBSTRING(${Income.transactionDate}, 7, 4)::INT DESC`,
          sql`SUBSTRING(${Income.transactionDate}, 1, 2)::INT DESC`
        )
        .execute() as Period[];

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
        // Set initial period to most recent available data
      if (allPeriods.length > 0) {
        const mostRecent = allPeriods[0];
        setPeriod({
          year: mostRecent.year,
          month: mostRecent.month
        });
        setBarChartPeriod({
          year: mostRecent.year,
          month: mostRecent.month
        });
      }
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

  useEffect(() => {
    getBarChartData();
  }, [barChartPeriod, barChartTimeframe]); // Now depends on bar chart's own period state

  const getBarChartData = async () => {
    if (!user) return;

    try {
      if (timeframe === 'month') {
        const { year, month } = period;
        console.log('Fetching bar chart data for:', year, month);

        const daysInMonth = new Date(year, month, 0).getDate();
        const dailyData = Array.from({ length: daysInMonth }, (_, index) => ({
          day: index + 1,
          Income: 0,
          Expenses: 0,
        }));

        // Fetch income data for the selected month
        const incomeData = await db
          .select({
            day: sql<number>`EXTRACT(DAY FROM TO_DATE(${Income.transactionDate}, 'MM-DD-YYYY')) AS day`,
            total: sql<number>`COALESCE(SUM(${Income.amount}), 0) AS total`,
          })
          .from(Income)
          .where(
            sql`${Income.createdBy} = ${user?.primaryEmailAddress?.emailAddress as string}
              AND EXTRACT(MONTH FROM TO_DATE(${Income.transactionDate}, 'MM-DD-YYYY')) = ${month}
              AND EXTRACT(YEAR FROM TO_DATE(${Income.transactionDate}, 'MM-DD-YYYY')) = ${year}`
          )
          .groupBy(sql`day`)
          .execute();

        // Fetch expenses data for the month
        const expensesData = await db
          .select({
            day: sql<number>`EXTRACT(DAY FROM TO_DATE(${Expenses.createdAt}, 'MM-DD-YYYY')) AS day`,
            total: sql<number>`COALESCE(SUM(${Expenses.amount}), 0) AS total`,
          })
          .from(Expenses)
          .leftJoin(Categories, eq(Expenses.categoryId, Categories.id))
          .where(
            sql`${Categories.createdBy} = ${user?.primaryEmailAddress?.emailAddress as string}
              AND EXTRACT(MONTH FROM TO_DATE(${Expenses.createdAt}, 'MM-DD-YYYY')) = ${month}
              AND EXTRACT(YEAR FROM TO_DATE(${Expenses.createdAt}, 'MM-DD-YYYY')) = ${year}`
          )
          .groupBy(sql`day`)
          .execute();

        // Merge data
        incomeData.forEach((item: any) => {
          const dayIndex = item.day - 1;
          if (dayIndex >= 0 && dayIndex < dailyData.length) {
            dailyData[dayIndex].Income = Number(item.total);
          }
        });

        expensesData.forEach((item: any) => {
          const dayIndex = item.day - 1;
          if (dayIndex >= 0 && dayIndex < dailyData.length) {
            dailyData[dayIndex].Expenses = Number(item.total);
          }
        });
        
        console.log('Monthly data result:', dailyData);
        setBarChartData(dailyData);
      } else {
        // Fetch yearly data
        const incomeData = await db
          .select({
            month: sql<number>`EXTRACT(MONTH FROM TO_DATE(${Income.transactionDate}, 'MM-DD-YYYY')) AS month`,
            year: sql<number>`EXTRACT(YEAR FROM TO_DATE(${Income.transactionDate}, 'MM-DD-YYYY')) AS year`,
            totalIncome: sql<number>`COALESCE(SUM(${Income.amount}), 0)::NUMERIC AS totalIncome`,
          })
          .from(Income)
          .where(eq(Income.createdBy, user?.primaryEmailAddress?.emailAddress as string))
          .groupBy(sql`year`, sql`month`)
          .execute();

        const expensesData = await db
          .select({
            month: sql<number>`EXTRACT(MONTH FROM TO_DATE(${Expenses.createdAt}, 'MM-DD-YYYY')) AS month`,
            year: sql<number>`EXTRACT(YEAR FROM TO_DATE(${Expenses.createdAt}, 'MM-DD-YYYY')) AS year`,
            totalExpenses: sql<number>`COALESCE(SUM(${Expenses.amount}), 0)::NUMERIC AS totalExpenses`,
          })
          .from(Expenses)
          .leftJoin(Categories, eq(Expenses.categoryId, Categories.id))
          .where(eq(Categories.createdBy, user?.primaryEmailAddress?.emailAddress as string))
          .groupBy(sql`year`, sql`month`)
          .execute();

        const allMonthsData = monthNames.map((month, index) => ({
          name: month,
          Income: 0,
          Expenses: 0,
        }));

        incomeData.forEach((item: any) => {
          const monthIndex = item.month - 1;
          if (monthIndex >= 0 && monthIndex < allMonthsData.length) {
            allMonthsData[monthIndex].Income = Number(item.totalIncome);
          }
        });

        expensesData.forEach((item: any) => {
          const monthIndex = item.month - 1;
          if (monthIndex >= 0 && monthIndex < allMonthsData.length) {
            allMonthsData[monthIndex].Expenses = Number(item.totalExpenses);
          }
        });

        setBarChartData(allMonthsData);
      }
    } catch (error) {
      console.error("Error fetching bar chart data:", error);
    }
  };


  useEffect(() => {
    getBarChartData(); // Call the function to fetch bar chart data whenever period or timeframe changes
  }, [period, timeframe]); // Dependency array includes period and timeframe

  const getAllExpenses = async () => {
    try {
      const result = await db
        .select({
          id: Expenses.id,
          name: Expenses.name,
          amount: Expenses.amount,
          createdAt: Expenses.createdAt,
          createdBy: Expenses.createdBy,
          categoryName: Categories.name, // Include category name if needed
        })
        .from(Expenses) // Start from Expenses to ensure all expenses are fetched
        .leftJoin(Categories, eq(Categories.id, Expenses.categoryId)) // Use leftJoin if you want all expenses
        .where(eq(Expenses.createdBy, user?.primaryEmailAddress?.emailAddress as string)) // Ensure the user is the one who created the expenses
        .orderBy(desc(Expenses.id)); // Order expenses by ID in descending order
        
        setExpensesList(result);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  const chartConfig = {
    income: {

      label: "Income",
      color: "#34d399", // Use your CSS variable
    },
    expenses: {
      label: "Expenses",
      color: "#fb923c", // Use your CSS variable
    },
  } satisfies ChartConfig;

  return (
    <div>
        <title>Summa Dashboard</title>
      <div className="p-10">
        <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="font-bold text-3xl">{`Hi, ${user?.username}`}</h2>
            <p className="text-gray-500">Here is what is happening with your money. Let us manage your expenses</p>
          </div>
          <div className="flex flex-col md:flex-row gap-4 md:gap-10 md:justify-end">
            <div className="flex flex-wrap gap-2 justify-end">
              <AddIncome refreshData={() => {
                getTotalIncome();
                getBarChartData(); // Call getBarChartData after adding income
              }} />
              <AddExpenseDialog refreshData={() => {
                getCategoryList();
                getBarChartData(); // Call getBarChartData after adding expense
              }} />
            </div>
          </div>
        </div>
      </div>
      <Overview dateRange={dateRange} setDateRange={setGlobalDateRange} />
      <CardInfo totalIncome={totalIncome} totalExpenses={totalExpenses} />
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
        <div className="p-4 border rounded-lg flex flex-col gap-4">
          {/* HistoryPeriodSelector and badges */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <HistoryPeriodSelector
              period={period}
              setPeriod={setPeriod}
              timeframe={timeframe}
              setTimeframe={setTimeframe}
              years={years}
              months={months}
              refreshData={getBarChartData}
            />

            <div className="flex gap-2 md:gap-4">
              <Badge className="flex items-center gap-2 text-sm">
                <div className="h-4 w-4 rounded-full bg-orange-400"></div>
                Income
              </Badge>
              <Badge className="flex items-center gap-2 text-sm">
                <div className="h-4 w-4 rounded-full bg-emerald-400"></div>
                Expenses
              </Badge>
            </div>
          </div>

          <ChartContainer config={chartConfig} className='min-h-[300px] h-[300px] w-full'>
            <BarChart data={barChartData} height={300} width={600}>
              {timeframe === 'month' ? (
                <>
                  <XAxis
                    dataKey="day"
                    tickFormatter={(day) => `${day}`}
                    label={{ value: 'Day', position: 'insideBottomRight', offset: -5 }}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => {
                      return [`$${value}`, name === 'Income' ? 'Income' : 'Expenses'];
                    }}
                    labelFormatter={(day) => `Day ${day}`}
                  />
                  <Bar dataKey="Income" fill="#34d399" radius={4} />
                  <Bar dataKey="Expenses" fill="#fb923c" radius={4} />
                </>
              ) : (
                <>
                  <XAxis 
                    dataKey="name"
                    label={{ value: 'Month', position: 'insideBottomRight', offset: -5 }}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => {
                      return [`$${value}`, name === 'Income' ? 'Income' : 'Expenses'];
                    }}
                  />
                  <Bar dataKey="Income" fill="#34d399" radius={4} />
                  <Bar dataKey="Expenses" fill="#fb923c" radius={4} />
                </>
              )}
            </BarChart>
          </ChartContainer>
        </div>
      </div>
      <div className="mx-10 mt-8 mb-5">
        <h2 className="font-bold text-2xl">Latest Expenses</h2>
      </div>
      <div className="mx-10 mt-8 mb-16">
        <ExpenseListTable expensesList={expensesList} refreshData={() => getCategoryList} />
      </div>

    </div>
  );
}

export default Page;