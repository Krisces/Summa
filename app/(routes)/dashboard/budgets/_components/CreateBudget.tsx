"use client"
import React, { useState } from 'react'
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Budgets } from '@/utils/schema'
import { useUser } from '@clerk/nextjs'
import { db } from '@/utils/dbConfig'
import { toast } from 'sonner'
  

function CreateBudget({refreshData}:any) {
    
    const [emojiIcon,setEmojiIcon]=useState('😃');
    const[openEmojiPicker,setOpenEmojiPicker]=useState(false);

    const [name, setName] = useState<string>('');
    const [amount, setAmount] = useState<string>('');

    const {user}=useUser();

    /**
     * User to Create New Budget
     */
    const onCreateBudget=async()=>{
        const result=await db.insert(Budgets)
        .values({
            name:name,
            amount:amount,
            createdBy:user?.primaryEmailAddress?.emailAddress as string,
            icon:emojiIcon
        }).returning({insertedId:Budgets.id})

        if(result)
        {
            refreshData()
            toast('New Budget Created!')
        }
    }

  return (
    <div>
        <Dialog>
        <DialogTrigger asChild>
            <div className='bg-slate-100 p-10 rounded-md items-center flex flex-col border-2 border-dashed cursor-pointer hover:shadow-md h-[170px]'>
                <h2 className='text-3xl'>+</h2>
                <h2>Create Budget</h2>
            </div>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Create New Budget</DialogTitle>
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
                    onClick={()=>onCreateBudget()}>
                        Create Budget
                    </Button>
                </DialogClose>
                </DialogFooter>
        </DialogContent>
        </Dialog>

    </div>
  )
}

export default CreateBudget