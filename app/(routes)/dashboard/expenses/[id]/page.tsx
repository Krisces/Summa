"use client"
import { db } from '@/utils/dbConfig'
import { Budgets } from '@/utils/schema'
import { Expenses } from '@/utils/schema'
import { useUser } from '@clerk/nextjs'
import { eq, getTableColumns, sql } from 'drizzle-orm'
import React, { useEffect, useState } from 'react'
import BudgetItem from '../../budgets/_components/BudgetItem'
import AddExpense from '../_components/AddExpense'

function ExpensesScreen({ params }: { params: { id: number } }) {

    const { user } = useUser();
    const [budgetInfo, setBudgetInfo] = useState<any>(null);

    useEffect(() => {
        user && getBudgetInfo();
    }, [user]);

    const getBudgetInfo = async () => {
        const result = await db
            .select({
                ...getTableColumns(Budgets),
                totalSpend: sql`sum(${Expenses.amount})`.mapWith(Number),
                totalItem: sql`count(${Expenses.id})`.mapWith(Number),
            })
            .from(Budgets)
            .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
            .where(
                sql`${Budgets.createdBy} = ${user?.primaryEmailAddress?.emailAddress as string} AND ${Budgets.id} = ${params.id}`
            )
            .groupBy(Budgets.id);

        setBudgetInfo(result['0']);
    };

    return (
        <div className='p-10'>
            <h2 className='text-3xl font-bold'>My Expenses</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 mt-6 gap-5'>
                {budgetInfo ? (
                    <BudgetItem budget={budgetInfo} />
                ) : (
                    <div className='h-[150px] w-full bg-slate-200 rounded-lg animate-pulse'>
                    </div>
                )}
                <AddExpense/>
            </div>
        </div>
    );
}

export default ExpensesScreen;