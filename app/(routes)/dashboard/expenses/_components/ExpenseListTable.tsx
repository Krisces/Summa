import { db } from '@/utils/dbConfig';
import { Expenses } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import { Trash } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

interface Expense {
    id: number;
    name: string;
    amount: number;
    createdAt: string; // Adjust type if it's a Date object
}

interface ExpenseListTableProps {
    expensesList: Expense[];
    refreshData: () => void;
}

function ExpenseListTable({ expensesList, refreshData }: ExpenseListTableProps) {
    const deleteExpense = async (expense: Expense) => {
        try {
            const result = await db.delete(Expenses)
                .where(eq(Expenses.id, expense.id))
                .returning();

            if (result) {
                toast('Expense Deleted');
                refreshData();
            }
        } catch (error) {
            toast.error('Failed to delete expense'); // Handle the error
        }
    };

    return (
        <div className='mt-3'>
            <div className='grid grid-cols-4 bg-slate-200 p-2'>
                <h2>Name</h2>
                <h2>Amount</h2>
                <h2>Date</h2>
                <h2>Action</h2>
            </div>
            {expensesList.map((expense) => (
                <div className='grid grid-cols-4 bg-slate-50 p-2' key={expense.id}>
                    <h2>{expense.name}</h2>
                    <h2>{expense.amount}</h2>
                    <h2>{expense.createdAt}</h2>
                    <h2>
                        <Trash
                            className='text-red-600 cursor-pointer'
                            onClick={() => deleteExpense(expense)}
                        />
                    </h2>
                </div>
            ))}
        </div>
    );
}

export default ExpenseListTable;
