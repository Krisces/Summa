"use client"
import { db } from '@/utils/dbConfig'
import { Categories } from '@/utils/schema'
import { Expenses } from '@/utils/schema'
import { useUser } from '@clerk/nextjs'
import { desc, eq, getTableColumns, sql } from 'drizzle-orm'
import React, { useEffect, useState } from 'react'
import AddExpense from '../_components/AddExpenseWindow'
import ExpenseListTable from '../_components/ExpenseListTable'
import { Button } from '@/components/ui/button'
import { ArrowLeft, PenBox, Trash } from 'lucide-react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import EditCategory from '../_components/EditCategory'
import CategorytItem from '../../categories/_components/CategoryItem'


function ExpensesScreen({ params }: any) {

    const { user } = useUser();
    const [categoryInfo, setCategoryInfo] = useState<any>(null);
    const [expensesList, setExpensesList] = useState<any[]>([]);
    const route = useRouter();

    useEffect(() => {
        user && getCategoryInfo();
    }, [user]);

    /**
     * Get Category Information
     */
    const getCategoryInfo = async () => {
        const result = await db
            .select({
                ...getTableColumns(Categories),
                totalSpend: sql`sum(${Expenses.amount})`.mapWith(Number),
                totalItem: sql`count(${Expenses.id})`.mapWith(Number),
            })
            .from(Categories)
            .leftJoin(Expenses, eq(Categories.id, Expenses.categoryId))
            .where(
                sql`${Categories.createdBy} = ${user?.primaryEmailAddress?.emailAddress as string} AND ${Categories.id} = ${params.id}`
            )
            .groupBy(Categories.id);

        setCategoryInfo(result['0']);
        getExpensesList();
    };

    /**
     * Get Latest Expenses
     */
    const getExpensesList = async () => {
        const result = await db
            .select()
            .from(Expenses)
            .where(eq(Expenses.categoryId, params.id))
            .orderBy(desc(Expenses.id));

        setExpensesList(result);
    };

    /**
     * Use to Delete Category
     */
    const deleteCategory = async () => {

        const deleteExpenseResult = await db.delete(Expenses)
            .where(eq(Expenses.categoryId, params.id))
            .returning()

        if (deleteExpenseResult) {
            const result = await db.delete(Categories)
                .where(eq(Categories.id, params.id))
                .returning();
        }
        toast('Category Deleted!');
        route.replace('/dashboard/categories')
    }

    return (
        <div className='p-10'>
            <h2 className='text-3xl font-bold flex justify-between items-center'>
                <span className='flex gap-2 items-center'>
                    <ArrowLeft onClick={() => route.back()} className='cursor-pointer' />
                    My Expenses
                </span>
                <div className='flex gap-2 items-center'>
                <EditCategory categoryInfo={categoryInfo} refreshData={()=>getCategoryInfo()}/>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button className='flex gap-2' variant="destructive"> <Trash /> Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your current budget along with expenses
                                and remove your data from our servers.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteCategory()}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                </div>
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 mt-6 gap-5'>
                {categoryInfo ? (
                    <CategorytItem category={categoryInfo} />
                ) : (
                    <div className='h-[150px] w-full bg-slate-200 rounded-lg animate-pulse'>
                    </div>
                )}
                <AddExpense categoryId={params.id}
                    user={user}
                    refreshData={() => getCategoryInfo()}
                />
            </div>
            <div className='mt-4'>
                <h2 className='font-bold text-lg'>Latest Expenses</h2>
                <ExpenseListTable expensesList={expensesList}
                    refreshData={() => getCategoryInfo()} />
            </div>
        </div>
    );
}

export default ExpensesScreen;