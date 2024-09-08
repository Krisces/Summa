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
import { Categories } from '@/utils/schema'
import { useUser } from '@clerk/nextjs'
import { db } from '@/utils/dbConfig'
import { toast } from 'sonner'
  

function CreateCategory({refreshData}:any) {
    
    const [emojiIcon,setEmojiIcon]=useState('😃');
    const[openEmojiPicker,setOpenEmojiPicker]=useState(false);

    const [name, setName] = useState<string>('');
    const [budgetAmount, setAmount] = useState<string | null>(null);

    const {user}=useUser();

    /**
     * User to Create New Category
     */
    const onCreateCategory=async()=>{
        const result=await db.insert(Categories)
        .values({
            name:name,
            createdBy:user?.primaryEmailAddress?.emailAddress as string,
            icon:emojiIcon,
            budgetAmount: budgetAmount,
        }).returning({insertedId:Categories.id})

        if(result)
        {
            refreshData()
            toast('New Category Created!')
        }
    }

  return (
    <div>
        <Dialog>
        <DialogTrigger asChild>
            <div className='bg-slate-100 p-10 rounded-md items-center flex flex-col border-2 border-dashed cursor-pointer hover:shadow-md h-[170px]'>
                <h2 className='text-3xl'>+</h2>
                <h2>Create Categories</h2>
            </div>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
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
                            Category Name
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
                    <Button disabled={!(name)} className='mt-6 w-full'
                    onClick={()=>onCreateCategory()}>
                        Create Category
                    </Button>
                </DialogClose>
                </DialogFooter>
        </DialogContent>
        </Dialog>

    </div>
  )
}

export default CreateCategory