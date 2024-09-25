import { Skeleton } from '@/components/ui/skeleton';
import React from 'react'
import CategoryStats from './CategoryStats';
import CategoryChart from './CategoryChart';

interface CategoryInfo {
    categoryList: any[]; // Adjust based on the shape of your category data
    totalIncome: number;
    loading: boolean;
  }
  
  const CategoryInfo = ({ categoryList, totalIncome, loading }: CategoryInfo) => (
    <div className="grid grid-cols-1 md:grid-cols-3 mx-10 my-5 gap-5">
      <div className="md:col-span-2 p-7 border rounded-lg flex flex-col h-auto">
        {loading ? (
          <Skeleton className="w-full h-86" /> 
        ) : (
          <CategoryStats categoryList={categoryList} totalIncome={totalIncome} />
        )}
      </div>
      <div className="p-7 border rounded-lg flex items-center h-auto">
        <CategoryChart categoryList={categoryList} />  {/* Pass category list to CategoryChart */}
      </div>
    </div>
  );

export default CategoryInfo