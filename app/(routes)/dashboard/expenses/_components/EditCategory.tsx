"use client"
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
import { Categories } from '@/utils/schema'
import { db } from '@/utils/dbConfig'
import { eq } from 'drizzle-orm'
import { toast } from 'sonner'

function EditCategory({ categoryInfo, refreshData }: any) {

    const [emojiIcon, setEmojiIcon] = useState('');
    const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [name, setName] = useState<string>('');
    const [budgetAmount, setBudgetAmount] = useState<string>('');

    const { user } = useUser();

    useEffect(() => {
        if (categoryInfo) {
            setEmojiIcon(categoryInfo?.icon);
            setBudgetAmount(categoryInfo.budgetAmount || ''); // Ensure default is empty string if budgetAmount is null
            setName(categoryInfo.name);
        }
    }, [categoryInfo]);

    const onUpdateCategory = async () => {
        setLoading(true); // Start loading
        try {
            const result = await db.update(Categories).set({
                name,
                budgetAmount: budgetAmount === '' ? null : budgetAmount, // Set to null if empty
                icon: emojiIcon
            }).where(eq(Categories.id, categoryInfo.id))
            .returning();

            if (result) {
                refreshData();
                toast('Category Updated!');
            }
        } catch (error) {
            console.error('Error updating category:', error);
            toast.error('Failed to update category. Please try again.');
        } finally {
            setLoading(false); // End loading
        }
    }

    return (
        <div>
            <Dialog>
                <DialogTrigger asChild>
                    <Button className='flex gap-2'> <PenBox />Edit</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Category</DialogTitle>
                        <DialogDescription>
                            <div className='mt-5'>
                                <Button variant="outline"
                                    className="text-lg"
                                    onClick={() => setOpenEmojiPicker(!openEmojiPicker)}>
                                    {emojiIcon}
                                </Button>
                                <div className='absolute z-20'>
                                    <EmojiPicker
                                        open={openEmojiPicker}
                                        onEmojiClick={(e) => {
                                            setEmojiIcon(e.emoji);
                                            setOpenEmojiPicker(false);
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
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <div className='mt-3'>
                                    <h2 className='text-black font-medium my-1'>
                                        Budget Amount in $
                                    </h2>
                                    <Input
                                        type="number"
                                        placeholder='e.g. 600'
                                        value={budgetAmount}
                                        onChange={(e) => setBudgetAmount(e.target.value)}
                                    />
                                </div>

                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-start">
                        <DialogClose asChild>
                            <Button disabled={!name} className='mt-6 w-full'
                                onClick={() => onUpdateCategory()}>
                                Update Category
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default EditCategory
