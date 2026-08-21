import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = [
  '#6366f1', '#f97316', '#10b981', '#ef4444', '#3b82f6',
  '#eab308', '#ec4899', '#14b8a6', '#8b5cf6', '#64748b',
];

/**
 * data: [{ category: 'Food', total: 1200 }, ...]
 */
const CategoryPieChart = ({ data }) => {
  const chartData = useMemo(
    () => ({
      labels: data.map((d) => d.category),
      datasets: [
        {
          data: data.map((d) => d.total),
          backgroundColor: data.map((_, i) => COLORS[i % COLORS.length]),
          borderWidth: 2,
          borderColor: '#ffffff',
        },
      ],
    }),
    [data]
  );

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: { boxWidth: 12, font: { size: 11 } },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const value = ctx.raw;
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const pct = total ? ((value / total) * 100).toFixed(1) : 0;
            return `${ctx.label}: ₹${value.toLocaleString('en-IN')} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h2 className="text-base font-semibold text-gray-800 mb-4">Expenses by Category</h2>
      <div className="h-72">
        {data.length === 0 ? (
          <p className="text-sm text-gray-400 text-center pt-24">No expense data yet.</p>
        ) : (
          <Doughnut data={chartData} options={options} />
        )}
      </div>
    </div>
  );
};

export default CategoryPieChart;
