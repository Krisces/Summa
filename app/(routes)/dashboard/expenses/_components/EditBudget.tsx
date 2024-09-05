"use clinet"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PenBox } from 'lucide-react'
import React, { useEffect, useState } from 'react'
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
import EmojiPicker from 'emoji-picker-react'
import { useUser } from '@clerk/nextjs'
import { Budgets } from '@/utils/schema'
import { db } from '@/utils/dbConfig'
import { eq } from 'drizzle-orm'
import { toast } from 'sonner'

function EditBudget({budgetInfo, refreshData}:any) {

    const [emojiIcon,setEmojiIcon]=useState('');
    const[openEmojiPicker,setOpenEmojiPicker]=useState(false);

    const [name, setName] = useState<string>('');
    const [amount, setAmount] = useState<string>('');

    const {user}=useUser();

    useEffect(()=>{
        if(budgetInfo)
        {
            setEmojiIcon(budgetInfo?.icon)
            setAmount(budgetInfo.amount)
            setName(budgetInfo.name)
        }
    },[budgetInfo])
    const onUpdateBudget=async()=>{
        const result = await db.update(Budgets).set({
            name:name,
            amount:amount,
            icon:emojiIcon
        }).where(eq(Budgets.id,budgetInfo.id))
        .returning();

        if(result)
        {
            refreshData()
            toast('Budget Updated!')
        }
    }

  return (
    <div>
        <Dialog>
        <DialogTrigger asChild>
            <Button className='flex gap-2'> <PenBox/>Edit</Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Update Budget</DialogTitle>
            <DialogDescription>
                <div className='mt-5'>
                    <Button variant="outline"
                    className="text-lg"
                    onClick={()=>setOpenEmojiPicker(!openEmojiPicker)}>
                        {emojiIcon}
                    </Button>
                    <div className='absolute z-20'>
                        <EmojiPicker
                        open={openEmojiPicker}
                        onEmojiClick={(e)=>{
                            setEmojiIcon(e.emoji)
                            setOpenEmojiPicker(false)
                        }}
                        />
                    </div>
                    <div className='mt-3'>
                        <h2 className='text-black font-medium my-1'>
                            Budget Name
                        </h2>
                        <Input 
                        type="string"
                        placeholder='e.g. Groceries'
                        defaultValue={budgetInfo?.name}
                        onChange={(e)=>{setName(e.target.value)}}
                        />
                    </div>
                    <div className='mt-3'>
                        <h2 className='text-black font-medium my-1'>
                            Budget Amount in $
                        </h2>
                        <Input 
                        type="number"
                        placeholder='e.g. 600'
                        defaultValue={budgetInfo?.amount}
                        onChange={(e)=>{setAmount(e.target.value)
                        }}
                        />
                    </div>

                </div>
            </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-start">
                <DialogClose asChild>
                    <Button disabled={!(name&&amount)} className='mt-6 w-full'
                    onClick={()=>onUpdateBudget()}>
                        Update Budget
                    </Button>
                </DialogClose>
                </DialogFooter>
        </DialogContent>
        </Dialog>
    </div>
  )
}

export default EditBudget