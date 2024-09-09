"use client";
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement);

interface CategoryChartProps {
  categoryList: {
    name: string;
    totalExpenses: number;
  }[];
}

const CategoryChart: React.FC<CategoryChartProps> = ({ categoryList }) => {
  // Calculate total expenses
  const totalExpenses = categoryList.reduce((sum, category) => sum + (category.totalExpenses || 0), 0);

  // Define an array of colors for the chart
  const colors = [
    '#a569bd', '#5dade2', '#48c9b0', '#58d68d', '#f4d03f',
    '#f0b27a', '#ec7063', '#d7bde2', '#45b39d', '#f0b27a'
  ];

  // Prepare data for the chart
  const data = {
    labels: categoryList.map(category => category.name),
    datasets: [
      {
        label: 'Expense Distribution',
        data: categoryList.map(category => (category.totalExpenses || 0)),
        backgroundColor: colors.slice(0, categoryList.length), // Assign different colors to each segment
        borderColor: '#ffffff', // Border color of segments
        borderWidth: 1,
      }
    ]
  };

  // Options for the chart
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => {
            const label = tooltipItem.label || '';
            const value = tooltipItem.raw;
            const percentage = totalExpenses > 0 ? (value / totalExpenses * 100).toFixed(2) : '0.00';
            return `${label}: $${value.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="w-full h-[320px] flex items-center justify-center">  {/* Flexbox to center the chart */}
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default CategoryChart;
