"use client"

import * as React from "react"
import { useState } from 'react'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input'
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { db } from '@/utils/dbConfig';
import { Income } from '@/utils/schema';
import { DatePicker } from "@/components/ui/DatePicker"
import moment from 'moment';
import { toast } from "sonner"

function AddIncome({refreshData}:any) {

    const [name, setName] = useState<string>('');
    const [amount, setAmount] = useState<string>('');
    const [transactionDate, setTransactionDate] = useState<Date | undefined>(undefined);
    const { user } = useUser();

    /**
     * User to Create New Income
     */
    const onAddIncome = async () => {
        if (user) {
            // Format the date as MM-DD-YYYY
            const formattedDate = transactionDate ? moment(transactionDate).format('MM-DD-YYYY') : '';

            const result = await db.insert(Income).values({
                name: name,
                amount: amount,
                transactionDate: formattedDate, 
                createdBy:user?.primaryEmailAddress?.emailAddress as string,
            }).returning({ insertedId: Income.id });

            console.log("Income added with ID:", result);
            if (result) {
                refreshData();
                toast('New Income Added!');
              }
        }
    };

    return (
        <div>
            <Dialog>
                <DialogTrigger asChild>
                    <div>
                        <Button>Add Income</Button>
                    </div>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Income</DialogTitle>
                        <DialogDescription>
                            <div className='mt-5'>
                                <div className='mt-3'>
                                    <h2 className='text-black font-medium my-1'>
                                        Income Name
                                    </h2>
                                    <Input
                                        type="string"
                                        placeholder='Work'
                                        onChange={(e) => { setName(e.target.value) }}
                                    />
                                </div>
                                <div className='mt-3'>
                                    <h2 className='text-black font-medium my-1'>
                                        Income Amount in $
                                    </h2>
                                    <Input
                                        type="number"
                                        placeholder='e.g. 600'
                                        onChange={(e) => { setAmount(e.target.value) }}
                                    />
                                </div>
                                <div className='mt-3'>
                                    <h2 className='text-black font-medium my-1'>
                                        Transaction Date
                                    </h2>
                                    <DatePicker
                                        onDateChange={setTransactionDate}
                                    />
                                </div>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-start">
                        <DialogClose asChild>
                            <Button
                                disabled={!(name && amount && transactionDate)}
                                className='mt-6 w-full'
                                onClick={() => onAddIncome()}
                            >
                                Add Income
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AddIncome
