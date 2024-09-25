"use client";
import { UserButton } from '@clerk/nextjs';
import { ChartSpline, LayoutGrid, LibraryBig, ReceiptText } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect } from 'react';

interface MenuItem {
    id: number;
    name: string;
    icon: React.ElementType; // Using React element type for icons
    path: string;
}

function SideNav() {
    const menuList: MenuItem[] = [
        { id: 1, name: 'Dashboard', icon: LayoutGrid, path: '/dashboard' },
        { id: 2, name: 'Categories', icon: LibraryBig, path: '/dashboard/categories' },
        { id: 3, name: 'Expenses', icon: ReceiptText, path: '/dashboard/expenses' },
        { id: 4, name: 'Data Insights', icon: ChartSpline, path: '/dashboard/data-insights' }
    ];

    const path = usePathname();

    useEffect(() => {
        console.log(path);
    }, [path]);

    return (
        <div className='h-screen p-5 border shadow-sm'>
            <div className='mt-2 mb-5'>
                <Image src={'/logo.svg'} alt='logo' width={160} height={100} />
            </div>
            <div>
                {menuList.map((menu) => {
                    const isActive = path === menu.path;
                    return (
                        <Link href={menu.path} key={menu.id}>
                            <h2
                                className={`flex gap-2 items-center text-gray-500 font-medium mb-2 p-6 cursor-pointer rounded-md hover:text-primary hover:bg-violet-100 ${isActive ? 'text-primary bg-violet-100' : ''}`}
                            >
                                <menu.icon />
                                <span>{menu.name}</span>
                            </h2>
                        </Link>
                    );
                })}
            </div>
            <div className='fixed bottom-5 p-5 flex gap-2 items-center'>
                <UserButton />
                <span>Profile</span>
            </div>
        </div>
    );
}

export default SideNav;
