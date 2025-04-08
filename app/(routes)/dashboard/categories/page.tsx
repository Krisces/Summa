"use client"; // Fix the typo here
import React, { useEffect } from 'react';
import CategoryList from './_components/CategoryList';
import { useDateRange } from '@/context/DateRangeContext';
import { useUser } from '@clerk/nextjs';

function Categories() {
  const { dateRange } = useDateRange();
  const { user } = useUser();

  // Fetch categories when user or dateRange changes
  useEffect(() => {
    if (user) {
      getCategoryList(dateRange);
    }
  }, [user, dateRange]); // Add dateRange as a dependency

  // Fetch categories on component mount
  useEffect(() => {
    if (user) {
      getCategoryList(dateRange);
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  const getCategoryList = async (dateRange: { from: Date; to: Date }) => {
    // Add your data fetching logic here
    console.log("Fetching categories for date range:", dateRange);
  };

  return (
    <div className='p-10'>
      <title>Summa Categories</title>
      <h2 className='font-bold text-3xl'>
        My Categories
      </h2>
      <CategoryList />
    </div>
  );
}

export default Categories;