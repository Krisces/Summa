"use client"

import * as React from "react"
import { useState } from 'react'
import { useUser } from '@clerk/nextjs';
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
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
  } from "@/components/ui/command"
  import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"
import { Input } from '@/components/ui/input'
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from '@/components/ui/button';
import { db } from '@/utils/dbConfig';
import { Categories, Expenses, Income } from '@/utils/schema';
import { DatePicker } from "@/components/ui/DatePicker"
import moment from 'moment';
import { cn } from "@/lib/utils"
import { toast } from "sonner"

function AddExpenseDialog({ refreshData }: any) {

    const [name, setName] = useState<string>('');
    const [amount, setAmount] = useState<string>('');
    const [categories, setCategories] = useState<{ value: string; label: string; icon: string }[]>([]);
    const [transactionDate, setTransactionDate] = useState<Date | undefined>(undefined);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [open, setOpen] = useState(false);
    const { user } = useUser();


    React.useEffect(() => {
        // Fetch categories from the database
        const fetchCategories = async () => {
            try {
                const result = await db.select().from(Categories);
                const categoryOptions = result.map((category) => ({
                    value: category.id.toString(),
                    label: category.name,
                    icon: category.icon || "",  // Ensure you have an icon URL or class here
                }));
                setCategories(categoryOptions);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };

        fetchCategories();
    }, []);

    const addNewExpense = async () => {
        if (user) {
            const categoryIdInt = parseInt(selectedCategory, 10);

            // Format the date as MM-DD-YYYY
            const formattedDate = transactionDate ? moment(transactionDate).format('MM-DD-YYYY') : '';

            const result = await db.insert(Expenses).values({
                name: name,
                amount: amount,
                categoryId: categoryIdInt,
                createdAt: formattedDate, // Use the formatted date
                createdBy: user?.primaryEmailAddress?.emailAddress as string,
            }).returning({ insertedId: Expenses.id });

            console.log(result);
            if (result) {
                refreshData();
                toast('New Expense Added!');
            }
        }
    };

    return (
        <div>
            <Dialog>
                <DialogTrigger asChild>
                    <div>
                        <Button>Add Expense</Button>
                    </div>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Expense</DialogTitle>
                        <DialogDescription>
                            <div className='mt-5'>
                                <div className='mt-3'>
                                    <h2 className='text-black font-medium my-1'>
                                        Expense Name
                                    </h2>
                                    <Input
                                        type="string"
                                        placeholder='Work'
                                        onChange={(e) => { setName(e.target.value) }}
                                    />
                                </div>
                                <div>
                                    <h2 className='text-black font-medium my-1'>
                                        Expense Category
                                    </h2>
                                    <Popover open={open} onOpenChange={setOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={open}
                                                className="w-[200px] justify-between"
                                            >
                                                {selectedCategory
                                                    ? categories.find((category) => category.value === selectedCategory)?.label
                                                    : "Select category..."}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[200px] p-0">
                                            <Command>
                                                <CommandInput placeholder="Search category..." />
                                                <CommandList>
                                                    <CommandEmpty>No category found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {categories.map((category) => (
                                                            <CommandItem
                                                                key={category.value}
                                                                value={category.value}
                                                                onSelect={(currentValue) => {
                                                                    setSelectedCategory(currentValue === selectedCategory ? "" : currentValue);
                                                                    setOpen(false);
                                                                }}
                                                            >
                                                                {category.icon}
                                                                {category.label}
                                                                <Check
                                                                    className={cn(
                                                                        "ml-auto h-4 w-4",
                                                                        selectedCategory === category.value ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
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
                                onClick={() => addNewExpense()}
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

export default AddExpenseDialog